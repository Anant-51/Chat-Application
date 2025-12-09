import { type } from "os";
import mongoose from "mongoose";
import User from "./user.model.js";
import Chat from "./chat.model.js";

const messageschema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
    mediaSize: {
      type: Number,
    },
    pageCount: {
      type: Number,
    },
    messageType: {
      type: String,
      required: true,
      default: "text",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    recievedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    publicId: {
      type: String,
    },
    seenStatus: {
      type: String,
      default: "sent",
    },

    isDownloaded: {
      type: Array,
      default: [],
    },
    originalFileName: {
      type: String,
      default: "",
    },
    latestMessageType: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messageschema);
export default Message;
