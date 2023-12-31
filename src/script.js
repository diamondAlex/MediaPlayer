//constants
let random_duration = 5

/*--------------variables ----------------------- */


//could be the index instead?
let currentlyPlaying = ""

//{"vidname":"vidfullpath"}
let pathNames = {}
//[[vidname, timestamp],...]
let fileNames = []

let playlists = []
let currentPlaylist = ""

//allows double click to play next
let expired
//prevents default on double clicking (zooming and such)
let touch_expire 

//limits the timeouts launched by random
let random_flag = 0
let random_flush = 0

let split = new Map()

let inFocus = false

let savedClip = []

let searchTerm = ""

let skipTime = 5

/*------------------------------------------ */

//player 
let player = document.getElementById("player")


//only used to set a random starting video
//is that even good?
let randomIndex = () =>{
    return Math.floor(Math.random() * (fileNames.length - 1))
}

//----------------------FUNCTIONS ------------------------------

let fetchInfo = () => {
    let url = window.location.origin
    fetchSavedList()
    .then(() => {
        fetch(url+"/files",{
            method:"GET",
        })
            .then((ret) => ret.json())
            .then((json) =>{
                //dubious way of adding saved list
                playlists.push("saved")      
                pathNames= json.files
                fileNames = Object.keys(pathNames).map((e) => [e,0])
                setPlaylistArray()
                setList()
                let vid = fileNames[randomIndex()]
                setPlaying(vid)
        })
    })
}

async function fetchSavedList(){
    let url = window.location.origin
    let ret = await fetch(url+"/savedlist",{
        method:"GET",
    })
    try{
        let json = await ret.json()
        let newList = []
        for(let clip of json){
            newList.push([clip.video,parseFloat(clip.time)])               
        }
        savedClip = newList
        updateSavedClipList()
    }
    catch(err){
        console.log("no savedClip") 
    }
}

//sets the fileNames to that of the currently selected playlist
//updates the name as well
let setCurrentPlaylist = () =>{
    //not very clean
    let placeholder = "/"
    currentPlaylist != "" ? placeholder =currentPlaylist : false;
    document.getElementById("pp_value").innerHTML = placeholder
    let newFileNames = []
    if(currentPlaylist == 'saved' && savedClip.length != 0){
        for(let clip of savedClip){
            newFileNames.push(clip)
        }
    }
    else{
        for(let file of Object.values(pathNames)){
            let path = file.split('/').slice(0,-1).join('/')
            let fileName = [file.split('/').slice(-1)[0],0]
            if(path === currentPlaylist){
                newFileNames.push(fileName)
            }
        }
    }

    fileNames = newFileNames
    setList()
}

//takes the initial data from the server and converts it to playlists
let setPlaylistArray = () => {
    let paths = Object.values(pathNames)
    paths.forEach((e) => {
        let path = e.split('/').slice(0,-1).join('/')

        if(!playlists.includes(path)){
            playlists.push(path) 
        }
    })
    setCurrentPlaylist()
}

let setPlaying = async (video, time = 0) =>{
    let [name, timestamp] = video
    let url = window.location.origin
    if(!timestamp){
        timestamp = time
    }
    let playing = document.getElementById("playing")
    let vidUrl = url + "/" + name + "/fetch"

    let res = parseInt(await (await fetch(url+"/exists/"+name)).text())

    if(Hls.isSupported() && res) {
        var hls = new Hls();
        playing.innerHTML = name
        currentlyPlaying = name
        hls.loadSource(vidUrl + "/m3");
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            player.play();
            if(timestamp != 0){
                player.currentTime = timestamp
            }
        });
    }
    else{
        currentlyPlaying = name
        playing.innerHTML = name
        player.src = vidUrl + "/mp4" 
        if(timestamp != 0){
            player.currentTime = timestamp
        }
    }
}

let skip=(time)=>{
  player.currentTime = player.currentTime +time
}

let playPrev = () =>{
    let file = fileNames.findIndex((val) => currentlyPlaying.includes(val[0]))
    if (file == 0){
        file = fileNames.length
    }
    let next = fileNames[file-1]
    setPlaying(next)
    player.play()
}

let playNext = () =>{
    let current = player.src
    let file = fileNames.findIndex((val) => currentlyPlaying.includes(val[0]))
    if (file == fileNames.length - 1){
        file =-1 
    }
    let next = fileNames[file+1]
    setPlaying(next)
    player.play()
}

let next_event = new Event("next")
let currentTimeout = null

//the click arg (bool) will stop random if button or KeyR clicked (basically toggles)
//the stop arg (bool) will stop random
//lots of complexity to this guy
let playRandom = (click, stop) => {
    //starts random if button or shortcut clicked
    if(!random_flag && click){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "green"
        random_flag = 1
    }
    //stops random if clicked or any function calls for it to stop
    else if(click || stop){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "red"
        random_flag = 0
        return
    }
    //somehow not supposed to be called?
    if(!random_flag) return

    let id = randomIndex()
    setPlaying(fileNames[id])

    player.addEventListener("loadedmetadata", () =>{
        let time = player.duration
        let randTime = Math.floor(Math.random()*time)
        player.currentTime = randTime
        //once the event is called, it'll run the next random
        player.addEventListener('next', function () {
            playRandom()
        },{once:true})
        //this is run after the random_duration unless user clicks next
        currentTimeout = window.setTimeout(() => {
            player.dispatchEvent(next_event)
        },random_duration * 1000)
    }, {once:true})
}


