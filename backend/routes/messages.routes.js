import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.config.js";
import upload from "../utils/multer.util.js";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

const router = express.Router();

router.get("/getMessages", authMiddleware, async (req, res) => {
  try {
    const chatId = req.query.chatId;
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    let query = { chat: chatId };

    const cursor = req.query.cursor;
    let parsedCursor = null;

    if (cursor && cursor !== "null") {
      const timestamp = parseInt(cursor);
      if (!isNaN(timestamp)) {
        parsedCursor = new Date(timestamp);
      }
    }

    if (parsedCursor) {
      query.createdAt = { $lt: parsedCursor };
    }

    let limit = parseInt(req.query.limit) || 20;

    const messages = await Message.find(query)
      .populate("sender", "username profile")
      .populate("chat", "users isGroupChat")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    const nextCursor = hasMore
      ? messages[messages.length - 1].createdAt.getTime().toString()
      : null;
    messages.reverse();
    return res.status(200).json({ messages, nextCursor, hasMore });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.get("/allMessages", authMiddleware, async (req, res) => {
  const chatId = req.query.chatId;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username profile")
      .populate("chat", "users isGroupChat")
      .sort({ createdAt: -1 });
    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post(
  "/postMessages",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const chatId = req.query.chatId;
      const content = req.body.text;
      const sender = req.user._id;
      let specialMessageType = null;
      let messageType = null;
      if (req.body?.messageType) {
        specialMessageType = req.body.messageType;
      }

      console.log("sender", sender);

      if ((!content && !req.file) || !sender || !chatId) {
        return res
          .status(400)
          .json({ message: "Content/file, sender, and chatId are required" });
      }

      let fileUrl = null;
      let fileType = null;
      let fileFormat = null;
      let publicId = null;
      let sizeOfFile = null;
      let pageCount = null;

      if (req.file) {
        const localpath = req.file.path;
        sizeOfFile = req.file.size;

        if (req.file.mimetype === "application/pdf") {
          try {
            const dataBuffer = fs.readFileSync(localpath);
            const pdfDoc = await PDFDocument.load(dataBuffer);
            pageCount = pdfDoc.getPageCount();
          } catch (pdfError) {
            console.error("Error parsing PDF:", pdfError);

            pageCount = null;
          }
        }

        console.log("req.file.mimetype:", req.file.mimetype);
        const resourceType =
          req.file.mimetype === "application/pdf" ? "raw" : "auto";
        console.log("resourceType:", resourceType);

        const result = await cloudinary.uploader.upload(localpath, {
          resource_type: resourceType,
          folder: "chat_app/message_files",
          type: "upload",
          access_mode: "public",
        });

        fileUrl = result.secure_url;
        fileType = (result.resource_type || "").toLowerCase();
        if (req.file.mimetype === "application/pdf") {
          fileFormat = "pdf";
        } else {
          fileFormat = (result.format || "").toLowerCase();
        }
        publicId = result.public_id;

        try {
          fs.unlinkSync(localpath);
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
        }
      }
      if (specialMessageType) {
        messageType = specialMessageType;
      } else {
        if (req.file) {
          messageType = fileFormat;
        } else {
          messageType = "text";
        }
      }
      const newMessage = new Message({
        content: content || "",
        sender,
        chat: chatId,

        messageType: messageType,
        fileUrl: fileUrl,
        fileType: fileType,
        mediaSize: sizeOfFile,
        pageCount: pageCount,
        publicId: publicId,
        originalFileName: req.file ? req.file.originalname : null,
      });

      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "username profile ")
        .populate({
          path: "chat",
          select:
            "users isGroupChat chatName chatNameForPrivateChat chatImage chatImageForPrivateChat",
          populate: {
            path: "users",
            select: "-password",
          },
        });

      const latestMessage = await Chat.findByIdAndUpdate(
        chatId,
        { latestMessage: populatedMessage._id },
        { new: true }
      )
        .populate("users", "-password")
        .populate("latestMessage");

      await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: populatedMessage._id } },
        { new: true }
      );

      if (!latestMessage) {
        return res.status(404).json({ message: "Chat not found" });
      }

      return res.status(200).json(populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);

      return res.status(500).json({
        message: "Error sending message",
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }
);

router.post("/addedMembersNotify", authMiddleware, async (req, res) => {
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res
      .status(400)
      .json({ message: "Chat ID and message are required" });
  }
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const content = message;
    const sender = req.user.id;
    const newMessage = new Message({
      content,
      sender,
      chat: chatId,
      messageType: "groupChatModification",
    });
    await newMessage.save();
    return res.status(200).json({ message: "Notified successfully" });
  } catch (err) {
    console.error("Error notifying members:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/removedMembersNotify", authMiddleware, async (req, res) => {
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res
      .status(400)
      .json({ message: "Chat ID and message are required" });
  }
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const content = message;
    const sender = req.user.id;
    const newMessage = new Message({
      content,
      sender,
      chat: chatId,
      messageType: "groupChatModification",
    });
    await newMessage.save();
    return res.status(200).json({ message: "Notified successfully" });
  } catch (err) {
    console.error("Error notifying members:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/leftGroupNotify", authMiddleware, async (req, res) => {
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res
      .status(400)
      .json({ message: "Chat ID and message are required" });
  }
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const content = message;
    const sender = req.user.id;
    const newMessage = new Message({
      content,
      sender,
      chat: chatId,
      messageType: "groupChatModification",
    });
    await newMessage.save();
    return res.status(200).json({ message: "Notified successfully" });
  } catch (err) {
    console.error("Error notifying members:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/markDownloaded", authMiddleware, async (req, res) => {
  const { messageId, userId } = req.body;
  if (!messageId) {
    return res.status(400).json({ message: "Message ID is required" });
  }
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    message.isDownloaded.push(userId);
    await message.save();
    return res.status(200).json({ message: "Message marked as downloaded" });
  } catch (err) {
    console.error("Error marking message as downloaded:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/setLatestMessageType", authMiddleware, async (req, res) => {
  const { messageId, messageType } = req.body;
  if (!messageId || !messageType) {
    return res
      .status(400)
      .json({ message: "Message ID and message type are required" });
  }
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    message.latestMessageType = messageType;
    await message.save();
    return res
      .status(200)
      .json({ message: "Message type updated successfully" });
  } catch (err) {
    console.error("Error updating message type:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

export default router;
