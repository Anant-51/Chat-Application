import React, { useEffect, useState, useRef } from "react";
import arrowIcon from "../assets/arrow-icon.png";
import useCentralStore from "../centralStore.jsx";
import { set } from "lodash";
const EMPTY_ARRAY = [];
const url = import.meta.env.VITE_BACKEND_URL;

const ChatPageHeader = ({
  onlineStatus,
  panelRef,
  isOpen,
  setIsOpen,
  chatInfoRef,
  userInformationRef,
}) => {
  const [chat, setChat] = useState(null);
  const [isChat, setIsChat] = useState(false);
  const activeChatId = useCentralStore((state) => state.activeChatId) || null;
  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);
  const chatExists = useCentralStore((state) => state.chatExists);
  const headerRef = useRef(null);

  console.log("online status from header", onlineStatus);
  console.log("activeChatIdFromChatcard", activeChatId);

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
        console.log("data from chatInfo", data);
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

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideHeader =
        headerRef.current && !headerRef.current.contains(event.target);

      const clickedOutsideAllPanels =
        (!panelRef.current || !panelRef.current.contains(event.target)) &&
        (!userInformationRef.current ||
          !userInformationRef.current.contains(event.target)) &&
        (!chatInfoRef.current || !chatInfoRef.current.contains(event.target));

      if (clickedOutsideHeader && clickedOutsideAllPanels) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  console.log("chat from chatInfo", chat);
  if (!activeChatId || !chat) return null;

  let chatImageToShow = null;
  let chatNameToShow = null;
  const handleArrowClick = () => {
    setActiveChatId(null);
  };
  const handleChatNameToShow = () => {
    const isActualChat =
      chat.chatNameForPrivateChat && Array.isArray(chat.chatNameForPrivateChat);
    if (chatExists && isActualChat) {
      console.log("chatExists from handleChatName", chatExists);
      if (chat.isGroupChat) {
        chatNameToShow = chat.chatName;
      } else {
        if (chat.chatNameForPrivateChat[0].userId !== userId) {
          chatNameToShow = chat.chatNameForPrivateChat[0].username;
        } else {
          chatNameToShow = chat.chatNameForPrivateChat[1].username;
        }
      }
    } else {
      chatNameToShow = chat.username;
    }
  };
  const handleChatImageToShow = () => {
    const isActualChat =
      chat.chatImageForPrivateChat &&
      Array.isArray(chat.chatImageForPrivateChat);
    if (chatExists && isActualChat) {
      if (chat.isGroupChat) {
        chatImageToShow = chat.chatImage;
      } else {
        if (chat.chatImageForPrivateChat[0].userId !== userId) {
          chatImageToShow = chat.chatImageForPrivateChat[0].profile;
        } else {
          chatImageToShow = chat.chatImageForPrivateChat[1].profile;
        }
      }
    } else {
      chatImageToShow = chat.profile;
    }
  };
  handleChatNameToShow();
  handleChatImageToShow();
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <header
      onClick={handleClick}
      className="flex w-full items-center gap-4 pl-6 pr-7 py-3 bg-gradient-to-r from-[#0A3D62] to-[#1A5276] text-white h-[56px] border-b border-[#2a3942] fixed top-0 z-30"
      ref={headerRef}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleArrowClick();
        }}
        className="p-2.5 hover:bg-[#26343b] ml-2 rounded-full transition duration-200 flex items-center justify-center ml-2"
      >
        <img src={arrowIcon} alt="Back" className="w-3.5 h-3.5 opacity-80" />
      </button>

      <div className="w-[50px] h-[50px] rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
        <img
          src={chatImageToShow || "/default-avatar.png"}
          alt="chat"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center leading-tight space-y-[3px]">
        <span className="font-semibold text-[16px] truncate max-w-[240px] text-[#E9EDEF] tracking-wide">
          {chatNameToShow}
        </span>
        <span className={`text-[14px] text-gray-900 mt-1`}>
          {onlineStatus ? "Online" : "Offline"}
        </span>
      </div>
    </header>
  );
};

export default ChatPageHeader;
