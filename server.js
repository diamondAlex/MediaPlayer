const http = require('http');
const path = require('path');
const fs = require('fs');

let vodPath = "vods"

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let path = req.url.replaceAll("%20"," ")

    if(path == '/'){
        let page = fs.readFileSync("src/test.html")
        res.write(page)
        res.end()
    }
    else if(path.includes("/fetch")){
        let name = getList()[path.split('/')[1]]
        video(req,res,name)
    }
    else if(path == "/files"){
        let files = getList()
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

let getList = () => {
    let fileList = {}
    let folders = fs.readdirSync(vodPath)

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
            fileList[filename] = currentPath                 
        }
    }

    return fileList
}

