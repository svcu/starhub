const mongoose = require("mongoose");


var Schema = mongoose.Schema;

var fileSchema = new Schema({
            ident: {type: String, default: "0"},
            path: String
});
// Compile model from schema
var file= mongoose.model('file', fileSchema );
module.exports = file;