import express from 'express';
import cookieParser from 'cookie-parser';
import userrouter from '../routes/user.routes.js';
import {fileURLToPath} from 'url';
import path from 'path';


import { Socket } from 'socket.io';
import http from 'http';
import User from '../models/user.model.js';
import { useReducer } from 'react';


const app=express();
const __filename= fileURLToPath(import.meta.url);
const __dirname= path.dirname(__filename);
const Server=http.createServer(app);
const io=new Socket(Server,{

    cors:{
        
        origin:"http://localhost:5173",
        methods:["GET","POST"],


        credentials:true
    }
});


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("/static",path.join(__dirname, '../../public','profileImage.png')));
app.use("/api/user",userrouter);


io.on("connection",(socket)=>{
    console.log("new client connected");
    socket.on("setup",(userData)=>{
        socket.join(userData.id);
        socket.emit("connected",userData);
        const userId=userData.id;
        socket.userId=userId;

        User.findByIdandUpdate(userId, { online: true }, { new: true })
        .then((user) => {
            console.log("User is online:", user);
        });
        io.emit("user online", userData);





    }
);
socket.on("join chat",(roomId)=>{
    socket.join(roomId);
    console.log("User joined room:", roomId);
});
socket.on("send message",(newMessage)=>{
    const chatId=newMessage.chatId;
    if(!chat.users){
        console.error("Chat.users is not defined");
         
        return;

    }
    socket.to(chatId).emit("new message",newMessage);

})
/* socket.on("fetch older messages",async(user)=>{
     const userId=user.userId;
}) */
socket.on("read",async (msgId,userId,chatId)=>{
   const chat=await Chat.findById(chatId);
   const users=chat.users;
   const recieveingUsersLength=users.length-1;
   
   if(!chat){
    return res.status(404).json({message:"Chat not found"});
   }
   const message=await Message.findById(msgId);
   const senderId=message.senderId;
   if(!message){
    return res.status(404).json({message:"Message not found"});
   }
   
   
   const readByUsers=message.readByUsers;
   const c=0;
   message.readBy.$addToSet(userId);
   if(message.readBy.length===recieveingUsersLength){
    io.to(senderId).emit("updateSeen",{chatId,msgId,status:"seen"});

   }
   
    
     chat.unreadCountPerUser.userId=c;

    io.to(userId).emit("updateUnreadMesages",{c,chatId});
    
    await chat.save();
    await message.save();

  
});
socket.on("delievered",async (msgId,userId,chatId)=>{
   const chat=await Chat.findById(chatId);
   
   if(!chat){
    return res.status(404).json({message:"Chat not found"});
   }
   const message=await Message.findById(msgId);
   const senderId=message.senderId;
   const recieveingUsersLength=chat.users.length-1;
   
  const c=0;
   if(!message){
    return res.status(404).json({message:"Message not found"});
   }
   const u=chat.unreadCountPerUser.userId;
   u?c=1:c=u+1;

   chat.unreadCountPerUser.userId=c;
  


   message.recievedBy.$addToSet(userId);
   if(message.recievedBy.length===recieveingUsersLength){
    io.to(senderId).emit("updateSeen",{msgId,chatId,status:"delievered"});
  
   

   }
    await chat.save();
   await message.save();
   io.to(userId).emit("updateUnreadMesages",{c,chatId});
});
 
    socket.on("typing",(typingInfo)=>{
        socket.in(typingInfo.chatId).emit("typing",typingInfo);
    });
    socket.on("stop typing",(typingInfo)=>{
        socket.in(typingInfo.chatId).emit("stop typing",typingInfo);
    });
     
  
   socket.on("disconnect",async ()=>{
    const stillConnected=Array.from(io.sockets.sockets.values()).some((s)=>s.userId===userData._id && s.id!==socket.id);
    if(!stillConnected) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false }, { new: true });
        console.log("User is offline");





    io.emit("user offline", userData

    );
    }
    console.log("User disconnected");
});
}); 
export default app;
