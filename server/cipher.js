const fs = require('node:fs');

const { pipeline } = require('node:stream/promises');
const { Readable } = require('stream');
const { createCipheriv, createDecipheriv } = require('node:crypto');

let associationsList
let vodPath = 'vods/'
let listPath = 'local/'

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

async function updateAssociation(nameInfo){
    console.log(nameInfo)
    //let associations = await getAssociativeList()

    console.log(associationsList)
    let newName = nameInfo.to
    let oldName = nameInfo.from
    let path = associationsList[oldName]
    delete associationsList[oldName]
    associationsList[newName] = path
    console.log(associationsList)
    encrypt(JSON.stringify(associationsList))
}


const algorithm = 'aes-192-cbc';

let encrypt = async (content) => {
    // Then, we'll generate a random initialization vector
    let iv = fs.readFileSync("local/test.iv")
    let key = fs.readFileSync("local/test.key")

    let cipher = createCipheriv(algorithm, key, iv);

    let input = Readable.from(content)
    let output = fs.createWriteStream('local/association.json');

    await pipeline(input, cipher, output)

}

//this is getting silly
let decrypt = async () => {
    if(!fs.existsSync("local/association.json")){
        return "" 
    }
    let iv = fs.readFileSync("local/test.iv")
    let key = fs.readFileSync("local/test.key")

    let decipher = createDecipheriv(algorithm, key, iv);

    let input = fs.createReadStream('local/association.json');
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

let getList = () => {
    return associationsList
}

getAssociativeList()

module.exports = {
    updateAssociation,
    getFromAssociation,
    getList
}
