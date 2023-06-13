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
    list.className = 'two'
    list.id = 'list'
    //name of currently playing file
    let playing = document.createElement("p")
    playing.id = "playing"
    playing.classList.add("playing")

    div2.appendChild(playing)
    div2.appendChild(list)
    div.appendChild(button1)
    div.appendChild(button2)
    container.appendChild(div)
    container.appendChild(div2)
}

spawnInterface()
