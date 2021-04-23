
var mongoose = require('mongoose');
//Set up default mongoose connection
var mongoDB = "mongodb://uy25ujhmmnnzpzpm5f8l:zEitlPv3Akks3wuLrog0@bv6fil2o8mkqsir-mongodb.services.clever-cloud.com:27017/bv6fil2o8mkqsir";
mongoose.connect(mongoDB, { useNewUrlParser: true });
 //Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
