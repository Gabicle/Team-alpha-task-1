//jshint esversion:6
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));




app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-gabrielle:Test123@cluster0-od0qv.mongodb.net/AlphaDB", {useNewurlParser:true});
mongoose.set("useCreateIndex", true);
// Creating User Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String
  }) ;

userSchema.plugin(passportLocalMongoose);

// Using userSchema to create a mongoose model with collection named User
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("home");
});
app.get("/login", function(req, res){
  res.render("login");
});
app.get("/register", function(req, res){
  res.render("register");
});
app.get("/welcome", function(req,res){
  if(req.isAuthenticated()){
    res.render("welcome");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){
User.register({username: req.body.username}, req.body.password, function(error, user){
  if(error){
    console.log(error);

    // res.redirect("/register");
  }
  else{
    passport.authenticate("local")(req, res, function(){
      res.render("welcome");
    });
  }
} );


});

app.post("/login", passport.authenticate("local"), function(req,res){
const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user, function(error){
  if(error){
    console.log(error);
  }
  else{
    passport.authenticate("local")(req,res,function(){
      res.render("welcome");
    });
  }
});

});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000");
});
