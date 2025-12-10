import React, { useState, useEffect } from "react";
import useCentralStore from "../centralStore.jsx";

const GroupChatDetails = () => {
  const url = import.meta.env.VITE_BACKEND_URL;

  const activeChatId = useCentralStore((state) => state.activeChatId);
  const [chat, setChat] = useState({});

  useEffect(() => {
    if (!activeChatId) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${url}/api/chats/chatInfo?chatId=${activeChatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("data from group chat details", data);
        if (data.isChat) {
          setChat(data.chat);
        }
        if (!data.isChat) {
          setChat(data.user);
        }
      } catch (err) {
        console.error("Error fetching chat info:", err);
      }
    };
    fetchData();
  }, [activeChatId]);
  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Group Image */}
      <img
        src={chat.chatImage}
        alt={chat.chatName}
        className="w-28 h-28 rounded-full object-cover shadow-sm"
      />

      {/* Group Name */}
      <p className="mt-4 text-xl font-semibold text-center">{chat.chatName}</p>

      {/* Group Description */}
      <p className="mt-2 text-white text-sm">~{chat.groupDescription}</p>

      {/* Members Count */}
      <div className="mt-2 text-black-500 text-sm">
        {chat?.users?.length} members
      </div>
    </div>
  );
};

export default GroupChatDetails;