//creates the list and their listeners
let setList = () => {
    let span = document.getElementById("list")         
    span.innerHTML = ""
    for(let line of Object.values(fileNames)){
        let name = line[0]
        let img = document.createElement("img")
        img.data_src = "thumbnails/" + name
        img.className = "thumbnail"
        let link = document.createElement("p")
        let linkSpan = document.createElement("list")         
        link.addEventListener("click", () => {
            player.muted = true
            setPlaying(line)
        })
        linkSpan.id = name
        if(line[1] != 0){
            name = name + ' - ' + timestampToTime(line[1])
        }
        linkSpan.innerHTML = name 
        linkSpan.className = "link"
        link.className = "linkbox"
        link.appendChild(img)
        link.appendChild(linkSpan)
        observer.observe(img)
        //this is confusing
        if(searchTerm == ""){
            span.appendChild(link)
        }
        else if(linkSpan.id.toLowerCase().includes(searchTerm.toLowerCase())){
            span.appendChild(link)
        }
    }
}

let stopZoom = function(e) {
    if (e.touches.length === 0) {
        if (!touch_expire) {
            touch_expire = e.timeStamp + 400
        } else if (e.timeStamp <= touch_expire) {
            e.preventDefault()
        } else {
            // if the second touch was touch_expire, make it as it's the first
            touch_expire = e.timeStamp + 400
        }
    }
}

let doubleTouch = function (e) {
    if (e.touches.length === 1) {
        if (!expired) {
            expired = e.timeStamp + 400
        } else if (e.timeStamp <= expired) {
            // only next if double click player
            if(!document.fullscreenElement){
                toggleFullscreen()
            }
            else{
                toggleFullscreen()
            }
            expired = null
            // then reset the variable for other "double Touches" event
        } else {
            // if the second touch was expired, make it as it's the first
            expired = e.timeStamp + 400
        }
    }
}

function timestampToTime(timestamp){
    let seconds = Math.floor(timestamp % 60)
    seconds = seconds < 10 ? seconds.toString().padStart(2,"0") : seconds.toString();
    let minutes = Math.floor(timestamp%3600/60)
    minutes = minutes < 10 ? minutes.toString().padStart(2,"0") : minutes.toString();
    //won't handle stuff that's too long, but who cares
    let hours = Math.floor(timestamp/(60*60))
    hours = hours < 10 ? hours.toString().padStart(2,"0") : hours.toString();
    return hours + ":" + minutes + ":" + seconds
}

function playSaved(key){
    playRandom(false, true)
    let index = parseInt(key.slice(-1)) - 1
    if(savedClip[index]){
        setPlaying(savedClip[index][0], savedClip[index][1])
    }
}

function saveClip(){
    let url = window.location.origin
    let currentPlaying = document.getElementById("playing").innerHTML
    let timestamp = player.currentTime

    savedClip.push([currentPlaying,timestamp])

    updateSavedClipList()

    //saving list on server
    let formattedUrl = url + "/" + currentPlaying+"__"+timestamp+"/save"
    fetch(formattedUrl)
}

function delFromSaved(clipName){
    let url = window.location.origin
    let index = savedClip.findIndex((e) => e[0] == clipName[0] && e[1] == clipName[1])
    let clipToDel = savedClip[index]
    let formattedUrl = url + "/" + clipToDel[0] +"__"+clipToDel[1]+"/del"
    fetch(formattedUrl)
    .then(() =>{
        fetchSavedList()
    })
}

function updateSavedClipList(){
    let span = document.getElementById("under")         
    span.innerHTML = ""
    for(let line of savedClip){
        let linkContainer = document.createElement("p")
        let link = document.createElement("span")
        link.addEventListener("click", () => {
            setPlaying(line)
        })
        link.innerHTML = line[0] + " - " + timestampToTime(line[1])

        let button = document.createElement("button")
        button.addEventListener("click", () =>{
            delFromSaved(line) 
        })
        button.innerHTML = "X"
        button.className = "del"

        linkContainer.appendChild(link)
        linkContainer.appendChild(button)

        span.appendChild(linkContainer)
    }
    if(currentPlaylist == 'saved'){
        setCurrentPlaylist()
    }
}

function shuffleList(){
    let shuffletimes = fileNames.length * 2
    for(let i = 0;i < shuffletimes; i++){
        let index = randomIndex()
        let index2 = randomIndex()
        let temp = fileNames[index]
        fileNames[index] = fileNames[index2]
        fileNames[index2] = temp
    }
    setList()
}

function toggleFullscreen() {
    let div = document.getElementById("player_container")
    if(document.fullscreenElement){
        document.exitFullscreen() 
    }
    else if (player.requestFullscreen) {
        div.requestFullscreen();
    } else if (player.webkitRequestFullscreen) { /* Safari */
        div.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) { /* IE11 */
        div.msRequestFullscreen();
    }
}

