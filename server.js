#!/usr/bin/env node
const http = require('http');
const path = require('path');
const fs = require('fs');
const { callbackify } = require('util');

let vodPath = "vods"

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader("Content-Security-Policy", "script-src 'self'")

    let path = req.url.replaceAll("%20"," ")

    if(path == '/'){
        let page = fs.readFileSync("src/index.html")
        res.write(page)
        res.end()
    }
    //this pathing is awful
    else if(path.includes("/savedlist")){
        getSavedList(res)
    }
    else if(path.includes("/del")){
        delTimestamp(path)
        res.end()
    }
    else if(path.includes("/save")){
        saveTimestamp(path)
        res.end()
    }
    else if(path.includes("m3u8")){
        let pathName = path.slice(1).split('/')
        let file = fs.readFileSync("m3u8/"+pathName[0]+"/" + pathName[2] )
        res.write(file)
        res.end()
    }
    else if(path.includes("exists")){
        let namePath = "./m3u8/" + path.split("/")[2]
        try{
            let file = fs.readdirSync(namePath)
            res.write('1')
            res.end()
        }
        catch(e){
            res.write('0')
            res.end()
        }
    }
    else if(path.includes(".ts")){
        let pathName = path.slice(1).split('/')
        let file = fs.readFileSync("m3u8/"+pathName[0]+"/" + pathName[2] )
        res.write(file)
        res.end()
    }
    else if(path.includes("/fetch")){
        let name = getList()[path.split('/')[1]]
        if(path.includes("m3")){
            let filepath = path.split("/")[1]
            let file = fs.readFileSync("./m3u8/"+filepath+"/master.m3u8")
            res.write(file)
            res.end()
        }
        else{
            video(req,res,name)
        }
    }
    else if(path == "/files"){
        let files = getList()
        let json = JSON.stringify({files:files})
        res.write(json)
        res.end(); 
    }
    else if(path.includes("thumbnails")){
        try{
            let page = fs.readFileSync(path.slice(1)+".png")
            res.write(page)
            res.end()
        }
        catch{
            res.statusCode = 500 
            res.end()
        }
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

//not sure about all those
const fileTypes = [
    "mp4",
    "mp3",
    "mkv",
    "webm",
    "opus"
]

let getList = () => {
    let fileList = {}
    let folders
    try{
        folders = fs.readdirSync(vodPath)
    }
    catch(err){
        console.log(err)
        return null
    }

    while(folders.length != 0){
        let currentPath = folders.pop()
        try{
            let files = fs.readdirSync(path.join(vodPath,currentPath))
            for(let file of files){
                file = currentPath + '/' + file
                folders.push(file)
            }
        }
        catch(err){
            let filename = currentPath.split('/').slice(-1)[0] 
            let correct_type = fileTypes.find((e) => {
                return e == filename.split(".")[1]
            })
            if(correct_type){
                fileList[filename] = currentPath                 
            }
        }
    }

    return fileList
}

let delTimestamp = (info) => {
    let stamp = info.split("/")[1]
    //need some better unique way of splitting to avoid cases where char
    //is in the video title
    let [video, time] = stamp.split("__")

    let fd = fs.openSync("local/timestamps.json","as+")

    let json

    let file = fs.readFileSync(fd)
    
    if(file != 0){
        //remove instead of adding
        json = JSON.parse(file) 
        let index = json.findIndex((e) => e.video == video && e.time == time)
        if(index == json.length -1){
            json.pop()
        }
        else{
            json = [...json.slice(0,index), ...json.slice(index+1)]
        }
    }

    fs.writeFile("local/timestamps.json",JSON.stringify(json), ()=>{})
    fs.close(fd)
}

let saveTimestamp = (info) => {
    let stamp = info.split("/")[1]
    //need some better unique way of splitting to avoid cases where char
    //is in the video title
    let [video, time] = stamp.split("__")

    let fd = fs.openSync("local/timestamps.json","as+")

    let json

    let file = fs.readFileSync(fd)
    
    if(file != 0){
        json = JSON.parse(file) 
        json.push({video:video,time:time})
    }
    else{
        json = [{video:video,time:time}]
    }

    fs.writeFile("local/timestamps.json",JSON.stringify(json), ()=>{})
    fs.close(fd)
}

let getSavedList = (res) =>{
    fs.readFile('local/timestamps.json', (err, file) =>{
        if(err) res.end()
        else{
            try{
                let json = JSON.parse(file)
                res.write(JSON.stringify(json))
                res.end()
    
            }
            catch(err){
                console.log(err)
                res.end()
            }
        }
    })
}
