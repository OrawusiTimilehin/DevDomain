import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import env from 'dotenv';
import bcrypt from 'bcrypt';
import session from "express-session";
import passport from "passport";
import {Strategy} from "passport-local";
import flash from 'connect-flash';

//Constant variables
const app = express();
const port = 3000;
const saltRounds = 10;


//Configuring environment variable
env.config();


// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded(  { extended:true }  ));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized : true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8
    }
}));

// Error message flash middle ware
app.use(flash());
//Passport middle ware has to come after the session middle ware. 
app.use(passport.initialize());
app.use(passport.session());

// Setting up the flash in the locals variable
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
  });


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
     res.render("index.ejs", {
            authenticated: req.isAuthenticated()
        });

    
})

app.get("/posts", async (req, res) => {
    const result  = await db.query("SELECT * FROM posts");
    console.log(result.rows)
    res.render("posts.ejs", {
        posts : result.rows,
        authenticated: req.isAuthenticated()
    })
  
})

app.get("/login", (req, res) => {
    res.render("login.ejs",{
    authenticated: req.isAuthenticated()
});
})

app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/");
        
    });
})

app.get("/signup", (req, res) => {
    res.render("signup.ejs", {
        authenticated: req.isAuthenticated()
    });
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
                    const result = await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hash]);
                    const user = result.rows[0];
                    req.login(user, (err)=>{
                        if(err){
                        console.log(err);
                        }else{
                            console.log("Success");
                            res.redirect("/");
                        }
                    })
                }
                
            });
           
        }else{
            res.render("signup.ejs", {
                existing_user : true,
                authenticated: req.isAuthenticated()
            })
        }
    }else{
        console.log("entered else block")
        res.render("signup.ejs", {
            error: "Passwords do not match",
            authenticated: req.isAuthenticated()
        });
    }
})

app.get("/post/:id", async (req, res )=>{
    if (req.isAuthenticated()){
        console.log("Entered into the route handler")
    const id = req.params.id;
    console.log(`This is the id ${id}`);
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    console.log(result.rows);
    res.render("article.ejs", {
        post: result.rows[0],
        authenticated: req.isAuthenticated()
    });
    }else{
        res.redirect("/login")
    }
    
})

app.get("/create",  (req, res)=>{
    res.render("create.ejs",{
        authenticated: req.isAuthenticated()
    });
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

//passport local strategy 

//NOTE : for error messages to show in the 'info' part of the cb it must be an object with 'message: error'. It must be called message.
passport.use( new Strategy(
    { usernameField: 'email'}, // specify the field name here. Telling passport that my username field is called email
    async function verify(email, password, cb){
    console.log("IN lOCAL Strategy");
    
    //When ever passport.authenticate is called the it already has access to the form data, you do not need body parser , So the email and password are being passed as parameters to this verify function. NOTE THE NAME OF THE INPUTS HAVE TO BE THE SAME NAME AS THE PARAMETERS!!
    try {
        console.log(email);
        console.log("HEYYY");
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0){
            const user = result.rows[0];
            const storedHashedPassword = user.password;
            console.log(user.email);

            bcrypt.compare(password,storedHashedPassword, (err, result)=>{
                if (err){
                     //Error with password check
                    cb(err, false, {message: "Error checking password"});
                }else{
                    //result is a boolean which is either true or false depending on whether the passwords match or not.
                    if (result){
                        console.log("Passwords match");
                        cb(null, user);
                    }else{
                        cb(null,false, {message: "Invalid Password"});
                    }
                }
            })
        }else{
            cb(null, false, {message: "User not found"});
        }
;    }catch(err){
        console.log(err);
        cb(err, false, {message: "Error with databse query"});
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

app.listen(port, () => {
    console.log("Running on Port 3000");
})