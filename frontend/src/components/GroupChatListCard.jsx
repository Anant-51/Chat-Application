import React, { useState } from "react";
import checkMark from "../assets/check-mark.png";
import useCentralStore from "../centralStore.jsx";

export const GroupChatListCard = ({ onClick, selectedChats, chat }) => {
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  const chatId = chat._id;
  const users = chat.users;
  const showTickMark = selectedChats.includes(chatId);
  const requiredUser = users.filter((u) => {
    return u.userid !== userId;
  });
  const statusMessage = requiredUser.statusMessage;
  let chatImageToShow = null;
  let chatNameToShow = null;
  console.log("chat of groupChaatlist card", chat);
  const handleChatNameToShow = () => {
    const otherUser = chat.chatNameForPrivateChat.find(
      (u) => u.userId !== userId
    );
    console.log("otherUser", otherUser);
    chatNameToShow = otherUser ? otherUser.username : "Unknown";
    console.log("chatNameToShow", chatNameToShow);
  };
  const handleChatImageToShow = () => {
    const otherUser = chat.chatImageForPrivateChat.find(
      (u) => u.userId !== userId
    );
    chatImageToShow = otherUser ? otherUser.profile : "Unknown";
  };
  handleChatNameToShow();
  handleChatImageToShow();
  return (
    <div
      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
        <img src={chatImageToShow} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col leading-tight flex-grow">
        <div className="text-[15px] font-medium truncate">{chatNameToShow}</div>
        <div className="text-[12px] text-gray-500 truncate">
          ~{statusMessage}
        </div>
      </div>

      {showTickMark && (
        <div className="w-6 h-6">
          <img src={checkMark} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
