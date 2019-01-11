var Campground = require("../models/campground.js");
var Comment = require("../models/comment.js");

var middlewareObj = {};

middlewareObj.checkCommentOwnership = function(req,res,next){
        if(req.isAuthenticated()){
             Campground.findById(req.params.id,function(err,foundCampground){
                     if(err || !foundCampground){
                         console.log(err);
                         req.flash("error","Campground not found");
                         return res.redirect("back");
                    } 
              Comment.findById(req.params.comment_id,function(err,comment){
                if(err || !comment){
                     console.log(err);
                   req.flash("error","Comment not found");
                  res.redirect("back");
               }else{
                   if(comment.author.id.equals(req.user._id)){
                    next();   
                   }else{
                      req.flash("error","You don't have permission to do so");
                     res.redirect("back"); 
                   }
                }
                 });
                 
             });
         }else{
             req.flash("error","You have to be logged in first to do so");
             res.redirect("back");
         }
        
};

middlewareObj.checkCampgroundOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundCampground){
        if(err || !foundCampground){//necessary to do this because we go on show and edit route and try to do some changes in campground or comment id in url keeping the no. of characters same but changing the characters will not caught for any error but we cant find any campground or comment with that id so that will return null and !null is truthy.
            console.log(err);
            req.flash("error","Campground not found!");
            res.redirect("back");//this will take user back
        }else{
               //if(foundCampground.author.id === req.user._id){//foundCampground.author.id is an mongoose object while req.user._id is an string........ so === and === wont work so will we use .equals()
                if(foundCampground.author.id.equals(req.user._id)){
                   next();
               }else{
                   req.flash("error","You don't have permission yo do so");
                 res.redirect("back");
               }
             }
        });
    }else{
        req.flash("error","You need to be logged in first to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
       return next();
    }
    req.flash("error","You need to be logged in first to do that...");//this will pass on the error message to the next redirect this error message will move in to the get request of login page and there it will be shown
    res.redirect("/login");
}

module.exports = middlewareObj;