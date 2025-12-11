import React, { useState, useEffect, useRef } from "react";
import CombinedHeader from "../components/CombinedHeader.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatList from "../components/ChatList.jsx";
import Footer from "../components/Footer.jsx";
import GroupChatCreationList from "../components/GroupChatCreationPanel/GroupChatCreationList.jsx";
import UserProfile from "../components/UserProfile/UserProfile.jsx";
import useCentralStore from "../centralStore.jsx";
const url = import.meta.env.VITE_BACKEND_URL;
const ChatPage = () => {
  const [isGroupPanelOpen, setIsGroupPanelOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const chatExists = useCentralStore((state) => state.chatExists);
  const setChatExists = useCentralStore((state) => state.setChatExists);
  const profileRef = useRef(null);
  const groupChatCreationRef = useRef(null);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }
    fetch(`${url}/api/chats/isChat?chatId=${activeChatId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setChatExists(data.isChat);
        console.log("data.isChat", data.isChat);
      });
  }, [activeChatId]);

  return (
    <div>
      {isProfileOpen && (
        <UserProfile
          profileRef={profileRef}
          setIsProfileOpen={setIsProfileOpen}
        />
      )}
      {isGroupPanelOpen && (
        <GroupChatCreationList
          setIsGroupPanelOpen={setIsGroupPanelOpen}
          groupChatCreationRef={groupChatCreationRef}
        />
      )}
      <div className="flex flex-col h-screen ">
        <CombinedHeader
          setIsProfileOpen={setIsProfileOpen}
          setIsGroupPanelOpen={setIsGroupPanelOpen}
          groupChatCreationRef={groupChatCreationRef}
          profileRef={profileRef}
        />
        <div className="flex grow min-h-0">
          <div className="w-[32%] border-r border-gray-300 flex flex-col min-h-0">
            <ChatList />
          </div>
          <div className="grow">
            <ChatWindow setIsGroupPanelOpen={setIsGroupPanelOpen} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ChatPage;
