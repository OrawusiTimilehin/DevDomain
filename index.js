import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import env from 'dotenv';

const app = express();
const port = 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded(  { extended:true }  ))

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

app.post("/add-post", async (req, res)=>{
    const title = req.body.title;
    const author = req.body.author;
    const publish_date = req.body.publish_date;
    const content = req.body.content;
    const category = req.body.category;
    const tags = req.body.tags;
    const description= req.body.meta_description;
    const time = req.body.reading_time;

    cosnt result = await debugger.qu

})


app.listen(port, () => {
    console.log("Running on Port 3000")
})