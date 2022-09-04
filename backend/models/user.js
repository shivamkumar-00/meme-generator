var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  admin: {
    type: Boolean,
    deafult: false,
  },
  images: {
    type: Array,
  },
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
