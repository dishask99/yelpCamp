var mongoose=require("mongoose");

var commentSchema=new mongoose.Schema({
    text: String,
    author: {
        
        id: {
            type: mongoose.Schema.Types.ObjectId ,   //this will provide users id
            ref: "User"
        },
        username: String
    },
    created: {type: Date, default: Date.now}
});

var Comment=mongoose.model("Comment",commentSchema);

module.exports=Comment;