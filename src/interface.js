//contains all components
let container = document.getElementsByClassName("container")[0]
container.className = "splash-container"

function createList(){
    let listDiv = document.createElement("div") 
    listDiv.classList.add('right','splash-subhead')
    listDiv.id = 'list_container'
    let playlist_picker = document.createElement("div")
    playlist_picker.id = "playlist_picker_container"
    playlist_picker.className="picker_container"
    playlist_picker.innerHTML = `
        <p id="playlist_picker" > 
            <span id="pp_left" class="picker"> &#8592;</span>
            <span id="pp_value">  </span>
            <span id="pp_right" class="picker"> &#8594;</span>
        </p>
    `
    let search = document.createElement("div") 
    search.contentEditable = true
    search.setAttribute("datatext", "search")
    search.classList.add('search')
    search.id = 'search'
    //list of files
    let list = document.createElement("div") 
    list.className = 'list'
    list.id = 'list'
    //name of currently playing file
    let playing = document.createElement("div")
    playing.id = "playing"
    playing.classList.add("playing","splash-head")

    listDiv.appendChild(playing)
    listDiv.appendChild(playlist_picker)
    listDiv.appendChild(search)
    listDiv.appendChild(list)

    container.appendChild(listDiv)
}

function createButton(){
    let buttonDiv = document.createElement("div") 
    buttonDiv.className = "right"
    let random = document.createElement("button")
    random.id = "random"
    random.innerHTML = 'random'
    random.className = "pure-button"

    let shuffle = document.createElement("button")
    shuffle.id = "shuffle"
    shuffle.innerHTML = 'shuffle'
    shuffle.className = "pure-button"

    let save = document.createElement("button")
    save.id = "save"
    save.innerHTML = 'save'
    save.className = "pure-button"

    //sets the random clip duration
    let slider = document.createElement("div")
    slider.innerHTML= `<input type="range" min="1" max="100" class="slider" id="slider"><span id="randTime"></span>`

    buttonDiv.appendChild(random)
    buttonDiv.appendChild(shuffle)
    buttonDiv.appendChild(save)
    buttonDiv.appendChild(slider)

    container.appendChild(buttonDiv)
}
function createVideoSection(){
    let vid = document.createElement("div")
    vid.id ="video"
    vid.classList.add("left")

    let player_container = document.createElement("div")
    player_container.id ="player_container"
    player_container.classList.add("player_container")

    let player = document.createElement("video")
    player.id = "player"
    player.classList.add("videosize")
    player.controls = true
    player.autoplay = true
    player.muted = true
    
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
    player_container.appendChild(player)
    vid.appendChild(player_container)
    vid.appendChild(underVid)
    container.append(vid)
}

function spawnInterface(){
    createVideoSection()
    createButton()
    createList()
}

spawnInterface()
