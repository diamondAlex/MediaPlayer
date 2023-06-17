//contains all components
let container = document.getElementsByClassName("container")[0]
container.className = "splash-container"

function createPopupDialog(){
    let dialog = document.createElement("dialog")
    dialog.innerHTML = `
        <textarea id="dialogName"></textarea>
        <button id="submitName">submit</button>
        `
    dialog.id = 'dialog'

    container.appendChild(dialog)
}

function createList(){
    //terrible naming
    let listDiv = document.createElement("div") 
    listDiv.classList.add('right','splash-subhead')
    listDiv.id = 'list_container'
    //list of files
    let search = document.createElement("textarea") 
    search.className = 'links_list'
    search.id = 'search'
    //list of files
    let list = document.createElement("div") 
    list.className = 'links_list'
    list.id = 'list'
    //name of currently playing file
    let playDiv = document.createElement("div")
    let playing = document.createElement("div")
    playing.id = "playing"
    playing.classList.add("playing","splash-head")
    //WILL NEED TO FIX THIS
    //let button1 = document.createElement("button")
    //button1.id = "edithead"
    //button1.innerHTML = 'edit'
    //button1.className = "edit"
    //playDiv.appendChild(button1)

    playDiv.appendChild(playing)
    listDiv.appendChild(playDiv)
    listDiv.appendChild(search)
    listDiv.appendChild(list)

    container.appendChild(listDiv)
}

function createButton(){
    let buttonDiv = document.createElement("div") 
    buttonDiv.className = "right"
    let button1 = document.createElement("button")
    button1.id = "random"
    button1.innerHTML = 'random'
    button1.className = "pure-button"

    let button2 = document.createElement("button")
    button2.id = "shuffle"
    button2.innerHTML = 'shuffle'
    button2.className = "pure-button"

    let button3 = document.createElement("button")
    button3.id = "save"
    button3.innerHTML = 'save'
    button3.className = "pure-button"

    //sets the random clip duration
    let slider = document.createElement("div")
    slider.innerHTML= `<input type="range" min="1" max="100" value="50" class="slider" id="slider"><span id="randTime"> 50 </span>`

    buttonDiv.appendChild(button1)
    buttonDiv.appendChild(button2)
    buttonDiv.appendChild(button3)
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
    //need to be renamed to some saving specific name
    let underVid = document.createElement("div")
    underVid.className = "splash-under"
    let p = document.createElement("p")
    p.innerHTML = "Saved:"
    p.className="splash-underhead"
    let underList = document.createElement("div")
    underList.className = "splash-underlist"
    underList.id = "under"

    underVid.appendChild(p)
    underVid.appendChild(underList)
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
