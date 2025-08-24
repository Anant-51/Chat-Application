import mongoose from "mongoose";
import express from 'express';
const router = express.Router();
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js"; 
import Message from "../models/message.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
router.use(express.json());
router.get("/chats",authMiddleware,async (req, res) => {
    try{
        const chats= await Chat.find({ users: req.user._id }).populate("users","-password").populate("latestMessage").sort({ updatedAt: -1 });
        chats=chats.filter((chat)=> chat.latestmessage !== null);
        if(!chats || chats.length === 0){
            return res.status(404).json({message:"No chats found"});
        }

        return res.status(200).json(chats);
    }catch(err){
        console.error("Error fetching chats:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
    })
    const chatExists =router.get("/chats/userId/:userId",authMiddleware,async (req, res) => {
        const c=0;
        try{
            const {userId}=req.params;
            if(!userId){
                return res.status(400).json({message:"User ID is required"});
            }
            const chat=await Chat.findOne({
                users: { $all: [req.user._id,userId] },
            }).populate("users","-password").populate("latestMessage");
            if(!chat){
               c=0;
               res.json({checkstatus:c});
        }
        res.json({checkstatus:1,chat});
    }
            
        catch(err){
            console.error("Error checking chat existence:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });  
           


    router.post("/chats/createPrivateChat", authMiddleware, async (req, res) => {
        try{
            
            const {users,chatname}=req.body.user;
            if(!users || users.length <1 ){
                return res.status(400).json({message:"At least one user is required to create a chat"});
            }
            users.push(req.user._id);
            if(!users || users.length <2 ){
                return res.status(400).json({message:"At least two users are required to create a chat"});
            }
            const newChat= new Chat({
                users,
                chatname:req.body.user.username
           
            });
            await newChat.save();
            const populatedChat=await newChat.populate("users","-password").populate("latestMessage");
            return res.status(201).json(populatedChat); 
        }
        catch(err){
            console.error("Error creating chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });
    router.post("/chats/creatGroupChat",authMiddleware, async (req, res) => {
        try{
            const {users,chatname,grouprofile}=req.body;
            if(!users || users.length <3 || !chatname){
                return res.status(400).json({message:"At least three users are required to create a group chat or chatname is required"});
            }
            const newGroupChat= new Chat({
                users,
                chatname,
                isGroupChat:true,
                admin:req.user._id,
                groupprofile
            });
            await newGroupChat.save();
            const populatedGroupChat=await newGroupChat.populate("users","-password").populate("latestMessage");
            return res.status(201).json(populatedGroupChat);
        }
        catch(err){
            console.error("Error creating group chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }   
    });
    router.post("/chats/removeuserFromgroup/:chatId",authMiddleware, async (req, res) => {
        try{
            const {chatId}=req.params;
            const {userId}=req.body;
            if(!userId){
                return res.status(400).json({message:"User ID is required"});
            }   
            const chat=await Chat.findById(chatId);
            if(!chat || !chat.isGroupChat){
                return res.status(404).json({message:"Chat not found or not a group chat"});
            }
            if(chat.admin.toString() !== req.user._id.toString()){
                return res.status(403).json({message:"Only admin can remove users from group chat"});
            }
            if(!chat.users.includes(userId)){
                return res.status(400).json({message:"User not found in the group chat"});
            }
            if(chat.admin.toString() === userId.toString()){
                chat.admin=chat.users[0] || null; 
            }// Set the first user as admin if the current admin is being removed
            chat.users = chat.users.filter(user => user.toString() !== userId);
            await chat.save();
            const updatedChat=await chat.populate("users","-password").populate("latestMessage");
            return res.status(200).json(updatedChat);
        }
        catch(err){
            console.error("Error removing user from group chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });
    router.post("/chats/addusertogroup/:chatId",authMiddleware, async (req, res) => {
        try{
            const {chatId}=req.params;
            const {userId}=req.body;
            if(!userId){
                return res.status(400).json({message:"User ID is required"});
            }
            const chat=await Chat.findById(chatId);
            if(!chat || !chat.isGroupChat){
                return res.status(404).json({message:"Chat not found or not a group chat"});
            }
            if(chat.admin.toString() !== req.user._id.toString()){
                return res.status(403).json({message:"Only admin can add users to group chat"});
            }
            if(chat.users.includes(userId)){
                return res.status(400).json({message:"User already exists in the group chat"});
            }
            chat.users.push(userId);
            await chat.save();
            const updatedChat=await chat.populate("users","-password").populate("latestMessage");
            return res.status(200).json(updatedChat);   
        }
        catch(err){
            console.error("Error adding user to group chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }   
    });
    router.post("/chats/leavegroup/:chatId",authMiddleware, async (req, res) => {
        try{
            const {chatId}=req.params;
            const userId=req.user._id;
            const chat=await Chat.findById(chatId);
            if(!chat || !chat.isGroupChat){
                return res.status(404).json({message:"Chat not found or not a group chat"});
            }
            if(!chat.users.includes(userId)){
                return res.status(400).json({message:"User not found in the group chat"});
            }
            chat.users = chat.users.filter(user => user.toString() !== userId.toString());
            if(chat.admin.toString() === userId.toString()){
                chat.admin=chat.users[0] || null; // Set the first user as admin if the current admin is leaving
            }   
            await chat.save();
            const updatedChat=await chat.populate("users","-password").populate("latestMessage");

            return res.status(200).json(updatedChat);

        }catch(err){
            console.error("Error leaving group chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
        });
        router.post("/chats/deleteGroupChat/:chatId",authMiddleware, async (req, res) => {
            try{
                const {chatId}=req.params;
                const chat=await Chat.findById(chatId);
                if(!chat || !chat.isGroupChat){
                    return res.status(404).json({message:"Chat not found or not a group chat"});
                }
                if(chat.admin.toString() !== req.user._id.toString()){
                    return res.status(403).json({message:"Only admin can delete group chat"});
                }
                await Message.deleteMany({ chat: chatId });
                const deletedChat=await Chat.findByIdAndDelete(chatId);
                if(!deletedChat){
                    return res.status(404).json({message:"Chat not found"});
                }
                return res.status(200).json({message:"Group chat deleted successfully"});
            }catch(err){
                console.error("Error deleting group chat:", err);
                return res.status(500).json({ message: "Internal server error", error: err.message });

            }
        }
        );
    router.post("/chats/renameGroupChat/:chatId",authMiddleware, async (req, res) => {
        try{
            const {chatId}=req.params;
            const {newChatName}=req.body;
            if(!newChatName){
                return res.status(400).json({message:"New chat name is required"});
            }
            const chat=await Chat.findById(chatId);
            if(!chat || !chat.isGroupChat){
                return res.status(404).json({message:"Chat not found or not a group chat"});
            }
            if(chat.admin.toString() !== req.user._id.toString()){
                return res.status(403).json({message:"Only admin can rename group chat"});
            }
            chat.chatname=newChatName;
            await chat.save();
            const updatedChat=await chat.populate("users","-password").populate("latestMessage");
            return res.status(200).json(updatedChat);
        }catch(err){
            console.error("Error renaming group chat:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });
    router.get("/chats/byChatName/:chatname", authMiddleware, async (req, res) => {
        try{
            const {chatname}=req.params;
            const regexquery = new RegExp(chatname, 'i'); // Case-insensitive search
            const chats = await Chat.find({ chatname: regexquery})
                .populate("users", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 });
            chats=chats.filter((chat)=>{chat.isGroupchat==false});
            const groupChats= await Chat.find({ chatname: regexquery, isGroupChat: true,users:{ $in: [req.user._id] } });
            const userChats = await User.find({ username: regexquery }).select("_id username profile");
            const allChats = [...chats,...userChats,...groupChats];
            if(allChats.length === 0){
                return res.status(404).json({message:"No chats found with the given name"});
            }
        
            return res.status(200).json(allChats);

        }
        catch(err){
            console.error("Error fetching chats by name:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });

export default router;

