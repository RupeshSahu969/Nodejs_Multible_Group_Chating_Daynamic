const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');

const registerLoad = async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}; 

const register = async (req, res) => {
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            Image: '/images/' + req.file.filename, // Corrected path concatenation
            password: passwordHash
        });

        await user.save();

        res.render('register', { message: "You have successfully registered" }); // Fixed closing quotation mark and added message object

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const login = async (req, res) => {
    try {
        // Ensure that email and password are present in the request body
        const { email, password } = req.body;

        // Find the user by email
        const userData = await User.findOne({ email: email });

        if (userData) {
            // If user exists, compare passwords
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                // If passwords match, set user data in session
                req.session.user = userData;
                // Redirect to the dashboard page
                res.redirect('/dashboard');
            } else {
                // If passwords don't match, render login page with error message
                res.render('login', { message: 'Email and password are incorrect' });
            }
        } else {
            // If user doesn't exist, render login page with error message
            res.render('login', { message: 'Email and password are incorrect' });
        }
    } catch (error) {
        // Log specific error message for debugging
        console.log('Error in login:', error.message);
        // Send a more informative error response to the client
        res.status(500).send('Login failed. Please try again later.');
    }
};



const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadDashboard = async (req, res) => {
    try {
       const users= await User.find({ _id: {$nin:[req.session.user._id]}});
     res.render('dashboard', { user: req.session.user, users:users });


    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    registerLoad,
    register,
    loadDashboard,
    loadLogin,
    login,
    logout
};
