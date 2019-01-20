var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema =new mongoose.Schema({
   username: String,
   password: String,
   firstName: String,
   lastName: String,
   avatar: String,
   email: String,
   aboutYou: String,
   image: String,
   imageId: String
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",UserSchema);

module.exports = User;