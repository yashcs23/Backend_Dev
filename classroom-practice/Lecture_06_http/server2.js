const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {

    const log = `${new Date().toLocaleDateString()} | ${req.method} | ${req.url}\n`;

    fs.appendFile("server.log", log, (err) => {
        if (err) {
            console.error("Error writing log:", err);
        }
    });

    switch (req.url) {

        case "/":
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("Welcome to home page");
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
