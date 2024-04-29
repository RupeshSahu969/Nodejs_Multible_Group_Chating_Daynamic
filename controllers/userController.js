const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const Chat = require('../models/chatModel');

const registerLoad = async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error in registerLoad:', error);
        res.status(500).send('Internal Server Error');
    }
};

const register = async (req, res) => {
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            Image: '/images/' + req.file.filename,
            password: passwordHash
        });

        

        await user.save();

        res.render('register', { message: "You have successfully registered" });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).send('Internal Server Error');
    }
};

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error in loadLogin:', error);
        res.status(500).send('Internal Server Error');
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email }).maxTimeMS(10000);

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user = userData;
                res.cookie(`user`,JSON.stringify(userData))
                
                return res.redirect('/dashboard');
            }
        }

        res.render('login', { message: 'Email and password are incorrect' });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Login failed. Please try again later.');
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('user');
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).send('Internal Server Error');
    }
};

const loadDashboard = async (req, res) => {
    try {
       const users = await User.find({ _id: { $nin: [req.session.user._id] } });
       res.render('dashboard', { user: req.session.user, users: users, sender_id: req.session.user._id });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const saveChat = async (req, res) => {
    try {
        const chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });

        const newChat = await chat.save();

        res.status(200).send({ success: true, msg: 'Chat Successfully', data: newChat });
    } catch (error) {
        console.error('Error in saveChat:', error);
        res.status(400).send({ success: false, msg: error.message });
    }
};

const deleteChat= async(req,res)=>{
    try {
        await Chat.deleteOne({_id:req.body.id})

        res.status(200).send({success:true});

    } catch (error) {
        res.ststus(400).send({success:false,msg:error.message})
    }
}

const updateChat =async(req,res)=>{
    try {
        await Chat.findByIdAndUpdate({_id:req.body.id}, {
            $set:{
                message:req.body.message
            }
        })


        
        res.status(200).send({success:true});

    } catch (error) {
        res.ststus(400).send({success:false,msg:error.message})
    }
    
}


module.exports = {
    registerLoad,
    register,
    loadDashboard,
    loadLogin,
    login,
    logout,
    saveChat,
    deleteChat,
    updateChat,

};