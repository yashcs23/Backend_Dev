const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");
const inputfilepath = path.join(__dirname,"input.txt");
const transformfilepath = path.join(__dirname,"transform.txt");
const readStream = fs.createReadStream(inputfilepath);
const writeStream = fs.createWriteStream(transformfilepath);


const upperCasetransform = new Transform({
    transform(chunk,encoding,callback){
        const transfromedData = chunk.toString().toUpperCase();
        this.push(transfromedData);

        callback();
    }
})

readStream.pipe(upperCasetransform).pipe(writeStream);