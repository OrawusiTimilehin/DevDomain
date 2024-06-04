import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import env from 'dotenv';
import bcrypt from 'bcrypt';

//Constant variables
const app = express();
const port = 3000;
const saltRounds = 10;

//Configuring environment variable
env.config();

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded(  { extended:true }  ))

// Initialization of the db object
const db = new pg.Client({
    user : process.env.PG_USER,
    host : process.env.PG_HOST,
    database : process.env.PG_DATABASE,
    password : process.env.PG_PASSWORD,
    port : process.env.PG_PORT
});
db.connect();

// Route Handlers

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/posts", async (req, res) => {
    const result  = await db.query("SELECT * FROM posts");
    console.log(result.rows)
    res.render("posts.ejs", {
        posts : result.rows
    });
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.post("/login", async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0){
            const user = result.rows[0]
            const storedHashedPassword = user.password;

            bcrypt.compare(password,storedHashedPassword, (err, result)=>{
                if (err){
                    console.log(err);
                }else{
                    //result is a boolean which is either true or false depending on whether the passwords match or not.
                    if (result){
                        res.send("Loged In")
                    }else{
                        res.send("Wrong password")
                    }
                }
            })
        }
;    }catch(err){
        console.log(err)
        res.render("login.ejs", {
            error: "User not found"
        })
    }
})

app.get("/signup", (req, res) => {
    res.render("signup.ejs", );
})

app.post("/signup", async (req, res)=>{
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;

    if (password == confirm_password ){
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

        if (result.rows.length == 0){
            const hashed_password = bcrypt.hash(password, saltRounds, async (err, hash)=>{
                if (err){
                    console.log(err)
                }else{
                    const user = await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hash]);
                }
                
            });
           
        }else{
            res.render("signup.ejs", {
                existing_user : true
            })
        }
    }else{
        console.log("entered else block")
        res.render("signup.ejs", {
            error: "Passwords do not match"
        });
    }
})

app.get("/post/:id", async (req, res )=>{
    console.log("Entered into the route handler")
    const id = req.params.id;
    console.log(`This is the id ${id}`);
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    console.log(result.rows);
    res.render("article.ejs", {
        post: result.rows[0]
    });
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
    try{
        const result = await db.query("INSERT INTO posts (title, author, date, content, category, tags, description, read_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", [title, author, publish_date, content, category, tags, description, time]);
        res.redirect("/posts")
    }catch(err){
        //Think of an error handler.
        console.log(err);
        console.log("Post not added")
        res.redirect("/create")
    }
    

})


app.listen(port, () => {
    console.log("Running on Port 3000")
})