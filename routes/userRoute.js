const express = require("express");

const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const userController = require("../controllers/userController");
const session = require('express-session');
const { SESSION_SECRET } = process.env;

const userRoute = express();

// Session middleware
userRoute.use(session({
    
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

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

// Authentication middleware
const auth = require('../middlewares/auth');

// Routes
userRoute.get("/register", userController.registerLoad);

userRoute.post("/register", upload.single("image"), userController.register);

userRoute.get('/', auth.isLogout, userController.loadLogin);
userRoute.post('/', userController.login);
userRoute.get('/logout', auth.isLogin, userController.logout);

userRoute.get('/dashboard', auth.isLogin, userController.loadDashboard);
userRoute.post('/save-chat', userController.saveChat);
userRoute.post('/delete-chat', userController.deleteChat);
userRoute.post('/update-chat', userController.updateChat);

// Example of setting a cookie
userRoute.get('/set-cookie', (req, res) => {
    res.cookie('user_id', '12345', { maxAge: 900000, httpOnly: true });
    res.send('Cookie has been set');
});

// Example of retrieving a cookie
userRoute.get('/get-cookie', (req, res) => {
    const userId = req.cookies.user_id;
    res.send('User ID from cookie: ' + userId);
});

// Catch-all route
userRoute.get('*', function(req, res) {
    res.redirect('/');
});

module.exports = userRoute;
