import mongoose from "mongoose";
import { Router } from "express";
const router = Router();
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../utils/multer.util.js";
import cloudinary from "../lib/cloudinary.config.js";
import { io } from "../app/app.js";
import multer from "multer";
import fs from "fs";

router.get("/allChats", authMiddleware, async (req, res) => {
  res.set("Cache-Control", "no-store");
  console.log("entered /allChats");
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "username _id ",
        },
      })
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "username _id ",
        },
      })
      .sort({ updatedAt: -1 });

    const chatList = Array.isArray(chats) ? chats : [];

    const data = chatList.map((chat) => {
      const unrecievedMessages = chat.messages.filter((msg) => {
        const senderId = msg.sender?._id?.toString();
        if (!senderId) return false; // skip corrupted
        return (
          !msg.receivedBy?.includes(req.user._id) &&
          senderId !== req.user._id.toString()
        );
      });

      const unreadMessages = chat.messages.filter((msg) => {
        const senderId = msg.sender?._id?.toString();
        if (!senderId) return false; // skip corrupted
        return (
          !msg.readBy?.includes(req.user._id) &&
          senderId !== req.user._id.toString()
        );
      });

      return {
        _id: chat._id,
        chatName: chat.chatName,
        chatNameForPrivateChat: chat.chatNameForPrivateChat,
        isGroupChat: chat.isGroupChat,
        users: chat.users,
        latestMessage: chat.latestMessage,
        unrecievedMessages,
        chatImage: chat.chatImage,
        chatImageForPrivateChat: chat.chatImageForPrivateChat,
        unreadMessagesCount: unreadMessages.length,
        updatedAt: chat.updatedAt,
      };
    });
    const formattedData = data.map((d) => ({
      ...d,
      chatCreated: true,
    }));
    console.log("formattedData", formattedData);

    return res.status(200).json({ formattedData: formattedData });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.get("/searchChats", authMiddleware, async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const searchItem = req.query.searchItem?.trim() || "";
    const regexStartsWith = new RegExp(`^${searchItem}`, "i");
    const regexContains = new RegExp(searchItem, "i");

    const matchingChats = await Chat.find({
      users: { $in: [req.user._id] },
      $or: [
        { chatName: regexContains },
        {
          chatNameForPrivateChat: {
            $elemMatch: {
              username: regexContains,
              userId: { $ne: req.user._id },
            },
          },
        },
      ],
    })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "username _id ",
        },
      })
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "username _id ",
        },
      })
      .sort({ updatedAt: -1 });
    const formattedChats = matchingChats.map((chat) => {
      const unrecievedMessages = chat.messages.filter(
        (msg) =>
          !msg.receivedBy?.includes(req.user._id) &&
          msg.sender._id.toString() !== req.user._id.toString()
      );
      const unreadMessages = chat.messages.filter(
        (msg) =>
          !msg.readBy?.includes(req.user._id) &&
          msg.sender._id.toString() !== req.user._id.toString()
      );

      return {
        _id: chat._id,
        chatName: chat.chatName,
        chatNameForPrivateChat: chat.chatNameForPrivateChat,
        isGroupChat: chat.isGroupChat,
        users: chat.users,
        latestMessage: chat.latestMessage,
        unrecievedMessages,
        chatImage: chat.chatImage,
        chatImageForPrivateChat: chat.chatImageForPrivateChat,
        unreadMessagesCount: unreadMessages.length,
        chatCreated: true,
      };
    });

    const existingPrivateChatUserIds = new Set(
      matchingChats
        .filter((chat) => chat.isGroupChat === false)
        .flatMap((chat) =>
          chat.users
            .filter((u) => u._id.toString() !== req.user._id.toString())
            .map((u) => u._id.toString())
        )
    );

    const usersStarting = await User.find({
      username: regexStartsWith,
      _id: {
        $ne: req.user._id,
        $nin: Array.from(existingPrivateChatUserIds),
      },
    }).select("-password");

    const usersStartingIds = usersStarting.map((u) => u._id.toString());

    const usersContaining = await User.find({
      username: regexContains,
      _id: {
        $ne: req.user._id,
        $nin: [...existingPrivateChatUserIds, ...usersStartingIds],
      },
    }).select("-password");

    const formattedUsers = [...usersStarting, ...usersContaining].map((u) => ({
      ...u.toObject(),
      chatCreated: false,
    }));

    const allResults = [...formattedChats, ...formattedUsers];

    return res.status(200).json({
      message: "success",
      chats: allResults,
      formattedChats,
      formattedUsers,
    });
  } catch (err) {
    console.error("Error fetching chats by name:", err);
    return res.status(500).json({
      message: "Internal server error",
      chats: [],
    });
  }
});

