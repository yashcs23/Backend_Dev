const express = require("express");

const app = express();
const PORT = 7000;

app.get("/",(req,res)=>{
    console.log("hhh")
    res.send("WELCOME to HOME PAGE")
})

app.get("/users",(req,res)=>{
    res.send("<h1>This is user page</h1>")
})

app.get("/users/:id",(req,res)=>{

    const userid = req.params.id;
    res.send(`You are requesting for use: ${userid} `)
})


app.listen(PORT,()=>{
    console.log(`Server is running : ${PORT}`);
})