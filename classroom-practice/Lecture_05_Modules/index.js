const fs = require("fs")

fs.writeFileSync("./test.txt","This is test file");
fs.appendFileSync("./test.txt", new Date().toLocaleString());
// fs.writeFile("./yash.txt","This is async file",(err,data)=>{
//     if(err){
//         console.log(err); 
//     }
//     else{
//         console.log("File is created");
//     }
// });


const file = fs.readFileSync("./test.txt","utf-8")
console.log(file);