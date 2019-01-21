var express = require("express");
var router = express.Router();
var Campground = require("../models/campground.js");
var methodOverride = require("method-override");
var middleware = require("../middleware");//it will automatically include index.js file
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
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
  cloud_name: 'dnj8lvukh', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//INDEX route to show all campgrounds....
router.get("/",function(req, res){
    //collect data from database
    Campground.find({},function(err,allCampgrounds){
       if(err){
           console.log("Something Went wrong.....");
       } else{
           res.render("campgrounds/index",{campgrounds: allCampgrounds,currentUser: req.user});
       }
    });
    
   
    
});

//CREATE route to create a new route...
router.post("/",middleware.isLoggedIn,upload.single('image'),function(req, res){//"/campground is an another route in post and is different from that in get"
    cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
  var image = result.secure_url;
  var imageId = result.public_id;
  // add author to campground
    //form output will be sent here.........
    var name=req.body.name;
    var price=req.body.price;
   
    var desc=req.body.description;
    var author ={
      username: req.user.username,
      id: req.user._id
    };
    var location=req.body.location;
     var newCampground={name: name,price: price,image: image,imageId: imageId,description: desc, author: author,location: location};
      Campground.create(newCampground,function(err,newCampground){
         if(err){
             console.log(err);
            req.flash("error","Something went wrong");
             res.redirect("back");
         }else{
             console.log(newCampground);
             req.flash("success","Campground posted successfully!");
             res.redirect("/campgrounds");
         }
      });
    
    });
});

//NEW route to show form......
router.get("/new",middleware.isLoggedIn,function(req, res){
    res.render("campgrounds/new");
});

//SHOW route

router.get("/:id",function(req, res){
    //show route to show description...
    //finding campground by id and then populating comment field with author name and text  and then executing function(this all in case of referencing one collection in another we have to use it in order to show it)
    
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){//this will select the object with respective id
        if(err || !foundCampground){
            console.log(err);
            req.flash("error","Campground not found");
              res.redirect("back");
        }else{
            console.log(foundCampground);
            
            res.render("campgrounds/show",{campground: foundCampground});
        }
    });
    
});

//edit route

router.get("/:id/edit",middleware.checkCampgroundOwnership,async function(req,res){
  //we have checked everything in checkedownership middleware so no need to use err in the below function yoiii............
        Campground.findById(req.params.id,async function(err,foundCampground){
              if(err){
                  console.log(err);
                  req.flash("error","Something went wrong");
                  res.redirect("back");
              }else{
                 res.render("campgrounds/edit",{campground: foundCampground});  
              }
                    
        });
});

//update route

router.put("/:id",middleware.checkCampgroundOwnership,upload.single("image"),async function(req,res){
     Campground.findById(req.params.id,async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.campground.name;
            campground.location=req.body.campground.location;
            campground.price=req.body.campground.price;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });


});
//delete route

router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
       if(err){
           console.log(err);
            req.flash("error","Something went wrong");
           res.redirect("/");
       }else{
           req.flash("success","Campground deleted successfully!");
           res.redirect("/");
       }
    });
});


module.exports = router;