router.get("/chatInfo", authMiddleware, async (req, res) => {
  const chatId = req.query.chatId;
  try {
    const chat = await Chat.findById(chatId).populate("users", "-password");
    const user = await User.findById(chatId);
    if (!chat && !user) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat) {
      return res.status(200).json({ chat, isChat: true });
    }
    if (user) {
      return res.status(200).json({ user, isChat: false });
    }
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.get("/chatInfoForPrivateChat", authMiddleware, async (req, res) => {
  const chatId = req.query.chatId;
  try {
    const chat = await Chat.findById(chatId).populate("users", "-password");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const members = chat.users;
    const otherMember = members.find(
      (member) => member._id.toString() !== req.user._id.toString()
    );
    const profileImage = otherMember.profile;
    const statusMessage = otherMember.statusMessage;
    const username = otherMember.username;
    return res.status(200).json({ profileImage, statusMessage, username });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.get("/commonGroups", authMiddleware, async (req, res) => {
  const chatId = req.query.chatId;
  const chat = await Chat.findById(chatId);

  const users = chat.users;

  if (!users || users.length < 2)
    return res.status(400).json({ message: "Invalid private chat" });

  const [userId, otherUserId] = users;
  try {
    const chats = await Chat.find({
      users: { $in: [userId, otherUserId] },
      isGroupChat: true,
    });
    return res.status(200).json({ commonGroups: chats });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.get("/membersOfChat", authMiddleware, async (req, res) => {
  try {
    const chatId = req.query.chatId;
    console.log("chatId from members of chat", chatId);
    const chat = await Chat.findById(chatId).populate("users", "-password");
    console.log("chat from members of chat", chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.get("/chatDetails", authMiddleware, async (req, res) => {
  const chatId = req.body.chatId;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.get("/chats", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chats = chats.filter((chat) => chat.latestmessage !== null);
    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }

    return res.status(200).json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.get("/isChat", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.query;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(200).json({ message: "Chat not found" });
    }
    return res.status(200).json({ isChat: true });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
const chatExists = router.get(
  "/userId/:userId",
  authMiddleware,
  async (req, res) => {
    const c = 0;
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const chat = await Chat.findOne({
        users: { $all: [req.user._id, userId] },
      })
        .populate("users", "-password")
        .populate("latestMessage");
      if (!chat) {
        c = 0;
        res.json({ checkstatus: c });
      }
      res.json({ checkstatus: 1, chat });
    } catch (err) {
      console.error("Error checking chat existence:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
);

router.post("/createPrivateChat", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      users: { $all: [req.user._id, req.body.userId] },
    });
    if (chat) {
      return res.status(200).json({ message: "Chat already exists" });
    }
    let users = [];
    users.push(req.body.userId);
    if (!users || users.length < 1) {
      return res
        .status(400)
        .json({ message: "At least one user is required to create a chat" });
    }
    users.push(req.user._id);
    if (!users || users.length < 2) {
      return res
        .status(400)
        .json({ message: "At least two users are required to create a chat" });
    }
    const firstUser = await User.findById(req.user._id);
    const secondUser = await User.findById(req.body.userId);
    let chatImageForPrivateChat = [];
    if (firstUser.profile) {
      chatImageForPrivateChat.push({
        userId: firstUser._id,
        profile: firstUser.profile,
      });
    }
    if (secondUser.profile) {
      chatImageForPrivateChat.push({
        userId: secondUser._id,
        profile: secondUser.profile,
      });
    }
    let chatNameForPrivateChat = [];
    chatNameForPrivateChat.push({
      userId: firstUser._id,
      username: firstUser.username,
    });
    chatNameForPrivateChat.push({
      userId: secondUser._id,
      username: secondUser.username,
    });

    const newChat = new Chat({
      users,
      chatNameForPrivateChat,
      isGroupChat: false,
      chatImageForPrivateChat,
    });
    await newChat.save();
    const populatedChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("latestMessage");

    return res.status(200).json({ populatedChat, done: "1" });
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
      done: "0",
    });
  }
});
router.post(
  "/createGroupChat",
  upload.single("file"),
  authMiddleware,
  async (req, res) => {
    try {
      const { groupName, groupDescription } = req.body;
      let users = req.body.users;
      console.log("Users:", users);
      if (typeof users === "string") {
        users = JSON.parse(users);
      }
      console.log("Users received:", users);
      console.log("Type:", typeof users);

      let chatImage = null;
      if (!users || users.length < 3) {
        return res.status(400).json({
          message: "At least three users are required to create a group chat",
        });
      }
      if (!groupName) {
        return res.status(400).json({
          message: "groupName is required",
        });
      }

      users.push(req.user._id);

      console.log("All user IDs (including creator):", users);

      const existingUsers = await User.find({ _id: { $in: users } });
      console.log(
        `Found ${existingUsers.length} out of ${users.length} users in database`
      );
      console.log(
        "Existing user IDs:",
        existingUsers.map((u) => u._id.toString())
      );

      if (existingUsers.length !== users.length) {
        const foundIds = existingUsers.map((u) => u._id.toString());
        const missingIds = users
          .map((id) => id.toString())
          .filter((id) => !foundIds.includes(id));
        console.log("Missing user IDs:", missingIds);

        return res.status(400).json({
          message: "Some users were not found in the database",
          missingIds: missingIds,
        });
      }

      if (req.file) {
        const localpath = req.file.path;
        const result = await cloudinary.uploader.upload(localpath, {
          resource_type: "auto",
          folder: "chat_app/group_profile_pics",
        });
        const fileUrl = result.secure_url;
        chatImage = fileUrl;
        fs.unlinkSync(localpath);
      }
      const newGroupChat = new Chat({
        users: users,
        chatName: groupName,
        isGroupChat: true,
        admin: req.user._id,
        chatImage,
        groupDescription,
      });
      await newGroupChat.save();
      const populatedGroupChat = await Chat.findById(newGroupChat._id)
        .populate("users", "-password")
        .populate("latestMessage");
      populatedGroupChat.users.forEach((user) => {
        io.to(user).emit("new chat", populatedGroupChat);
      });
      return res.status(200).json({ populatedGroupChat, done: "1" });
    } catch (err) {
      console.error("Error creating group chat:", err);
      return res.status(500).json({
        message: "Internal server error",
        error: err.message,
        done: "0",
      });
    }
  }
);
router.post("/removeMembersFromgroup", authMiddleware, async (req, res) => {
  try {
    const { selectedMembers, chatId } = req.body;
    if (selectedMembers.length === 0) {
      return res
        .status(400)
        .json({ message: "Atleast one member is required" });
    }
    if (typeof selectedMembers === "string") {
      selectedMembers = JSON.parse(selectedMembers);
    }
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ message: "Chat not found or not a group chat" });
    }
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can remove users from group chat" });
    }
    for (const userId of selectedMembers) {
      if (!chat.users.some((user) => user.toString() === userId.toString())) {
        return res
          .status(400)
          .json({ message: "User not found in the group chat" });
      }
    }
    selectedMembers.forEach((userId) => {
      if (chat.admin.toString() === userId.toString()) {
        chat.admin = chat.users[0] || null;
      }
      chat.users = chat.users.filter((user) => user.toString() !== userId);
    });
    await chat.save();
    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage");
    return res.status(200).json(updatedChat);
  } catch (err) {
    console.error("Error removing user from group chat:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.post("/addUsersToGroup", authMiddleware, async (req, res) => {
  try {
    const { selectedMembers, chatId } = req.body;
    if (selectedMembers.length === 0) {
      return res
        .status(400)
        .json({ message: "Atleast one member is required" });
    }
    if (typeof selectedMembers === "string") {
      selectedMembers = JSON.parse(selectedMembers);
    }
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ message: "Chat not found or not a group chat" });
    }
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can add users to group chat" });
    }
    selectedMembers.forEach((userId) => {
      if (chat.users.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User already exists in the group chat" });
      }
      chat.users.push(userId);
    });
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage");
    return res.status(200).json(updatedChat);
  } catch (err) {
    console.error("Error adding user to group chat:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.post("/leaveGroup", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ message: "Chat not found or not a group chat" });
    }
    if (!chat.users.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User not found in the group chat" });
    }
    chat.users = chat.users.filter(
      (user) => user.toString() !== userId.toString()
    );
    if (chat.admin.toString() === userId.toString()) {
      chat.admin = chat.users[0] || null;
    }
    await chat.save();
    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage");

    return res
      .status(200)
      .json({ message: "Successfully left the group chat" });
  } catch (err) {
    console.error("Error leaving group chat:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.post("/deleteGroupChat/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ message: "Chat not found or not a group chat" });
    }
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can delete group chat" });
    }
    await Message.deleteMany({ chat: chatId });
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.status(200).json({ message: "Group chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting group chat:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});
router.post(
  "/editGroupDetails",
  upload.single("file"),
  authMiddleware,
  async (req, res) => {
    const { chatId, chatName, groupDescription } = req.body;
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isGroupChat) {
        return res
          .status(404)
          .json({ message: "Chat not found or not a group chat" });
      }
      if (chat.admin.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Only admin can edit group chat details" });
      }
      if (req.file) {
        const localpath = req.file.path;
        const result = await cloudinary.uploader.upload(localpath, {
          resource_type: "auto",
          folder: "chat_app/group_profile_pics",
        });
        const fileUrl = result.secure_url;
        chat.chatImage = fileUrl;
        fs.unlinkSync(localpath);
      }
      chat.chatname = chatName;
      chat.groupDescription = groupDescription;

      await chat.save();
      const updatedChat = await Chat.findById(chatId)
        .populate("users", "-password")
        .populate("latestMessage");
      return res.status(200).json(updatedChat);
    } catch (err) {
      console.error("Error editing group chat details:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
);

export default router;
