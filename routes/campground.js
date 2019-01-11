var express = require("express");
var router = express.Router();
var Campground = require("../models/campground.js");
var methodOverride = require("method-override");
var middleware = require("../middleware");//it will automatically include index.js file
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
router.post("/",middleware.isLoggedIn,function(req, res){//"/campground is an another route in post and is different from that in get"
    //form output will be sent here.........
    var name=req.body.name;
    var price=req.body.price;
    var image=req.body.image;
    var desc=req.body.description;
    var author ={
      username: req.user.username,
      id: req.user._id
    };
     var newCampground={name: name,price: price,image: image,description: desc, author: author};
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

router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
  //we have checked everything in checkedownership middleware so no need to use err in the below function yoiii............
        Campground.findById(req.params.id,function(err,foundCampground){
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

router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
        Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,editCampground){
            if(err){
                console.log(err);
                req.flash("error","Something went wrong");
                res.redirect("back");
            }else{
                req.flash("success","Campground updated successfully!");
              res.redirect(req.params.id);
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
