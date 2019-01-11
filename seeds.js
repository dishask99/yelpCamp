var mongoose=require("mongoose");
var Campground=require("./models/campground.js");
var Comment=require("./models/comment.js");
var campgrounds=[
    {
        name: "Acorn Oaks",
        image: "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b7ca353cfcc4299e6c3d431ff862e1cf&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
     
    },
    {
        name: "Atwood Lake",
        image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=1c80f31bb4040015d51db663252fbd30&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
     
    },
    {
        name: "Bixler Lake",
        image: "https://images.unsplash.com/photo-1537759331550-b4dad06cbcf7?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0105b320d86c2cba8d059c91ad5eea17&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        
    }];
function seedDB(){
  Campground.deleteMany({},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Removed all the from the database...");
         campgrounds.forEach(function(seed){
          Campground.create(seed,function(err,campground){//we put campground.create inside else statement because js doesn't wait for one statement to execute completely and switch onto the next so if we put .create statement inside our else then it have to check the previous if statement then switch onto the else
            if(err){
            console.log(err);
            }else{
                 console.log("created campground!");
                 
                 //creating a comment for each campground
                 Comment.create({
                 text: "The place was awesome, But i wish there should be some internet...",
                 author: "Disha Singla"
                 },function(err,comment){
                 if(err){
                 console.log(err);
                 }
                 else{
                 campground.comments.push(comment);
                 campground.save(function(err,data){
                     if(err){
                         console.log(err);
                     }else{
                         console.log(data);
                     }
                 });
                 console.log("comment added");
             }
           });
            }
         });
        
       });
      }
   });
  
}

module.exports=seedDB;
