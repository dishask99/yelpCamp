var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var passport = require("passport");
var middleware = require("../middleware");

router.get("/",function(req, res){
   
    res.render("campgrounds/landing");
});


//AUTH ROUTES..................................................................................


//register route
router.get("/register",function(req,res){
    res.render("Authentication/register");
});

router.post("/register",function(req,res){
   
   User.register(new User({username: req.body.username}),req.body.password,function(err,user){
      if(err){
          req.flash("error",err.message);
          res.redirect("/register");//cant use _________________return res.render_____________________________
      } //passport.authenticate basically makes the user loginned initilizes the statement User.serializeUser........
      passport.authenticate("local")(req,res,function(){//we are using local strategy so passing local here... if we have installed passport-twitter then could have passed twitter
          req.flash("success","Welcome to YelpCamp "+user.username);
          res.redirect("/campgrounds");
      });
   });//we have passed username received from the form into the database and seperately passing password because we dont want the password to be saved in the database instead its hashed form is stored
});

//login route

router.get("/login",function(req,res){
    res.render("Authentication/login");
});

                //middleware
router.post("/login",passport.authenticate("local",{  //passport.authenticate is a middleware,middleware is what we are using after the start of the route and before the end of the route 
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res){
    
});

//logout route

router.get("/logout",function(req,res){
   req.logout();
   req.flash("success","Logged You Out!");
   res.redirect("/");
});



module.exports = router;