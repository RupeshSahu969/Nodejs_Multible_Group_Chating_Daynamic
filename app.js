require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);



const userRoute = require("./routes/userRoute");

const User = require('./models/userModel'); // Assuming UserModel is defined

// const Chat=require('./models/chatModel');

app.use("/", userRoute);

// Define namespace for user connections
const userNamespace = io.of('/user-namespace');

// Handle socket connections
userNamespace.on('connection', async function(socket) {
  console.log('User Connected');

  var userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({_id: userId}, {$set:{is_online:'1'}});

  userNamespace.emit('getOnlineUser', {user_id : userId});

  socket.on('disconnect', async function() {
      console.log('User Disconnected');
      var userId = socket.handshake.auth.token;
      await User.findByIdAndUpdate({_id: userId}, {$set:{is_online:'0'}});
      
      userNamespace.emit('getOfflineUser', {user_id : userId});
  });
});



http.listen(3000, function() {
    console.log('Server is running on port 3000');
});