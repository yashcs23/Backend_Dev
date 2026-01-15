const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url,true); 
    console.log(parsedUrl);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    const log = `${new Date().toLocaleDateString()} | ${req.method} | ${req.url}\n`;
    fs.appendFile("server.log", log, () => {});

    switch (pathname) {

        case "/":
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("Welcome to home page");
            break;

        case "/greet":
            const name = query.name || "Guest";

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`<h1>Hello, ${name}! </h1>`);
            break;

        case "/about-us":
            const user = {
                id: 1,
                name: "Yash Purwar",
                role: "Developer",
                city: "India"
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user));
            break;

        default:
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("Page not found");
    }
});

server.listen(8000, () => {
    console.log("Server is running on port 8000");
});
