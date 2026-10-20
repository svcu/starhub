const mongoose = require("mongoose");


var Schema = mongoose.Schema;

var repoSchema = new Schema({
            id: String,
            path: String,
            files:[{
                path: String,
                ident: String
            }]
});
// Compile model from schema
var repo= mongoose.model('repo', repoSchema );
module.exports = repo;