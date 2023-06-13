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
        let name = getFromAssociation(formattedPath)
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
    return associationsList
}

let associationsList
//this is awful
async function getAssociativeList(){
    try{
        let associations = await decrypt()
        if(!associations.toString()){
            associations = populateList()
            await encrypt(JSON.stringify(associations))
            getAssociativeList()
        }
        associationsList = associations
        return
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
    return associationsList[name]
}

function updateAssociation(nameInfo){
    let associations = getAssociativeList()
    let newName = nameInfo.to
    let oldName = nameInfo.from
    let path = associations[oldName]
    delete associations[oldName]
    associations[newName] = path
    encrypt(JSON.stringify(associations))
}

const {
    createReadStream,
    createWriteStream,
    readFileSync
} = require('node:fs');

const {
    pipeline,
} = require('node:stream/promises');
const {
    Readable
} = require('node:stream');

const {
    createCipheriv,
    createDecipheriv,
} = require('node:crypto');

const algorithm = 'aes-192-cbc';

let encrypt = async (content) => {
    // Then, we'll generate a random initialization vector
    let iv = readFileSync("local/test.iv")
    let key = readFileSync("local/test.key")

    let cipher = createCipheriv(algorithm, key, iv);

    let input = Readable.from(content)
    let output = createWriteStream('local/association.json');

    await pipeline(input, cipher, output)

}

//this is getting silly
let decrypt = async () => {
    if(!fs.existsSync("local/association.json")){
        return "" 
    }
    let iv = readFileSync("local/test.iv")
    let key = readFileSync("local/test.key")

    let decipher = createDecipheriv(algorithm, key, iv);

    input = createReadStream('local/association.json');
    let str = ""
    let prom = new Promise((resolve) => {
        decipher.on("data", (data) =>{
            str = str + data
        })
        decipher.on("end", () =>{
            resolve(JSON.parse(str))
        })
    })

    input.pipe(decipher)
    
    return prom
}

getAssociativeList()
