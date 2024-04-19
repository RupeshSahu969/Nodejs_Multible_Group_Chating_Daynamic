const express = require("express");
const bodyParser = require("body-parser");

const path = require("path");
const multer = require("multer");
const userController = require("../controllers/userController");

const session=require('express-session');
const {SESSION_SECRET}=process.env;


const userRoute = express();
userRoute.use(session({secret:SESSION_SECRET}));
// Body parsing middleware
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

// Set view engine and views directory
userRoute.set("view engine", "ejs");
userRoute.set("views", path.join(__dirname, "../views"));

// Serve static files from the "public" directory
userRoute.use(express.static("public"));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "_" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

const auth=require('../middlewares/auth');


// Routes
userRoute.get("/register", userController.registerLoad);
userRoute.post("/register", upload.single("image"), userController.register);

userRoute.get('/',auth.isLogout,userController.loadLogin)
userRoute.post('/',userController.login)
userRoute.get('/logout',auth.isLogin,userController.logout)

userRoute.get('/dashboard',auth.isLogin,userController.loadDashboard)

userRoute.get('*', function(req,res){
    res.redirect('/');

})



module.exports = userRoute;
