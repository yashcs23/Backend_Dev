const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log("PATH =>", pathname);

    

    if (pathname === "/product") {
        const name = query.name || "No product";
        const price = Number(query.price) || 0;
        const discount = Number(query.discount) || 0;
        const finalPrice = price - price * (discount / 100);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
            <h1>${name}</h1>
            <h2>Price: ${price}</h2>
            <h2>Discount: ${discount}%</h2>
            <h2>Final Price: ${finalPrice}</h2>
        `);
        return;
    }

    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("Page not found");
});

server.listen(8000, () => {
    console.log("Server running on port 8000");
});
