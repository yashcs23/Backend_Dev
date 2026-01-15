const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;


    const log = `${new Date().toISOString()} | ${req.method} | ${req.url}\n`;
    fs.appendFile("server.log", log, () => {});

    if (pathname === "/style.css") {
        const cssPath = path.join(__dirname, "public", "style.css");
        fs.readFile(cssPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("CSS file error");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/css" });
            res.end(data);
        });
        return;
    }

    switch (pathname) {
        case "/":
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Store</title>
                    <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to Our Store</h1>
                        <p>Use <b>/product</b> route to see products</p>
                    </div>
                </body>
                </html>
            `);
            break;

        case "/product":
            const name = query.name || "Unknown Product";
            const price = Number(query.price) || 0;
            const discount = Number(query.discount) || 0;
            const finalPrice = price - price * (discount / 100);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Product</title>
                    <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <div class="container">
                        <h2>Product Details</h2>
                        <div class="product">
                            <p><b>Name:</b> ${name}</p>
                            <p><b>Price:</b> ${price}</p>
                            <p><b>Discount:</b> ${discount}%</p>
                            <p class="price">Final Price: ${finalPrice}</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
            break;

        default:
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(`
                <h1>404 - Page Not Found</h1>
                <a href="/">Go Home</a>
            `);
    }
});

server.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});
