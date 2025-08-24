import mongoose from "mongoose";
import Message from "../models/message.model";
import express from 'express';
import authMiddleware from "../middleware/auth.middleware";
import cloudinary from "../lib/cloudinary.config";
import upload from "../utils/multer.util";
import fs from 'fs';
import pdfParse from 'pdf-parse';
const router = express.Router();
router.use(express.json());
router.get("/messages/:chatId", authMiddleware,async (req, res) => {
    try{
        const {chatId}=req.params;
        const messages=await Message.find({chat:chatId}).populate("sender","username profile").populate("chat","users");
        return res.status(200).json(messages);
    }catch(err){
        console.error("Error fetching messages:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }});
    router.post("/messages/:chatId",authMiddleware,upload.single("file"), async (req, res) => {
        try{
            const {chatId}=req.params;
            const {content}=req.body;
            const sender=req.user.id;
            if(!content || !sender){
                return res.status(400).json({message:"Content and sender are required"});
            }
            if(req.file){
            const localpath=req.file.path;
            const sizeMB = (req.file.size / 1024 / 1024).toFixed(1);
            let pageCount = null;

           if (req.file.mimetype === 'application/pdf') {
           const dataBuffer = fs.readFileSync(filePath);
           const pdfData = await pdfParse(dataBuffer);
           pageCount = pdfData.numpages;
        }

            
            const result=await cloudinary.uploader.upload(localpath, { resource_type: "auto" ,folder: "chat-app/messages-files"});
            const fileurl=result.secure_url;
            const filetype=result.resource_type;
            fs.unlinkSync(localpath); // Delete the local file after uploading
            
            }
            const newMessage=new Message({
                content,
                sender,
                chat:chatId,
                fileurl: req.file ? fileurl : null,
                filetype: req.file ? filetype : null,
                mediaSize: req.file ? sizeMB : null,
                pageCount: pageCount || null

            });
            await newMessage.save();
            const populatedMessage=await newMessage.populate("sender","username profile").populate("chat","users");
            const latestMessage=await Chat.findBYIdAndUpdate(chatId,{latestMessage:populatedMessage._id},{new:true}).populate("users","-password").populate("latestMessage");
            if(!latestMessage){ 
                return res.status(404).json({message:"Chat not found"});
            }
            return res.status(201).json(populatedMessage);
        }catch(err){
            console.error("Error sending message:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    });
export default router;