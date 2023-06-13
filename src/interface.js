function spawnInterface(){
    //contains all components
    let container = document.getElementsByClassName("container")[0]

    let div = document.createElement("div") 
    let button1 = document.createElement("button")
    button1.id = "random"
    button1.innerHTML = 'random'
    let button2 = document.createElement("button")
    button2.id = "shuffle"
    button2.innerHTML = 'shuffle'

    //terrible naming
    let div2 = document.createElement("div") 
    div2.className = 'two'
    div2.id = 'list_container'
    //list of files
    let list = document.createElement("div") 
    list.className = 'links_list'
    list.id = 'list'
    //name of currently playing file
    let playing = document.createElement("p")
    playing.id = "playing"
    playing.classList.add("playing")

    let dialog = document.createElement("dialog")
    dialog.innerHTML = `
        <textarea id="name"></textarea>
        <button id="submitName" onclick="setNewName()">submit</button>
        `
    dialog.id = 'dialog'
    let slider = document.createElement("div")
    div.innerHTML= `<input type="range" min="1" max="100" value="50" class="slider" id="slider"><p id="randTime"></p>`


    div.appendChild(dialog)

    div2.appendChild(playing)
    div2.appendChild(list)
    div.appendChild(button1)
    div.appendChild(button2)
    div.appendChild(slider)
    container.appendChild(div)
    container.appendChild(div2)

    let under = document.createElement("div")
    under.innerHTML = "TEST"
    under.id = "under"
    let vid = document.getElementById("vidplayer")
    vid.appendChild(under)
}

spawnInterface()
