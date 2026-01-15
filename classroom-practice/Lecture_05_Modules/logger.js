const fs = require("fs")
const os = require("os")


function logActivityMessage(message){
    fs.appendFile("./activity.log",message +" "+ new Date().toLocaleString() + os.EOL,(err,data)=>{
    if(err){
        console.log(err);
    }
    else{
    } 8
});
}

module.exports = logActivityMessage;