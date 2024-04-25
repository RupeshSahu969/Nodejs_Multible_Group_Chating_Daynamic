require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

mongoose.connect('mongodb+srv://rupeshsahu969:rupesh@cluster0.iixrcst.mongodb.net/Chhating?retryWrites=true&w=majority&appName=Cluster0')

const userRoute = require("./routes/userRoute");
const User = require('./models/userModel');
const Chat=require('./models/chatModel');

app.use("/", userRoute);

const userNamespace = io.of('/user-namespace');

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

  // Handle new chat messages
  socket.on('newChat', function(data) {
    socket.broadcast.emit('loadNewChat', data);
  });

// load old chats

socket.on('existsChat',async function(data){
  var chats = await Chat.find({ $or:[
    {sender_id: data.sender_id, receiver_id: data.receiver_id},

    {sender_id: data.receiver_id, receiver_id: data.sender_id},

  ] })

  socket.emit('loadChats' , {chats:chats});

})

  socket.on('chatDeleted' ,function(id){
    socket.broadcast.emit('chatMessageDelete',id)
  });

  socket.on('chatUpdated' ,function(data){
    socket.broadcast.emit('chatMessageUpdated',data)
  });


});

http.listen(3000, function() {
    console.log('Server is running on port 3000');
});