//----------------------EVENTS-------------------------------
player.addEventListener("loadedmetadata", () => {
    let time = player.duration
    for(let i =0; i <=9;i++){
        split.set(i,time*i/10)
    }
})

player.addEventListener("ended", () => playNext())
//for later use
player.addEventListener("mouseover", () => inFocus = true)
player.addEventListener("mouseleave", () => inFocus = false)


window.addEventListener("touchstart", doubleTouch)
window.addEventListener("touchend", stopZoom)

document.getElementById("random").addEventListener("click",()=>playRandom(1))
document.getElementById("shuffle").addEventListener("click",()=>shuffleList())
document.getElementById("save").addEventListener("click",()=>saveClip())

document.addEventListener("keydown", (e) => {
    if(document.activeElement.id == 'search') return
    let c = e.code
    console.log(c)
    if(c=="ArrowLeft"){
        skip(-skipTime);
    }
    else if(e.ctrlKey && c.includes("Digit")){
        playSaved(c)
    }
    else if(c=="ArrowRight"){
        skip(skipTime);
    }
    else if(!e.ctrlKey && c=="KeyR"){
        playRandom(1)
    }
    else if(c=="KeyB"){
        playPrev()
    }
    else if(e.ctrlKey && c=="KeyS"){
        e.preventDefault()
        shuffleList()
    }
    else if(c=="KeyS"){
        saveClip()
    }
    else if(c=="KeyN"){
        if(random_flag){
            clearTimeout(currentTimeout) 
            player.dispatchEvent(next_event) 
        }else{
            playNext()
        }
    }
    else if(!e.ctrlKey && c=="KeyF"){
        toggleFullscreen()
    }
    else if(c=="Space"){
        e.preventDefault()
        player.paused ? player.play() : player.pause()
    }
    else if(c.includes("Digit")){
        let time = split.get(parseInt(c.slice(-1)))
        player.currentTime = time
    }
    else if(c.includes("Numpad")){
        let last = c.slice(-1)
        if(parseInt(last)){
            let time = split.get(parseInt(c.slice(-1)))
            player.currentTime = time
        }
    }

})

document.getElementById("slider").addEventListener("input", () =>{
    let slider = document.getElementById("slider")
    let randP = document.getElementById("randTime")    
    randP.innerHTML = slider.value
    random_duration = slider.value
    random_flush = 1
})

document.getElementById("slider").value = random_duration
document.getElementById("randTime").innerHTML = random_duration

document.getElementById("search").addEventListener("input", (e) => {
    searchTerm = e.target.innerHTML
    setList()
})

document.getElementById("pp_left").addEventListener("click", (e) => {
    let current_index = playlists.indexOf(currentPlaylist)
    if(current_index - 1 < 0){
        currentPlaylist = playlists[playlists.length-1]
    }
    else{
        currentPlaylist = playlists[current_index-1]
    }
    setCurrentPlaylist()
})

document.getElementById("pp_right").addEventListener("click", (e) => {
    let current_index = playlists.indexOf(currentPlaylist)
    if(current_index + 1 >= playlists.length){
        currentPlaylist = playlists[0]
    }
    else{
        currentPlaylist = playlists[current_index+1]
    }
    setCurrentPlaylist()
})

document.getElementById("player").addEventListener("mouseover", (e) =>{
    let test = document.getElementById("over")
    test.style["display"] = "inline"
})

document.getElementById("player").addEventListener("mouseleave", (e) =>{
    let element = document.elementFromPoint(e.clientX,e.clientY)
    if(!element.id.includes("over")){
        let test = document.getElementById("over")
        test.style["display"] = "none"
    }

})

document.getElementById("player").addEventListener("touchstart", (e) =>{
    if(closeOver != 0){
        clearTimeout(closeOver) 
        closeOver = 0
    }
    setTimeout(() => {
        let test = document.getElementById("over")
        test.style["display"] = "inline"
    },500)
})

let closeOver = 0

//it would be cool if it could behave like the player's control but w/e for now
document.getElementById("player").addEventListener("touchend", (e) =>{
    closeOver = window.setTimeout(() => {
        let test = document.getElementById("over")
        test.style["display"] = "none"
    },2000)
})

//so bloated
document.getElementById("saveover").addEventListener("click", (e) =>{
    saveClip()
})

document.getElementById("nextover").addEventListener("click", (e) =>{
    if(random_flag){
        clearTimeout(currentTimeout) 
        player.dispatchEvent(next_event) 
    }
    else{
        playNext()
    }
})

document.getElementById("prevover").addEventListener("click", (e) =>{
    playPrev()
})


player.addEventListener("dblclick", (e) =>{
    toggleFullscreen()
})

let options = {
    root: document.getElementById("list_container"),
    rootMargin: "0px",
    threshold: 0.0,
};

let observer = new IntersectionObserver((entries, observer) =>{
    entries.forEach((entry) => {
        if(entry.target.src == "" && entry.isIntersecting){
            entry.target.src = entry.target.data_src
        }
    })
},options)

//run
fetchInfo()
