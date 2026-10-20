const helpers = {};

helpers.isAuthenticated = (req, res, next)=>{
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login")
    }

    
};

module.exports = helpers