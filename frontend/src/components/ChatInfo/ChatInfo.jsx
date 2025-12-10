import React, { useEffect, useState } from "react";
import styles from "./ChatInfo.module.css";
import useCentralStore from "../../centralStore.jsx";
import CommonGroupsCard from "./CommonGroupsCard";
const url = import.meta.env.VITE_BACKEND_URL;

const ChatInfo = ({ chatInfoRef }) => {
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const [chatInformation, setChatInformation] = useState({});
  const [commonGroups, setCommonGroups] = useState([]);
  useEffect(() => {
    if (!activeChatId) return;
    const fetchChatInfoForPrivateChat = async () => {
      const res = await fetch(
        `${url}/api/chats/chatInfoForPrivateChat?chatId=${activeChatId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const chat = await res.json();
      setChatInformation(chat);
    };
    fetchChatInfoForPrivateChat();
  }, [activeChatId]);
  useEffect(() => {
    if (!activeChatId) return;
    const fetchCommonGroups = async () => {
      const res = await fetch(
        `${url}/api/chats/commonGroups?chatId=${activeChatId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setCommonGroups(data.commonGroups);
    };
    if (activeChatId) {
      fetchCommonGroups();
    }
  }, [activeChatId]);
  return (
    <div className={styles.container} ref={chatInfoRef}>
      <div className={styles.rightPanel}>
        <div className="flex flex-col items-center py-6 px-4">
          <img
            src={chatInformation?.profileImage}
            className="w-28 h-28 rounded-full object-cover shadow-sm"
          />

          <p className="mt-4 text-xl font-semibold text-center">
            {chatInformation?.username}
          </p>

          <p className="mt-2 text-white text-sm">
            ~ {chatInformation?.statusMessage}
          </p>
        </div>
        <div className="text-blue-500 mb-2 underline">Groups in common</div>
        <div
          className="w-full h-full 
               
                  pt-0 pb-2 pr-2
                  
                 text-[#e9edef]
                
    
                 space-y-1"
        >
          {commonGroups.map((group) => (
            <CommonGroupsCard key={group._id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
