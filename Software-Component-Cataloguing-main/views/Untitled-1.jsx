//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const password = "shreyansh";


//   bcrypt
//   .compare(password, a)
//   .then(res => {
//     console.log("Matching") // return true
//   })
//   .catch(err => console.error(err.message))

app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "secret"
}));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://indros0603:chIDkDUjLGg7HLHY@cluster0.ntmh4fz.mongodb.net/OrganHubDB",{ useNewUrlParser: true });

//Replace this with our schema
const HospitalSchema = new mongoose.Schema({
    hospitalName: String,
    state: String,
    city: String,
    contactNo:String,
    email:String,
    password:String,
    town:String,
    Address:String,
    PinCode: String,
    Website: String,
    HospitalLogo: String,
    offName: String,
    Specialization: String,
    AddressOfficer: String,
    emailOfficer:String,
    contactNoOfficer:String
})

const DonorSchema = {
    donorName: String,
    state: String,
    city: String,
    contactNo:String,
    email: String,
    password: String,
    age: Number
}

const AlertsSchema = {
    donorOrgan: String,
    donorUrgency: String,
    donorText: String,
    email: String
}

const OrgansSchema = {
    organ: String,
    date: String,
    time: String,
    bloodgroup: String,
    parameters: String,
    email: String
}


const ngoSchema = {
    name: String,
    regNo: String,
    ngoWebsite: String,
    ngoEmail: String,
    ngoProposal: String
}

const reportSchema = {
    email: String,
    reportName:String,
    date: String,
    time: String,
    report: String

}

HospitalSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

HospitalSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const Hospital = mongoose.model("Hospital", HospitalSchema); //add collection name here
const Donor = mongoose.model("Donor",DonorSchema);
const Alerts = mongoose.model("Alerts",AlertsSchema);
const Organs = mongoose.model("Organs",OrgansSchema);
const Info = mongoose.model("Ngo",ngoSchema);
const Report = mongoose.model("Report",reportSchema);

app.get("/", function(req, res) {
    res.render("home");
});

//    HOSPITAL
app.get("/loginHospital", function(req, res) {
    if(req.session.hospital){
        res.render("hospitalHome");
    }else{
        res.render("loginHospital");
    }
});

app.get("/signUpHospital", function(req, res) {
    res.render("SignUpHospital");
});

app.get("/hospitalHome", function(req, res) {
    if(req.session.hospital){
        console.log(req.session.hospital);
        res.render("hospitalHome");
    }
    else{
        res.redirect("/loginHospital");
    }
    
});

app.post("/SignUpHospital", function(req, res) {
    const saltRounds = 10;
    var hashedPassword = "";
    bcrypt.hash(req.body.password, saltRounds).then(hash => {
        hashedPassword = hash;
        console.log(hashedPassword);
    }).catch(err => console.error(err.message));

    const newUser = new Hospital({
        hospitalName: req.body.hospName,
        state: req.body.stt,
        city: req.body.city,
        offName: req.body.title+ req.body.fName,
        contactNo:req.body.contactNo,
        email:req.body.email,
        town:req.body.town,
        Address:req.body.hospitalAddress,
        PinCode: req.body.pincode,
        Website:  req.body.hospitalWebsite,
        HospitalLogo: req.body.hospitalLogo,
        Specialization: req.body.specialization,
        AddressOfficer: req.body.nodalOfficerAddress,
        contactNoOfficer: req.body.nodalOfficerContactNo,
        emailOfficer: req.body.nodalOfficerEmail
    });
    
    newUser.password = newUser.generateHash(req.body.password);
    console.log(newUser.password);

    newUser.save().then(()=>{
        res.render("loginHospital");
        console.log("New Hospital " + req.body.hospName + " account has been registered");
    }).catch((err)=>{
        console.log(err);
    })
});



app.post("/loginHospital", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    Hospital.findOne({email: email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(!foundUser.validPassword(req.body.password)){
                    res.render("loginHospitalerr");
                }else {
                    req.session.hospital= foundUser;
                    req.session.save();
                    console.log("User " + email + " has been successfully logged in");
                    res.redirect("/hospitalHome");
                }
            }else{
                
                res.render("loginHospitalerr");
            }
        }
        
    })
});

app.post("/loginUser", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(!(String(foundUser.password) === String(password))){
                    res.render("userLoginerr");
                }else {
                    req.session.user= foundUser;
                    req.session.save();
                    console.log("User " + email + " has been successfully logged in");
                    res.redirect("/userHome");
                }
            }else{
                
                res.render("userLoginerr");
            }
        }
        
    })
});

app.get("/donorForm",function(req,res){
    if(req.session.donor){
        res.render("donorForms");
    }else{
        res.render("donorLogin");
    }
    
});

app.get("/uProfile",function(req,res){
    if(req.session.donor){
        const email = req.session.donor.email;
        Donor.find({},function(err,foundDonor){
            console.log(foundDonor);
            res.render("donorProfile",{foundDonor:foundDonor, email:email});
        });
    }else{
        res.render("donorLogin");
    }
    
    
});

app.listen(3000, function() {
    console.log("Server starting on port 3000");
});