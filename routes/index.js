const router = require("express").Router();

const fs = require("fs");
require("../config/db")
const repo = require("../models/repo");
const file = require("../models/file")
const user = require("../models/user");
const passport = require("passport");
const team = require("../models/team");
const zip = require("adm-zip")

function auth(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect("/login")
    }
}



router.get("/", auth,   async (req, res)=>{
    const files = await file.find();
    console.log(files)
    res.render("partials/login.hbs", { files })
})


//IN DEVELOPMENT FEATURES  (Not avaible now)

//Team work (In development)

router.get("/add-team", auth, async (req, res)=>{

    const users = await user.find()


    res.render("partials/add_team.hbs", {users})
})

router.get("/team", async(req, res)=>{
    res.send(await team.find())
})

router.post("/team", auth, async (req, res)=>{
    
    const name = req.body.name;
    const teamList = await team.find();
    const lastid = parseInt(teamList.length, 10)
    const id = lastid + 1;
    const email = req.user.email
    const errors = [];
    const selected = req.body.users

    if(!selected){
        errors.push({text: "You should select at least one user"})
    }

    const newTeam = new team({id, name})

    if(errors.length > 0) {
        res.render("partials/add_team.hbs", {errors})
    }else{
        
    await newTeam.save();
    await team.findOneAndUpdate({id: id}, {$push:{members:{email: email}}})

    const selected = req.body.users

    for (var i =0; i< selected.length; i++){
        await user.findOneAndUpdate({username: selected[i]}, {$push:{teamRequests:{id: id}}})
    }

    

    res.render("partials/add_team.hbs")

    console.log(selected)
    res.redirect("back")
    }

});

router.get("/invitations", auth ,async(req, res)=>{
    const email = req.user.email;
    const userSelected = await user.findOne({email: email});
    const invitations = userSelected.teamRequests;
    const names = [{
        "name" : ""
    }];

    for(var i=0; i<invitations.length; i++){
        const teamSelected = await team.findOne({id: invitations[i].id});
        const name = teamSelected.name;
        console.log("NAME BABY: ",name)
        names.push({name: name})
    }
        

    

    
    res.render("partials/invitations.hbs", {names})
})






//Users

router.get("/register", (req, res)=>{
    res.render("partials/register.hbs")
})

router.get("/login", (req, res)=>{
    res.render("partials/login.hbs")
})

router.post("/user", async (req, res)=>{ //Create user
    const list = await user.find();
    const lastId = parseInt(list.length, 10);
    const id = lastId + 1;
    const {username, email, password, confirm} = req.body;
    var errors = []

    if(password != confirm){
        errors.push({text: "Passwords does not match"})
    }

    if(password.length < 6){
        errors.push({text: "Password has to be at least 6 characters long"})
    }

    const v = await user.findOne({email: email});
    const vu = await user.findOne({username: username});

    if(v){
        errors.push({text: "Email already in use"})
    }

    if(vu){
        errors.push({text: "Username already in usee"})
    }

    if(errors.length > 0){
        res.render("partials/register.hbs", {errors, username, email, password, confirm})
    }else{
        const newUser = new user({id, username, email, password})

        newUser.password = await newUser.encrypt(newUser.password);
    
        const verif = await newUser.save();
    
        if(verif){
            res.redirect("/login")
        }else{
            res.send("Error")
        }
    }
   
})

router.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/login")
})

router.get("/users", async(req, res)=>{
    res.send(await user.find())
})

router.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}))

router.get("/dashboard", auth, (req, res)=>{

    const name = req.user.username;
    const repos = req.user.repos;
    const c = repos.length
    const note = req.user.notes
    const email = req.user.email

    console.log(req.user)

    res.render("partials/dashboard.hbs", {name, c, note, email});
})

router.get("/profile", auth, (req, res)=>{
    const name = req.user.username;
    const repos = req.user.repos;
    const c = repos.length
    const note = req.user.notes
    const email = req.user.email
    const description = req.user.description;
    const learning = req.user.learning;
    const edu = req.user.education

    res.render("partials/profile.hbs", {email, name, description, edu, learning})
})

