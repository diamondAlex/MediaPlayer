let url = window.location.origin
let randDur = 5
let vodsAmt = 0

let randomIndex = () =>{
    return Math.floor(Math.random() * (vodsAmt - 1))
}

let player = videojs("player")
player.fill(true)
player.aspectRatio('20:9')
player.autoplay(true)
player.muted(true)
let split = new Map()

let setPlaying = (url) =>{
    let playing = document.getElementById("playing")
    playing.innerHTML = url + "<br>"
    
    player.src({
        type: "video/mp4",
        src: url 
    })
}


player.on("loadedmetadata", () => {
    let time = player.duration()
    for(i =0; i <=9;i++){
        split.set(48 + i,time*i/10)
    }
})

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

player.on("ended", () => {
    playNext()
})

let inFocus = false

forward=()=>{
  skip(15);
}

backward=()=>{
   skip(-15);
}

skip=(time)=>{
  player.currentTime(player.currentTime()+time)
}

player.on("mouseover", () => inFocus = true)
player.on("mouseleave", () => inFocus = false)

document.addEventListener("keydown", (e) => {
    let c = e.keyCode
    if(c==37){
        backward()
    }
    else if(c==39){
        forward()
    }
    else if(c==82){
        playRandom()
    }
    else if(c==78){
        if(random){
            player.trigger("foo") 
        }
        else{
            playNext()
        }
    }
    else if(c==66){
        playPrev()
    }
    else if(e.ctrlKey && c==83){
        e.preventDefault()
        shuffleList()
    }
    else if(!e.ctrlKey && c==70){
        if(!player.isFullscreen()){
            player.requestFullscreen()
        }
        else{
            player.exitFullscreen()
        }
    }
    else if(c==32){
        e.preventDefault()
        player.paused() ? player.play() : player.pause()
    }
    else if(c >= 48 && c <= 57){
        player.currentTime(split.get(c))
    }

})

let fileNames = []
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
        link.addEventListener("click", (e) => {
            player.muted(true)
            setPlaying(url + "/" + line)
        })

        link.innerHTML = line

        span.appendChild(link)
    }
}

fetchInfo()

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

document.getElementById("random").addEventListener("click", ()=>{
      playRandom()
})
document.getElementById("shuffle").addEventListener("click", ()=>{
      shuffleList()
})

let random = 0
let amount = 0

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
        },randDur * 1000)
    })
}

let expired

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

window.addEventListener("touchstart", doubleTouch)
