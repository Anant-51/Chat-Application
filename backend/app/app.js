import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import userRouter from "../routes/users.routes.js";
import messageRouter from "../routes/messages.routes.js";
import chatRouter from "../routes/chats.routes.js";
import { fileURLToPath } from "url";
import path from "path";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import http from "http";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);

io.use(async (socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    return next(new Error("cookie not found"));
  }
  const parsed = cookie.parse(cookieHeader);

  const token = parsed.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    const userData = await User.findByIdAndUpdate(
      socket.userId,
      { isOnline: true },
      { new: true }
    );
    socket.userData = userData;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});
io.on("connection", (socket) => {
  console.log("socket id from connection event backendd", socket.id);
  socket.onAny((eventName, ...args) => {
    console.log("socket event name", eventName, args);
  });

  socket.join(socket.userId.toString());
  console.log("joined room of userId", socket.userId);
  console.log("socket.userId", socket.userId);
  io.emit("user online", socket.userData);

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("User joined room:", roomId);
  });
  socket.on("send message", (newMessage) => {
    const chatId = newMessage.chatId;

    console.log("socket id from send message backend", socket.id);
    console.log("io from send message backend", io);
    socket.to(chatId).emit("new message", newMessage);
    console.log("emitted new message ", "to", chatId);
  });
  socket.on("send group info", (newMessage) => {
    const chatId = newMessage.chatId;

    socket.to(chatId).emit("new message", newMessage);
    socket.emit("new message", newMessage);
  });

  socket.on("read", async (data) => {
    console.log("entered read in backend");
    console.log("socket from read event backend", socket.id);
    console.log("userId", data.userId);
    console.log("msgId", data.msgId);
    console.log("chatId", data.chatId);

    try {
      const chat = await Chat.findById(data.chatId);

      if (!chat) {
        socket.emit("error", "chat not found");
        return;
      }

      const users = chat.users;
      console.log("users", users);

      const message = await Message.findById(data.msgId);

      if (!message) {
        socket.emit("socket-error", "message not found");
        return;
      }

      const senderId =
        message.sender._id?.toString() ?? message.sender.toString();

      if (!message.readBy.includes(data.userId)) {
        message.readBy.push(data.userId);
      }

      const readByUsers = message.readBy;

      if (message.seenStatus === "seen") {
        await message.save();
        return;
      }

      if (readByUsers.length === users.length - 1) {
        await Message.updateMany(
          {
            chat: data.chatId,
            seenStatus: { $ne: "seen" },
          },
          {
            $set: { seenStatus: "seen" },
          }
        );

        const updateData = {
          chatId: data.chatId,
          msgId: data.msgId,
          status: "seen",
        };

        console.log("📤 Emitting updateSeen to sender room:", senderId);
        console.log(
          "📤 Sockets in sender room:",
          io.sockets.adapter.rooms.get(senderId)?.size || 0
        );

        io.to(senderId).emit("updateSeen", updateData);

        console.log("✅ updateSeen event emitted to sender");
      }

      await chat.save();
      await message.save();

      console.log("✅ Read event processed successfully");
    } catch (err) {
      console.error("❌ Error in read handler:", err);
    }
  });
  socket.on("delievered", async (data) => {
    const { userId, msgId, chatId } = data;
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        socket.emit("socket-error", "chat not found");
        return;
      }
      const message = await Message.findById(msgId);

      if (!message) {
        socket.emit("socket-error", "message not found");
        return;
      }

      const senderId =
        message.sender._id?.toString() ?? message.sender.toString();
      const recieveingUsersLength = chat.users.length - 1;

      if (!message.recievedBy.includes(data.userId)) {
        message.recievedBy.push(data.userId);
      }

      if (
        message.seenStatus === "delievered" ||
        message.seenStatus === "seen"
      ) {
        return;
      }
      if (message.recievedBy.length === recieveingUsersLength) {
        await Message.updateOne(
          {
            chat: data.chatId,
            _id: data.msgId,
            seenStatus: { $nin: ["seen", "delievered"] },
          },
          {
            $set: { seenStatus: "delievered" },
          }
        );

        const updateData = {
          chatId: data.chatId,
          msgId: data.msgId,
          status: "delievered",
        };

        io.to(senderId).emit("updateSeen", updateData);
      }
      await chat.save();
      await message.save();
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("typing alert", (typingInfo) => {
    console.log("typingInfo", typingInfo);
    socket.in(typingInfo.activeChatId).emit("typing", typingInfo);
  });
  socket.on("stop typing alert", (typingInfo) => {
    socket.in(typingInfo.activeChatId).emit("stop typing", typingInfo);
  });

  socket.on("added members to group", (data) => {
    console.log("Event added members to group ", data);
    for (const member of data.members) {
      io.to(member).emit("added to group", data);
    }
  });
  socket.on("group chat created", (data) => {
    console.log("Event group chat created ", data);
    for (const member of data.members) {
      io.to(member).emit("group chat created", data);
    }
  });
  socket.on("removed members from group", (data) => {
    console.log("Event removed members from group ", data);
    for (const member of data.members) {
      io.to(member).emit("removed from group", data);
    }
  });
  socket.on("disconnect", async () => {
    const stillConnected = Array.from(io.sockets.sockets.values()).some(
      (s) => s.userId === socket.userId && s.id !== socket.id
    );
    if (!stillConnected) {
      socket.userData = await User.findByIdAndUpdate(
        socket.userId,
        { isOnline: false },
        { new: true }
      );

      console.log("User is offline");

      io.emit("user offline", socket.userData);
    }
    console.log("User disconnected");
  });
});
export { io };
export default server;
