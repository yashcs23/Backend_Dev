const fs = require("fs");
// fs.copyFileSync("test.txt","copy.txt")

// fs.copyFile("test.txt","copy.txt",(err)=>{
//     if(err){
//         console.log("error");
//         return;
//     }
//     console.log("file copied");
// })
// try{
//     fs.readFileSync("copied.txt","utf-8")
//     console.log("file copied");
// }
// catch(err){
//     console.log("error while ccopying this");
// }

// fs.unlink("copy.txt",(err)=>{
//     if(err){
//         console.log("error while  deleting");
//     }
//     console.log("File deleted ");
// })

// fs.writeFile("copy.txt","This is new file",(err)=>{
//     if(err){
//         console.log("error while writing");
//         return;
//     }
//     console.log("File is created");

// })

// fs.mkdir("newfolder/folder1/folder2",{recursive:true},(err)=>{
//     if(err){
//         console.log(" ");
//         return
//     }
//     console.log("directory is created");
// })

fs.readdir("newfolder",(err,file)=>{
    if(err){
        console.log("erro while reading");
    }
    console.log(file);
})