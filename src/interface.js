//contains all components
let container = document.getElementsByClassName("container")[0]

function createPopupDialog(){
    let dialog = document.createElement("dialog")
    dialog.innerHTML = `
        <textarea id="name"></textarea>
        <button id="submitName">submit</button>
        `
    dialog.id = 'dialog'

    container.appendChild(dialog)
}

function createList(){
    //terrible naming
    let listDiv = document.createElement("div") 
    listDiv.className = 'right'
    listDiv.id = 'list_container'
    //list of files
    let list = document.createElement("div") 
    list.className = 'links_list'
    list.id = 'list'
    //name of currently playing file
    let playing = document.createElement("p")
    playing.id = "playing"
    playing.classList.add("playing")

    listDiv.appendChild(playing)
    listDiv.appendChild(list)

    container.appendChild(listDiv)
}

function createButton(){
    let buttonDiv = document.createElement("div") 
    let button1 = document.createElement("button")
    button1.id = "random"
    button1.innerHTML = 'random'

    let button2 = document.createElement("button")
    button2.id = "shuffle"
    button2.innerHTML = 'shuffle'

    //sets the random clip duration
    let slider = document.createElement("div")
    slider.innerHTML= `<input type="range" min="1" max="100" value="50" class="slider" id="slider"><p id="randTime"></p>`

    buttonDiv.appendChild(button1)
    buttonDiv.appendChild(button2)
    buttonDiv.appendChild(slider)

    container.appendChild(buttonDiv)
}
function createVideoSection(){
    let vid = document.createElement("div")
    vid.id ="vidplayer"
    vid.className ="left"
    vid.innerHTML = `
        <video
            id="player"
            class="video-js"
            controls
            preload="auto"
            data-setup='{}'>
        </video>
    `
    let underVid = document.createElement("div")
    underVid.innerHTML = "TEST"
    underVid.id = "under"

    vid.appendChild(underVid)
    container.append(vid)
}

function spawnInterface(){
    createVideoSection()
    createButton()
    createList()
    createPopupDialog()
}

spawnInterface()
