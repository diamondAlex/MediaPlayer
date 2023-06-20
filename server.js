const http = require('http');
const fs = require('fs');
let { 
    updateAssociation, 
    getFromAssociation, 
    getList
} = require('./server/cipher')

let vodPath = "vods/"

console.log('test')
console.log('test')


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
        let name = getFromAssociation(formattedPath)
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
