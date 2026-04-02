const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
}));

// Cookie routes
app.get("/set-cookies", (req, res) => {
    res.cookie("name", "user-1");
    res.send("Cookie set");
});

app.get("/get-cookie", (req, res) => {
    res.json(req.cookies);
});

const todoRoutes = require("./routes/todo.routes");
app.use("/api/todos", todoRoutes);

app.post("/login", (req, res) => {
    const { username } = req.body;
    req.session.user = username;
    res.send("User logged in");
});

app.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("User not logged in");
    }
    res.send(`Welcome ${req.session.user}`);
});

// ✅ FIXED logout route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.send("Logged out");
    });
});

module.exports = app;