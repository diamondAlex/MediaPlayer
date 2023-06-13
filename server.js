var http = require('http');
var fs = require('fs');
const { list } = require('pm2');

let vodPath = "vods/"

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let path = req.url.replaceAll("%20"," ")

    if(path == '/'){
        let page = fs.readFileSync("src/test.html")
        res.write(page)
        res.end()
    }
    else if(path == "/updatename"){
        req.on('data', (data) => {
            let json = JSON.parse(data)
            updateAssociation(json)
            res.end()
        })
    }
    else if(path.includes("/fetch")){
        let formattedPath = path.split('/')[1]
        console.log(formattedPath)
        let name =  getFromAssociation(formattedPath)
        console.log(name)
        video(req,res,name)
    }
    else if(path == "/files"){
        let files = listFiles()
        let json = JSON.stringify({files:files})
        res.write(json)
        res.end(); 
    }
    else{
        let page = fs.readFileSync("src" + path)
        res.write(page)
        res.end()
    }
}).listen(8080, () => console.log("connected on 8080")); //the server object listens on port 8080

let video = (req,res,path) => {
    try{
        let range = req.headers.range;
        if (!range) {
            res.status = 400
        }
        let videoPath = require('path').join(__dirname,vodPath, path)
        let videoSize = fs.statSync(videoPath).size;
        let CHUNK_SIZE = 10 ** 6;
        //replaces all char that are not digits
        let start = Number(range.replace(/\D/g, ""));
        let end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        let contentLength = end - start + 1;
        let headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        let videoStream = fs.createReadStream(videoPath, { start,end });
        videoStream.pipe(res); 
    }
    catch(err){
        console.log(err)
    }
}

let listFiles = () =>{
    return getAssociativeList()
}

let listPath = "./local/association.json"
//this is awful
function getAssociativeList(){
    try{
        let associations = fs.readFileSync(listPath)
        if(!associations.toString()){
            populateList()
            fs.writeFileSync(listPath, JSON.stringify(associations))
            getAssociativeList()
            return
        }
        else{
            return JSON.parse(associations)
        }
    }
    catch(err){
        if(err.errno == -2){
            let associations = populateList()
            fs.writeFileSync(listPath, JSON.stringify(associations))
            //this is mighty dangerous
            getAssociativeList()
            return
        }
        else{
            console.log(err)
        }
    }
}

function populateList(){
    let files = fs.readdirSync(vodPath)
    let associations = {}
    for(let file of files){
        //monstrous
        try{
            fs.readdirSync(vodPath + file)
        }
        catch(err){
            associations[file] = file
        }
    }
    return associations
}

function getFromAssociation(name){
    let list = getAssociativeList()
    console.log(list)
    return list[name]
}

function updateAssociation(nameInfo){
    let associations = getAssociativeList()
    let newName = nameInfo.to
    let oldName = nameInfo.from
    let path = associations[oldName]
    delete associations[oldName]
    associations[newName] = path
    fs.writeFileSync(listPath, JSON.stringify(associations))
}
