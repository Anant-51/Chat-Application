import mongoose from "mongoose";
const chatschema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatImage: {
      type: String,
      default: `http://localhost:${process.env.PORT}/static/groupImage.png`,
    },
    chatImageForPrivateChat: {
      type: Array,
    },
    chatName: {
      type: String,
    },
    chatNameForPrivateChat: {
      type: Array,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chatname: {
      type: String,
    },
    groupprofile: {
      type: String,
    },
    groupChatAction: {
      type: String,
    },
    groupDescription: {
      type: String,
      default: " ",
    },
    groupMembers: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);
const Chat = mongoose.model("Chat", chatschema);
export default Chat;