router.post("/update-many", auth, async(req, res)=>{
    const {username, education, learning, user_email} = req.body;
    console.log(req.body)
    var errors = [];

    const vu = await user.findOne({username: username});

    if(vu){
        errors.push({text : "Username already in use"})
    }

    if(errors.length > 0){
        res.redirect("back", {errors})
    }

    if(username && education &&  learning){
        const verif = await user.findOneAndUpdate({email: user_email}, {username: username, education:education, learning: learning});
        if (verif){
            res.redirect("back")
        }
    }else if(education){
        const verif = await user.findOneAndUpdate({email: user_email}, {education:education});
        if (verif){
            res.redirect("back")
        }
    }else if(learning){
        const verif = await user.findOneAndUpdate({email: user_email}, {learning:learning});
        if (verif){
            res.redirect("back")
        }
    }else if(learning && education){
        const verif = await user.findOneAndUpdate({email: user_email}, {education:education, learning: learning});
        if (verif){
            res.redirect("back")
        }

    }else if(learning && username){
        const verif = await user.findOneAndUpdate({email: user_email}, {username: username, learning: learning});
        if (verif){
            res.redirect("back")
        }
    }else{
        const verif = await user.findOneAndUpdate({email: user_email}, {username: username, education: education});
        if (verif){
            res.redirect("back")
        }
    }

    
})

router.post("/update-description", auth,  async(req, res)=>{
    const {user_email, description} = req.body;

    await user.findOneAndUpdate({email: user_email}, {description: description});
    res.redirect("back")
})

router.get("/delete-user/:email", auth, async(req, res)=>{
    const userSelected = await user.findOne({email: req.params.email});
    const repos = userSelected.repos;

    for (var i=0; i<repos.length; i++){
        fs.rmdirSync("./storage/projects/"+repos[i].path, {recursive: true});
    }

    await user.findOneAndDelete({email: req.params.email});
    req.logOut();
    res.redirect("/")
})

