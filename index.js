import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/posts", (req, res) => {
    res.render("posts.ejs");
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
})

app.get("/post/", (req, res )=>{
    res.render("article.ejs");
})

app.get("/create",  (req, res)=>{
    res.render("create.ejs");
})


app.listen(port, () => {
    console.log("Running on Port 3000")
})