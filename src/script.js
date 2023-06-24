//constants
let random_duration = 5

/*--------------variables ----------------------- */

let vodsAmt = 0
let url = window.location.origin
let fileNames = []

//needed for playlist
//{"vidname":"vidfullpath"}
let pathNames = {}

let playlists = []
let currentPlaylist = ""

//allows double click to play next
let expired
//prevents default on double clicking (zooming and such)
let touch_expire 

//limits the timeouts launched by random
let random_flag = 0
let amount = 0

let split = new Map()

let inFocus = false

let savedClip = []

let searchTerm = ""

/*------------------------------------------ */

//player 
let player = document.getElementById("player")


let randomIndex = () =>{
    return Math.floor(Math.random() * (vodsAmt - 1))
}

//----------------------FUNCTIONS ------------------------------

let fetchInfo = () => {
    fetch(url+"/files",{
        method:"GET",
    })
        .then((ret) => ret.json())
        .then((json) =>{
            pathNames= json.files
            fileNames = Object.keys(pathNames)
            vodsAmt = fileNames.length
            setPlaylistArray()
            setList()
            setPlaying(url + "/" + fileNames[randomIndex()])
    })
}

//sets the fileNames to that of the currently selected playlist
//updates the name as well
let setCurrentPlaylist = () =>{
    //not very clean
    let placeholder = "/"
    currentPlaylist != "" ? placeholder =currentPlaylist : false;
    document.getElementById("pp_value").innerHTML = placeholder
    let newFileNames = []
    for(let file of Object.values(pathNames)){
        let path = file.split('/').slice(0,-1).join('/')
        let fileName = file.split('/').slice(-1)[0]
        if(path === currentPlaylist){
            newFileNames.push(fileName)
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
    if(currentPlaylist == ""){
        currentPlaylist = playlists[0]
        setCurrentPlaylist()
    }
}

let setPlaying = (url, time = 0) =>{
    let playing = document.getElementById("playing")
    playing.innerHTML = url.split("/").slice(-1) 
    console.log(url)
    player.src = url + "/fetch"
    if(time != 0){
        player.currentTime = time
    }
}

let playPrev = () =>{
    let current = player.src
    let file = fileNames.findIndex((val) => current.includes(val))
    if (file == 0){
        file = fileNames.length
    }
    let next = fileNames[file-1]
    setPlaying(url + "/" + next)
    player.play()
}

let playNext = () =>{
    let current = player.src
    let file = fileNames.findIndex((val) => current.includes(val))
    if (file == fileNames.length - 1){
        file =-1 
    }
    let next = fileNames[file+1]
    setPlaying(url +"/" +  next)
    player.play()
}

let next_event = new Event("next")

//the click arg (bool) will stop random if button or KeyR clicked (basically toggles)
//the stop arg (bool) will stop random
let playRandom = (click, stop) => {
    if(!random_flag && click){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "green"
        random_flag = 1
    }
    else if(click || stop){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "red"
        random_flag = 0
        return
    }
    if(!random_flag) return
    let id = Math.floor(Math.random()*fileNames.length)
    setPlaying(url+ "/" + fileNames[id])
    player.addEventListener("loadedmetadata", () =>{
        let time = player.duration
        let randTime = Math.floor(Math.random()*time)
        player.currentTime = randTime
        amount++
        player.addEventListener('next', function () {
            playRandom()
        },{once:true})
        window.setTimeout(() =>{
            amount--
            if(amount == 0) player.dispatchEvent(next_event)
        },random_duration * 1000)
    }, {once:true})
}

//creates the list and their listeners
let setList = () => {
    let span = document.getElementById("list")         
    span.innerHTML = ""
    for(let line of Object.values(fileNames)){
        let link = document.createElement("p")
        link.addEventListener("click", () => {
            player.muted = true
            setPlaying(url + "/" + line)
        })
        link.id = line
        link.innerHTML = line 
        link.className = "link"
        if(searchTerm == ""){
            span.appendChild(link)
        }
        else if(link.id.toLowerCase().includes(searchTerm.toLowerCase())){
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
                openFullscreen()
            }
            else if(random_flag){
                playRandom()
            }
            else{
                playNext()
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
    console.log(timestamp)
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
    let currentPlaying = document.getElementById("playing").innerHTML
    let timestamp = player.currentTime
    if(savedClip.length < 10){
        savedClip.push([currentPlaying,timestamp])
    }
    else{
        savedClip.shift()
        savedClip.push([currentPlaying,timestamp])
    }

    let span = document.getElementById("under")         
    span.innerHTML = ""
    for(let line of savedClip){
        let link = document.createElement("p")
        link.addEventListener("click", () => {
            setPlaying(url + "/" + line[0], line[1])
        })
        link.innerHTML = line[0] + " - " + timestampToTime(line[1])
        span.appendChild(link)
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

let skip=(time)=>{
  player.currentTime = player.currentTime +time
}

function openFullscreen() {
    if(document.fullscreenElement){
        document.exitFullscreen() 
    }
    else if (player.requestFullscreen) {
        player.requestFullscreen();
    } else if (player.webkitRequestFullscreen) { /* Safari */
            player.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) { /* IE11 */
            player.msRequestFullscreen();
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
    if(c=="ArrowLeft"){
        skip(-15);
    }
    else if(e.ctrlKey && c.includes("Digit")){
        playSaved(c)
    }
    else if(c=="ArrowRight"){
        skip(15);
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
        random_flag ? player.dispatchEvent(next_event) : playNext()
    }
    else if(!e.ctrlKey && c=="KeyF"){
        openFullscreen()
    }
    else if(c=="Space"){
        e.preventDefault()
        player.paused ? player.play() : player.pause()
    }
    else if(c.includes("Digit")){
        let time = split.get(parseInt(c.slice(-1)))
        player.currentTime = time
    }

})

document.getElementById("slider").addEventListener("input", () =>{
    let slider = document.getElementById("slider")
    let randP = document.getElementById("randTime")    
    randP.innerHTML = slider.value
    random_duration = slider.value
})

document.getElementById("slider").value = random_duration
document.getElementById("randTime").innerHTML = random_duration

document.getElementById("search").addEventListener("input", (e) => {
    searchTerm = e.target.value
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

//run
fetchInfo()