router.get("/download-repo/:id", async(req, res)=>{
    
    const repoSelected = await repo.findOne({id: req.params.id});
    console.log(repoSelected)
    const path = repoSelected.path;
    var upload = fs.readdirSync(__dirname+"/storage/projects/"+path);

    const zipFile = new zip();

    for(var i =0; i<upload.length; i++){
        zipFile.addLocalFile(__dirname+"/storage/projects/"+path+"/"+upload[i]);
    }

    const downloadname = path+".zip";
    const data = zipFile.toBuffer()

    zipFile.writeZip(__dirname+"/storage/projects/"+path+"/");

    res.set('Content-Type','routerlication/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadname}`);
    res.set('Content-Length',data.length);
    res.send(data);



});


//Notes

router.post("/note", async(req, res)=>{ // Create note
    const email = req.body.email
    console.log(req.body)
    const userSelected = await user.findOne({email: email});
    const notesList = userSelected.notes;
    const lastId = parseInt(notesList.length, 10);
    const id = lastId + 1;
    const text = req.body.text
    var error = [];

    if(text == ""){
        error.push({text: "Note text can not be null"})
    }

    if(email == ""){
        error.push({text: "There was an error"})
    }

    if(error.length > 0){
        res.redirect("back", {error})
    }

 
        const verif  = await user.findOneAndUpdate({email: req.body.email}, {$push:{notes:{id: id, text: text, creator: email}}})
    if(verif){
        res.redirect("back")
    }else{
        res.send("Error")
    }
    
    
    
})

router.get("/notes/:email", async(req, res)=>{
    const userSelected = await user.findOne({email: req.params.email});
    const notes = userSelected.notes;

    res.send(notes)
})

router.get("/delete/note/:id/:creator", auth, async(req, res)=>{
    await user.findOneAndUpdate({email: req.params.creator}, {$pull:{notes:{id: req.params.id}}})
    res.redirect("back")

})








//Folders

router.post("/folder/:name", (req, res)=>{ //Creating a folder

    const path = req.body.repo + "/" + req.params.name

    fs.mkdirSync("./storage/projects/" + path);
    res.send("OK")
})

router.delete("/folder/:name", (req, res)=>{ //Deleting a folder
    fs.rmdir("./storage/projects/" + req.body.repo + "/" + req.params.name, (err)=>{
        if(err){
            console.log(err);
            res.send("Error");
        }else{
            res.send("OK")
        }
    })
})




//Repositories

router.get("/add-repo", auth, (req, res)=>{

    const email = req.user.email

    res.render("partials/add-repo.hbs", {email});


})

router.post("/repo", async (req, res)=>{ //Creating a repository
    const list = await repo.find();
    const lastid = parseInt(list.length, 10);
    const id = lastid + 1;

    const path = req.body.name;
    const newRepo = new repo({id, path});

    fs.mkdir("./storage/projects/"+path, (err)=>{
        if(err){
            console.log(err);
            res.send("Error")
        }
    });

    const rep = await newRepo.save();
    await user.findOneAndUpdate({email: req.body.email}, {$push:{repos:{id: id, path:path}}})

    if(rep){
        res.redirect("back");
    }else{
        res.send("Error")
    }

    
    
})

router.get("/repo", async (req, res)=>{ // Getting all the repositiories
    res.send(await repo.find())
})

router.get("/user/repo/:email", async (req, res)=>{
    const userSelected = await user.findOne({email: req.params.email});
    const repos = userSelected.repos;

    res.send(repos)
})

router.get("/user/repo-count/:email", async(req, res)=>{
    const userSelected = await user.findOne({email: req.params.email});
    const repos = userSelected.repos;

    res.send(repos.length)
})

router.get("/repos", auth, (req, res)=>{

    const repos = req.user.repos;
    const name = req.user.name

    console.log(repos)

    res.render("partials/repos.hbs", {repos, name})
})

router.get("/repo/:id", auth, async(req, res)=>{
    const repoSelected = await repo.findOne({id: req.params.id});
    const file = repoSelected.files;
    const name = req.user.name
    const id = req.params.id

    res.render("partials/repo-view.hbs", {file, name, id})
})

//Files

router.get("/add-file", auth, (req, res)=>{

    const repo = req.user.repos;

    res.render("partials/add-file.hbs", {repo})

})

router.post("/file", auth, async (req, res)=>{ //Creating a file

    const list = await file.find();
    const lastid = parseInt(list.length, 10);
    const ident = lastid + 1;

    const path = req.body.repo + "/" + req.body.name;

    const newFile = new file({ident, path});

    fs.open("./storage/projects/"+path, "w",  (err, file)=>{
        if(err){
            console.log(err);
            res.send("Error")
        }
    })

    const verif = await newFile.save();

    if(verif){
        const verif2 = await repo.findOneAndUpdate({path: req.body.repo}, {$push:{files:{path: path, ident: ident}}})
        if(verif2){
            res.redirect("back");
        }else{
            res.send("Error")
        }

       
    }else{
        res.send("Error")
    }
})

router.post("/file-edit/:ident", auth, async(req, res)=>{ //Updating a file

    const fileSelected = await file.findOne({ident: req.params.ident});
    const path = fileSelected.path;


    
   
    
    fs.writeFile("./storage/projects/"+path, req.body.text,  (err)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect("back")
        }
    })
  
})

router.get("/file", async(req, res)=>{ //Getting all the files in the router
    res.send(await file.find())
})

router.get("/file/yes", (req, res)=>{ //Getting an specific file by name
    const file = fs.readFileSync("./storage/projects/"+req.body.path, "utf-8");

    if(file){
        res.send(file)
    }else{
        res.send("Error")
    }
    
})

router.get("/file/:id", async (req, res)=>{ //Getting an specific file by id

    const fileDb = await file.findOne({id: req.params.id});

    const name = fileDb.path;


    const fileSend = fs.readFileSync("./storage/projects/"+name);

    if(fileSend){
        res.send(fileSend)
    }else{
        res.send("Error")
    }
    
})

router.delete("/file/yes", (req, res)=>{ //Deleting a file
    try{
        fs.unlink("./storage/projects/"+req.body.path);
        res.send()
    }catch (err){
        console.log(err);
        res.send("Error")
    }
    

   
    
})

router.get("/edit/:id", auth, async(req, res)=>{

    const fileSelected = await file.findOne({ident: req.params.id});
    const path = fileSelected.path;
    const ident = req.params.id;

    const text = fs.readFileSync("./storage/projects/"+path);

    res.render("partials/edit.hbs", {path, text, ident})
    
    
    

   
})









module.exports = router;