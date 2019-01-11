var express = require("express");
var router = express.Router({mergeParams: true});//earlier when we start the server as we are not passing/:id in the router so it was taking req.params.id as null so we have to merge params here
var Comment = require("../models/comment.js");
var Campground = require("../models/campground.js");
var middleware = require("../middleware");
//creating new comment

router.get("/new",middleware.isLoggedIn,function(req, res){
    Campground.findById(req.params.id,function(err,campground){
       if(err || !campground){
            req.flash("error","Something went wrong");
            res.redirect("back");
       }else{
          res.render("comments/newComment",{campground: campground}); 
       } 
    });
    
});

// posting new comment

router.post("/",middleware.isLoggedIn,function(req, res){//added middleware so that no usercan access it using postman 
    
    Campground.findById(req.params.id,function(err, campground){
       if(err || !campground){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("back");
       }else{
           Comment.create(req.body.comment,function(err, comment){
               if(err){
                   console.log(err);
                   req.flash("error","Something went wrong");
                   res.redirect("back");
               }else{
                   comment.author.username= req.user.username;
                   comment.author.id= req.user.id;
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success","Comment posted successfully!");
                   res.redirect("/campgrounds/"+campground._id);
               }
           });
       
       }
    });
    
});


//edit comment
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req, res){
                 Comment.findById(req.params.comment_id,function(err,comment){
                  if(err){
                       req.flash("error","Something went wrong");
                       res.redirect("back");
                  }else{
                      res.render("comments/edit",{campground_id: req.params.id,comment: comment});
                  }
                  });
             
              
});


//update route

router.put("/:comment_id",middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
        if(err){
            req.flash("error","Something went wrong");
            res.redirect("back");
        }else{
            req.flash("success","Comment updated successfully!");
            res.redirect("/campgrounds/"+req.params.id);
        }
       
    });
});

//delete route
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id,function(err,comment){
       if(err){
           req.flash("error","Something went wrong");
           res.redirect("back");
       }else{
           req.flash("success","Comment deleted successfully!");
           res.redirect("/campgrounds/"+req.params.id);
       }
    });

});


module.exports = router;