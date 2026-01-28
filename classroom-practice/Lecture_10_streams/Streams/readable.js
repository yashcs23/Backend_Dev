const fs = require("fs");
const path = require("path")
const inputfilepath = path.join(__dirname,"input.txt");
const outputfilepath = path.join(__dirname,"output.txt");
const readStream = fs.createReadStream(inputfilepath);

readStream.on("data",(chunk)=>{
    console.log("Data is recieved in chunk :",chunk.toString());
})

readStream.on("end",()=>{
    console.log("readstream is end");
})

readStream.on("error",(err)=>{
    console.log("error",err.message);
})

const writeStream = fs.createWriteStream(outputfilepath)
readStream.pipe(writeStream)
writeStream.on("finish",()=>{
    console.log("Writing stream is end");
})