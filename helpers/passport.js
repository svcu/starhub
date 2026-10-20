const passport = require("passport");
const local = require("passport-local").Strategy;
const user = require("../models/user")

passport.use(new local({
    usernameField: "email"
}, async (email, password, done)=>{
    const verifyUser = await user.findOne({email: email});

    if(verifyUser){
        const userSelected = await user.findOne({email: email});

        if(!userSelected){
            return  done(null, false, {message : "Not user with that email"})
        }else{
            const hash  = userSelected.password
            const newUser = new user({email, password});
            const match = await newUser.match(password, hash);

            if(match){
                return done(null, newUser)
            }else{
                return done(null, false, {message: "Wrong password"})
            }
        }
        

      

    }
}))

passport.serializeUser((userr, done)=>{
    console.log("USERRR: ", userr)
    done(null, userr.email)
})

passport.deserializeUser( (id, done)=>{
    console.log("ID: ", id)
      user.findOne({email: id}, (err, userr)=>{
          done(err, userr)
      });
})