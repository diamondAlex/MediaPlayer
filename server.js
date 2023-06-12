var http = require('http');
var fs = require('fs')

//create a server object:
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let page = new URL(req.url,'https://whatever.org/')
    let path = page.pathname.replaceAll("%20"," ")
    console.log(path)

    
    if(path.includes(".mp4")){
        video(req,res,path)
    }
    else{
        let files = listFiles()
        let json = JSON.stringify({files:files})

        res.write(json)
        res.end(); 
    
    }

}).listen(8080, () => console.log("connected on 8080")); //the server object listens on port 8080

let video = (req,res,path) => {
    try{
        let range = req.headers.range;
        if (!range) {
            res.status = 400
        }
        let videoPath = path
        let videoSize = fs.statSync(path).size;
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
    catch{
        console.log('oops')
    }
}

let listFiles = () =>{
    let paths = []
    let dir = fs.readdirSync("/media/drive/")
    for(folder of dir){
        try{
            let files =  fs.readdirSync("/media/drive/"+folder)
            for(let file of files){
                paths.push("/media/drive/"+folder+"/"+file)
            }
        }
        catch{
            paths.push("/media/drive/"+folder)
        }
    }
    return paths
}
