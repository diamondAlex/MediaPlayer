//constants
let random_duration = 5

//variables
let vodsAmt = 0
let url = window.location.origin
let fileNames = []
let expired
//limits the timeouts launched by random
let random_flag = 0
let amount = 0

let split = new Map()

//used to communicate names with dialog box
let newName =""
let currentName =""
let dialogOpen = false

let inFocus = false

//player 
let player = videojs("player")
    player.fill(true)
    player.aspectRatio('20:9')
    player.autoplay(true)
    player.muted(true)


let randomIndex = () =>{
    return Math.floor(Math.random() * (vodsAmt - 1))
}

//----------------------FUNCTIONS ------------------------------
let setPlaying = (url, time = 0) =>{
    let playing = document.getElementById("playing")
    playing.innerHTML = url.split("/").slice(-1) 
    player.src({
        type: "video/mp4",
        src: url + "/fetch"
    })
    if(time != 0){
        player.currentTime(time)
    }
}

let playPrev = () =>{
    let current = player.lastSource_.player
    let file = fileNames.findIndex((val) => current.includes(val))
    if (file == 0){
        file = fileNames.length
    }
    let next = fileNames[file-1]
    setPlaying(url + "/" + next)
    player.play()
}

let playNext = () =>{
    let current = player.lastSource_.player
    let file = fileNames.findIndex((val) => current.includes(val))
    if (file == fileNames.length - 1){
        file =-1 
    }
    let next = fileNames[file+1]
    setPlaying(url +"/" +  next)
    player.play()
}

//the click arg will stop random if button or KeyR clicked
let playRandom = (click) => {
    if(!random_flag && click){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "green"
        random_flag = 1
    }
    else if(click){
        let button = document.getElementById("random") 
        button.style.backgroundColor = "red"
        random_flag = 0
        return
    }
    if(!random_flag) return
    let id = Math.floor(Math.random()*fileNames.length)
    setPlaying(url+ "/" + fileNames[id])
    player.one("loadedmetadata", () =>{
        console.log(random_duration)
        let time = player.duration()
        let randTime = Math.floor(Math.random()*time)
        player.currentTime(randTime)
        amount++
        player.one('next', function () {
            playRandom()
        })
        window.setTimeout(() =>{
            amount--
            if(amount == 0) player.trigger("next") 
        },random_duration * 1000)
    })
}

let fetchInfo = () => {
    fetch(url+"/files",{
        method:"GET",
    })
        .then((ret) => ret.json())
        .then((json) =>{
            fileNames = Object.keys(json.files)
            vodsAmt = fileNames.length
            setList()
            setPlaying(url + "/" + fileNames[randomIndex()])
    })
}

let updateName = () => {
    let index = fileNames.findIndex((e) => e == currentName)
    fileNames[index] = newName
    let body = {
        to:newName,
        from:currentName
    }
    fetch(url+"/updatename",{
        method:"post",
        body: JSON.stringify(body) 
    })
}

//creates the list and their listeners
let setList = () => {
    let span = document.getElementById("list")         
    span.innerHTML = ""
    for(let line of fileNames){
        let linkC = document.createElement("p")
        let link = document.createElement("span")
        link.addEventListener("click", () => {
            player.muted(true)
            setPlaying(url + "/" + line)
        })
        let edit = document.createElement("button")
        edit.innerHTML = "edit"
        edit.addEventListener("click", () =>{
            currentName = line 
            let dialog = document.getElementById("dialog")
            dialog.showModal()
            dialogOpen = true
        })
        link.id = line
        link.innerHTML = line + " - " 
        linkC.appendChild(link)
        linkC.appendChild(edit)
        span.appendChild(linkC)
    }
}

let doubleTouch = function (e) {
    e.preventDefault()
    if (e.touches.length === 1) {
        if (!expired) {
            expired = e.timeStamp + 400
        } else if (e.timeStamp <= expired) {
            // remove the default of this event ( Zoom )
            playNext()
            // then reset the variable for other "double Touches" event
            expired = null
        } else {
            // if the second touch was expired, make it as it's the first
            expired = e.timeStamp + 400
        }
    }
}

let savedClip = []
function saveClip(){
    let currentPlaying = document.getElementById("playing").innerHTML
    let timestamp = player.currentTime()
    savedClip.push([currentPlaying,timestamp])

    let span = document.getElementById("under")         
    span.innerHTML = ""
    for(let line of savedClip){
        let link = document.createElement("p")
        link.addEventListener("click", () => {
            setPlaying(url + "/" + line[0], line[1])
        })
        link.innerHTML = line[0] + " - " + line[1]
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
  player.currentTime(player.currentTime()+time)
}

//----------------------EVENTS-------------------------------
player.on("loadedmetadata", () => {
    let time = player.duration()
    for(let i =0; i <=9;i++){
        split.set(i,time*i/10)
    }
})

player.on("ended", () => playNext())
//for later use
player.on("mouseover", () => inFocus = true)
player.on("mouseleave", () => inFocus = false)

window.addEventListener("touchstart", doubleTouch)

document.getElementById("random").addEventListener("click",()=>playRandom(1))
document.getElementById("shuffle").addEventListener("click",()=>shuffleList())

document.addEventListener("keydown", (e) => {
    if(dialogOpen) return
    let c = e.code
    if(c=="ArrowLeft"){
        skip(-15);
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
        random_flag ? player.trigger("next") : playNext()
    }
    else if(!e.ctrlKey && c=="KeyF"){
        !player.isFullscreen() ? 
            player.requestFullscreen() : player.exitFullscreen()
    }
    else if(c=="Space"){
        e.preventDefault()
        player.paused() ? player.play() : player.pause()
    }
    else if(c.includes("Digit")){
        let time = split.get(parseInt(c.slice(-1)))
        player.currentTime(time)
    }

})

document.getElementById("submitName").addEventListener("click", updateName)

document.getElementById("slider").addEventListener("input", () =>{
    let slider = document.getElementById("slider")
    let randP = document.getElementById("randTime")    
    randP.innerHTML = slider.value
    random_duration = slider.value
})
document.getElementById("dialog").addEventListener("close", () => {
    dialogOpen = false
})

//run
fetchInfo()
