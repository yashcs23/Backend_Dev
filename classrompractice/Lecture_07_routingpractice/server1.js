const http = require("http");
const url = require("url");
const fs = require("fs")

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const log = `${new Date().toLocaleDateString()} | ${query.name} | ${query.issue} | ${query.priority}\n`;
    check = query.priority.toUpperCase();
    if(check=== "HIGH"){
    fs.appendFile("urgent.txt", log, () => {});
    }
    else{
            fs.appenAdFile("normal_complaints.txt", log, () => {});

    }
    if (pathname === "/complaint") {

        const name = query.name || "No Name";
        const issue = query.issue || "No Issue";
        const priority = query.priority || "LOW";

        const id = Math.floor(Math.random() * 1000000000);

        const details = {
            ticket_id: `TKT-${id}`,
            name: name,
            issue: issue,
            priority: priority,
            message:"Your complain will be resolved soon"
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(details));
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Page not found");
});

server.listen(8000, () => {
    console.log("Server running on port 8000");
});
