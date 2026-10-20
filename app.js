const express = require("express");
const app= express();
const morgan = require("morgan");
require("./config/db")
const exphbs=require("express-handlebars");
const passport = require("passport");
const session = require("express-session")
var SOCKETIO = require('socket.io'); 




require("./helpers/passport")



//Settings

app.set("port", process.env.PORT || 3000);
app.set("views", "./views");
app.set("view-engine", ".hbs")

//Middlewares

app.use(morgan("dev"));
app.use(express.json());
app.use(session({
    secret: "starhubsecretcode",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("./views/"))
app.use(express.static("./storage/projects"));
app.use(express.static('./node_modules'));  
app.engine(".hbs", exphbs({
        defaultLayout:"main.hbs",
        layoutsDir: app.get("views")+ "/layouts",
        partialsDir: app.get("views") + "/partials",
        extname : ".hbs",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
          }
       
}))

app.use(express.urlencoded({extended: false}))


//Server initializing



const server = app.listen(app.get("port"), (err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("Server running on port: ", app.get("port"))
    }
})


const io = SOCKETIO(server);

io.on("connection", (socket)=>{
    console.log("New onnection with id", socket.id);
})




app.use(require("./routes/index"));