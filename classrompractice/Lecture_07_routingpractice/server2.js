const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === "/admin") {

        const user = query.user;
        const pass = query.pass;

        if (user === "admin" && pass === "1234") {

            fs.readFile("admin_dashboard.html", "utf8", (err, data) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Server Error");
                    return;
                }

                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(data);
            });

        } else {
            res.writeHead(401, { "Content-Type": "text/plain" });
            res.end("Access Denied.");
        }

        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Page Not Found");

});

server.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});
