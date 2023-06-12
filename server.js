var http = require('http');
var fs = require('fs')

let path = "vods/"

//create a server object:
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let page = new URL(req.url,'https://whatever.org/')
    let path = page.pathname.replaceAll("%20"," ")

    if(path == '/'){
        let page = fs.readFileSync("src/test.html")
        res.write(page)
        res.end()
    }
    else if(path.includes(".mp4")){
        video(req,res,path)
    }
    else if(path == "/files"){
        let files = listFiles()
        let json = JSON.stringify({files:files})

        res.write(json)
        res.end(); 
    
    }
    else{
        console.log(__dirname)
        console.log("src" + path)
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
        let videoPath = require('path').join(__dirname, path)
        let videoSize = fs.statSync(videoPath).size;
        let CHUNK_SIZE = 10 ** 6;
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
    let paths = []
    let dir = fs.readdirSync(require('path').resolve(__dirname, path))
    console.log("dir = " + dir)
    for(folder of dir){
        try{
            let files =  fs.readdirSync(path+folder)
        }
        catch{
            paths.push(path+folder)
        }
    }
    return paths
}
