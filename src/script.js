//constants
const RANDOM_DURATION = 5

//variables
let vodsAmt = 0
let url = window.location.origin
let inFocus = false
let fileNames = []
let expired
let random = 0
let amount = 0
let split = new Map()

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
let setPlaying = (url) =>{
    let playing = document.getElementById("playing")
    playing.innerHTML = url.split("/").slice(-1) + "<br>"
    player.src({
        type: "video/mp4",
        src: url 
    })
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

let playRandom = () => {
    random = 1
    let id = Math.floor(Math.random()*fileNames.length)
    setPlaying(url+ "/" + fileNames[id])
    player.one("loadedmetadata", () =>{
        let time = player.duration()
        let randTime = Math.floor(Math.random()*time)
        player.currentTime(randTime)

        amount++

        player.one('foo', function () {
            playRandom()
        })

        window.setTimeout(() =>{
            amount--
            if(amount != 0){
            }
            else{
                player.trigger("foo") 
            }
        },RANDOM_DURATION * 1000)
    })
}

let fetchInfo = () => {
    fetch(url+"/files",{
        method:"GET",
    })
        .then((ret) => ret.json())
        .then((json) =>{
            let span = document.getElementById("list")         
            fileNames = json.files
            vodsAmt = fileNames.length
            setList(span)
            setPlaying(url + "/" + fileNames[randomIndex()])
    })
}

let setList = (span) => {
    span.innerHTML = ""
    for(let line of fileNames){
        let link = document.createElement("p")
        link.addEventListener("click", () => {
            player.muted(true)
            setPlaying(url + "/" + line)
        })

        link.innerHTML = line

        span.appendChild(link)
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

function shuffleList(){
    let shuffletimes = fileNames.length * 2
    for(i = 0;i < shuffletimes; i++){
        let index = randomIndex()
        let index2 = randomIndex()
        temp = fileNames[index]
        fileNames[index] = fileNames[index2]
        fileNames[index2] = temp
    }
    setList(document.getElementById("list")) 
}

let skip=(time)=>{
  player.currentTime(player.currentTime()+time)
}

//----------------------EVENTS-------------------------------
player.on("loadedmetadata", () => {
    let time = player.duration()
    for(i =0; i <=9;i++){
        split.set(i,time*i/10)
    }
})

player.on("ended", () => playNext())
player.on("mouseover", () => inFocus = true)
player.on("mouseleave", () => inFocus = false)

window.addEventListener("touchstart", doubleTouch)

document.getElementById("random").addEventListener("click",()=>playRandom())
document.getElementById("shuffle").addEventListener("click",()=>shuffleList())

document.addEventListener("keydown", (e) => {
    let c = e.code
    console.log(c)
    //arrow <-
    if(c=="ArrowLeft"){
        skip(-15);
    }
    //arrow ->
    else if(c=="ArrowRight"){
        skip(15);
    }
    //r 
    else if(!e.ctrlKey && c=="KeyR"){
        playRandom()
    }
    //b
    else if(c=="KeyB"){
        playPrev()
    }
    //s
    else if(e.ctrlKey && c=="KeyS"){
        e.preventDefault()
        shuffleList()
    }
    //n
    else if(c=="KeyN"){
        random ? player.trigger("foo") : playNext()
    }
    //f
    else if(!e.ctrlKey && c=="KeyF"){
        !player.isFullscreen() ? 
            player.requestFullscreen() : player.exitFullscreen()
    }
    //space
    else if(c=="Space"){
        e.preventDefault()
        player.paused() ? player.play() : player.pause()
    }
    //0-9
    else if(c.includes("Digit")){
        let time = split.get(parseInt(c.slice(-1)))
        player.currentTime(time)
    }

})

//run
fetchInfo()
