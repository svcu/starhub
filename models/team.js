const mongoose = require("mongoose");


var Schema = mongoose.Schema;

var teamSchema = new Schema({
        id: String,
        projects:[{
            id: String
        }],
        members: [{
            email: String
        }],
        name: String
});
// Compile model from schema
var team = mongoose.model('team', teamSchema );
module.exports = team