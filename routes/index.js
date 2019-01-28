var express = require("express");
var router = express.Router();
var Campground = require("../models/campground.js");
var User = require("../models/user.js");
var passport = require("passport");
var middleware = require("../middleware");
var crypto = require("crypto");
var async = require("async");
var nodemailer = require("nodemailer");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);//file is trored like this
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnj8lvukh', //take all these things from cloudinary website 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/",function(req, res){
   
    res.render("campgrounds/landing");
});


//AUTH ROUTES..................................................................................


//register route
router.get("/register",function(req,res){
    res.render("index/register");
});

router.post("/register",upload.single("image"),function(req,res){
   
 cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
  req.body.image = result.secure_url;
  req.body.imageId = result.public_id;
   User.register(new User({
   image: req.body.image,
   imageId:req.body.imageId,
   username: req.body.username,
   firstName: req.body.firstName,
   lastName: req.body.lastName,
   email: req.body.email,
   avatar: req.body.avatar,
   }),req.body.password,function(err,user){
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
});

//login route

router.get("/login",function(req,res){
    res.render("index/login");
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

//User Info
router.get("/user/:id",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
       if(err){
           console.log(err);
           res.redirect("/");
       } 
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
        if (err){
           console.log("ERROR!");
         } else { 
           console.log(campgrounds);
         res.render("index/user.ejs",{campgrounds: campgrounds});
         }
       });
    });
   
});






router.post("/users/:id",middleware.isLoggedIn,function(req,res){
    
        
  // add cloudinary url for the image to the campground object under image property
     User.findByIdAndUpdate(req.params.id ,{aboutYou : req.body.aboutYou},function(err,foundUser){
        if(err){
            console.log(err);
        }else{
             console.log(foundUser);
             res.redirect("/user/"+req.params.id); 
        }
    });
  });

router.get("/user/:id/edit",function(req,res){
   res.render("index/userppEdit.ejs"); 
});


router.post("/user/:id",upload.single("image"),async function(req,res){
   User.findById(req.params.id,async function(err,foundUser){
      if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(foundUser.imageId);
                  var result =await cloudinary.v2.uploader.upload(req.file.path);
                  foundUser.image = result.secure_url;
                  foundUser.imageId = result.public_id;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
         
         foundUser.username= req.body.username; 
         foundUser.firstName= req.body.firstName;
         foundUser.lastName= req.body.lastName;
         foundUser.email= req.body.email;
         foundUser.avatar= req.body.avatar;
            foundUser.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds");
        }  
   });
});

router.get("/forget",function(req,res){
   res.render("index/forget"); 
});
router.post("/forget",function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err,buf){
            var token = buf.toString('hex');
            done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email},function(err, user){
               if(!user){
                   req.flash("error","No account with that email address exists.");
                   return res.redirect("/forget");
               } 
               user.resetPasswordToken = token;
               user.resetPasswordExpires = Date.now() + 3600000;//1 hour
               user.save(function(err){
                  done(err,token,user); 
               });
            });
        },
        function(token, user, done){//nodemailer is the package that provides the feature of sending mail
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail' ,
                auth: {
                    user: "dishask99@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "dishask99@gmail.com",
                subject: "Node.js Pasword Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password.\n"+
                "Please click on the following link, or paste this into your browser to complete the process.\n"+
                "http://"+req.headers.host+"/reset/"+token+"\n\n"+
                "if you did not request this, please ignore this email and your password will remailn unchanged.\n"+
                "Thanks"
            };
            smtpTransport.sendMail(mailOptions,function(err){
               console.log("mail sent");
               req.flash("success","An e-mail has been sent to " + user.email + " with further instructions." );
               done(err,"done");
            });
        }
    ],function(err){
        if(err) return next(err);
        res.redirect("/forget");
    });
});
   
router.get("/reset/:token",function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},function(err,user){
       if(!user){
           req.flash("error","Password reset token is invalid or has expired.");
           return res.redirect("/forget");
       }
       res.render("index/reset",{token: req.params.token});
    }); //it checks that resetPasswordExpire must be greater than Date.Now()
});

router.post("/reset/:token",function(req,res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},function(err,user){
               if(!user){
                   req.flash("error","Password reset token is invalid or has expired.");
                   return res.redirect("back");
               }
               if(req.body.password === req.body.confirm){
                   user.setPassword(req.body.password, function(err){
                     user.resetPasswordToken = undefined;
                     user.resetPasswordExpires = undefined;
                     user.save(function(err){
                        req.logIn(user,function(err){
                            done(err,user);
                        });
                     });
                   });
               }else{
                   req.flash("error","passwords do not match.");
                   done(err,user);
               }
            });
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
               service: "Gmail",
               auth: {
                   user:"dishask99@gmail.com",
                   pass: process.env.GMAILPW
               }
            });
            var mailOptions = {
                to: user.email,
                from: "dishask99@gmail.com",
                subject: "Your password has been changed",
                text: "Hello,\n\n"+
                      "This is a confirmation that the password for your account "+user.email+
                      " has been changed"
            };
            smtpTransport.sendMail(mailOptions, function(err){
               req.flash("success", "Success! Your password has been changed.");
               done(err);
            });
        }
        ],function(err){
            res.redirect("/campgrounds");
        });
});
module.exports = router;