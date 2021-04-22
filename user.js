const mongoose = require("mongoose");
const crypt = require("bcryptjs");


var Schema = mongoose.Schema;

var userSchema = new Schema({
         id: String,
         email: String,
         password: String,
         username: String,
         repos: [{
             id: String,
             path: String
         }],
         notes:[{
             id: String,
             text: String,
             creator: String
         }],
         description: String,
         education: String, 
         interests: String,
         learning: String
});

userSchema.methods.encrypt = async(password)=>{
    const salt = await crypt.genSalt(10);
    const hash = crypt.hash(password, salt);
    return hash;
}

userSchema.methods.match = async(password, hash)=>{
    return await crypt.compare(password, hash)
}



var user = mongoose.model('user', userSchema );
module.exports = user