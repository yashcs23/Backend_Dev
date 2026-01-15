const http = require("http");

const server = http.createServer((req,res)=>{
    res.writeHead(200,{"content-type":"text/html"});
    res.end("response is cllosed");
})

server.listen(3000,()=>{
    console.log("server is running");
})