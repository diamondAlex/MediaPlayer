let ip = "http://192.168.1.13:8080/"
let ip2 = "http://192.168.0.113:8080/"
let url
let randDur = 5

ping(ip)

function ping(ip) {

    fetch(ip2)
    .then((res) => res.json())
    .then((json) =>{
        if(json){
            url = ip2
            randDur = 20
            fetchInfo()
        }
        fetch(ip)
        .then((res) => res.json())
        .then((json) =>{
            if(json){
                randDur = 5
                url = ip
                fetchInfo()
            }
        })
    })
}


let player = videojs("player")
player.fill(true)
player.aspectRatio('20:9')
player.autoplay(true)
player.muted(false)
let split = new Map()

let span = document.getElementById('list')
let playing = document.createElement("p")
playing.id = "playing"
playing.classList.add("playing")
span.appendChild(playing)

let setPlaying = (url) =>{
    document.getElementById("playing")
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

    setPlaying(url + next.substring(1))

    player.play()
}

let playNext = () =>{
    let current = player.lastSource_.player
    let file = fileNames.findIndex((val) => current.includes(val))
    if (file == fileNames.length - 1){
        file =-1 
    }
    let next = fileNames[file+1]


    setPlaying(url + next.substring(1))
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
console.log('test')

document.addEventListener("keydown", (e) => {
    let c = e.keyCode
    console.log('test')
    console.log('test')
    console.log('test')
    console.log('test')
    console.log('test')
    console.log(c)
    console.log(e.ctrlKey)
    console.log('test')
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
    
    fetch(url,{
        method:"GET",
    })
        .then((ret) => ret.json())
        .then((json) =>{
            let span = document.getElementById("list")         
            fileNames = json.files
            for(let line of json.files){
                let link = document.createElement("p")
                link.addEventListener("click", (e) => {
                    player.muted(true)
                    setPlaying(url + line.substring(1))
                })

                link.innerHTML = line

                span.appendChild(link)
            }
    })
}


document.getElementById("rand").addEventListener("click", ()=>{
      playRandom()
})

let random = 0
let amount = 0

let playRandom = () => {
    random = 1
    let id = Math.floor(Math.random()*fileNames.length)
    setPlaying(url+ fileNames[id].substring(1))
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
                console.log("2+ in queue") 
            }
            else{
                console.log("trigger")
                player.trigger("foo") 
            }
        },randDur * 1000)
    })
}
