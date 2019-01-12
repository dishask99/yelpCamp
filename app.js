var express = require("express"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground.js"),
    Comment = require("./models/comment.js"),
    User = require("./models/user.js"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    seedDB = require("./seeds.js"),
    methodOverride = require("method-override"),
    flash = require("connect-flash");
    
var campgroundRoutes = require("./routes/campground.js"),
    commentRoutes = require("./routes/comment.js"),
    indexRoutes = require("./routes/index.js");
    

var app = express();
app.set("view engine","ejs");

 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));//this will define the whole path to public directory
app.use(methodOverride("_method"));
app.use(flash());//this use should come before passport configuration

app.use(require("express-session")({
    secret : "Rusty is the cutest dog ever",//this is basically used to decode and encode..
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(User.authenticate()));//this will tell passport to use that version of authentication that has been sent by the UserSchema
passport.serializeUser(User.serializeUser());//it encodes the data from the session
passport.deserializeUser(User.deserializeUser());//it decodes the and sends the data to the session
app.use(function(req,res,next){  //whatever function we put in app.use is provided to all the routes
   res.locals.currentUser = req.user;//what ever variable we put in locals is provided in every template so currentUser variable can be used in all the templates having the value of req.user=> means username and user id..... 
   res.locals.error = req.flash("error");//this will pass on messsage variable to every ejs page you have not to do it separately
   res.locals.success = req.flash("success");
   next();
});//req.user is empty if no user is logged in else it will contain a username and an id


//mongoose.connect("mongodb://localhost/yelp_camp",{ useNewUrlParser: true });
mongoose.connect(process.env.DATABASEURL,{ useNewUrlParser: true });
//mongodb://<dbuser>:<dbpassword>@ds155294.mlab.com:55294/yelp_camp


//seedDB();//in Database seeding data is provided to database when it is being installed
//CRUD...............................................................................................
app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes); //it will tell that all the routes in campgroundRoutes.js starts from /campgrounds
app.use("/campgrounds/:id/comments",commentRoutes);





app.listen(process.env.PORT,process.env.IP,function(){
   console.log("YelpCamp server has been started..."); 
});