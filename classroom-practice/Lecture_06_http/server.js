const http = require("http");

const server = http.createServer((req,res)=>{
    // res.writeHead(200,{"content-type":"text/html"});
    // console.log(req.url);
    // res.end("server is running");

    switch(req.url){
        case "/":
            res.end("Welcome to home page");
            break;
        case "/about-us":
            res.end("Welcome to about us")
        default :
        res.writeHead(404 , {"content-type":"text/html"})
        res.end("Page not found");
    }

})

server.listen(8000,()=>{
    console.log("server is running");
})