import React, { useEffect, useState } from "react";
import GroupChatDetails from "./GroupChatDetails.jsx";
import GroupChatMembersCard from "./GroupChatMembersCard.jsx";
import MorevertIcon from "./MorevertIcon.jsx";
import Footer from "./Footer";
import useCentralStore from "../centralStore.jsx";
import { useNavigate } from "react-router-dom";

const GroupChatMembersList = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const user = useCentralStore((state) => state.user);
  const activeChatId = useCentralStore((state) => state.activeChatId);

  const [chat, setChat] = useState(null);
  const userId = user._id;

  const handleArrowClick = () => {
    navigate("/main");
  };

  useEffect(() => {
    async function fetchChatMembers() {
      try {
        const response = await fetch(
          `${url}/api/chats/membersOfChat?chatId=${activeChatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setChat(data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    }

    if (activeChatId) {
      fetchChatMembers();
    }
  }, [activeChatId, url]);

  if (!chat) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }
  console.log("chat from groupChatMembersList", chat);

  const members = chat.users || [];
  const adminId = chat.admin;

  return (
    <div>
      <GroupChatDetails />
      <div
        className="w-full h-full 
             overflow-y-auto 
              pt-0 pb-2 pr-2
              
             text-[#e9edef]
            

             space-y-1"
      >
        {members.map((member) => (
          <GroupChatMembersCard key={member._id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default GroupChatMembersList;
