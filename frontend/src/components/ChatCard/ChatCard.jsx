import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCentralStore from "../../centralStore.jsx";
import LatestMessageRenderer from "../LatestMessageRenderer.jsx";
import TypingIndicatorChatCard from "../TypingIndicatorChatCard.jsx";
import styles from "./ChatCard.module.css";
const EMPTY_ARRAY = [];
const ChatCard = ({ chat }) => {
  console.log("entered chat card");
  console.log("chat", chat);
  console.log("chat.latestMessage", chat.latestMessage);
  console.log("chat.latestMessage?.content", chat.latestMessage?.content);

  console.log(
    "chat.unreadMessagesCount from chat card",
    chat.unreadMessagesCount
  );
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const user = useCentralStore((state) => state.user);
  console.log("user", user);
  const userId = user._id;
  console.log("userId", userId);
  const typingUsersBychatId =
    useCentralStore((state) => state.typingInformation?.[chat._id]) ?? [];
  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);
  const updateBasedOnCurrentChat = useCentralStore(
    (state) => state.updateBasedOnCurrentChat
  );
  const updateChatListData = useCentralStore(
    (state) => state.updateChatListData
  );
  const latestMessageFromStore = useCentralStore((state) => {
    const arr = state.messages[chat._id] || EMPTY_ARRAY;
    if (arr.length > 0) {
      return arr[arr.length - 1];
    }
    return null;
  });

  const latestMessageSeenStatusFromStore = useCentralStore((state) => {
    const arr = state.messages[chat._id] || EMPTY_ARRAY;
    if (arr.length > 0) {
      return arr[arr.length - 1].seenStatus;
    }
    return null;
  });
  const latestMessage = latestMessageFromStore || chat.latestMessage;
  const latestMessageSeenStatus =
    latestMessageSeenStatusFromStore || chat.latestMessage;

  useEffect(() => {
    const update = async () => {
      await updateBasedOnCurrentChat(chat.chatId);
    };
  }, []);

  const typingUsers = typingUsersBychatId.filter((u) => u.userId !== userId);

  const handleClick = async () => {
    if (chat.chatCreated) {
      console.log("chat._id", chat._id);
      setActiveChatId(chat._id);
      updateBasedOnCurrentChat(chat._id);
      updateChatListData(chat._id);

      console.log("activeChatId", chat._id);
    } else {
      setActiveChatId(chat._id);
    }
  };

  let chatImageToShow = null;
  let chatNameToShow = null;
  const handleChatNameToShow = () => {
    if (chat.chatCreated) {
      if (chat.isGroupChat) {
        chatNameToShow = chat.chatName;
      } else {
        const otherUser = chat.chatNameForPrivateChat.find(
          (u) => u.userId !== userId
        );
        console.log("otherUser", otherUser);
        chatNameToShow = otherUser ? otherUser.username : "Unknown";
        console.log("chatNameToShow", chatNameToShow);
      }
    } else {
      chatNameToShow = chat.username;
    }
  };
  const handleChatImageToShow = () => {
    if (chat.chatCreated) {
      if (chat.isGroupChat) {
        chatImageToShow = chat.chatImage;
      } else {
        const otherUser = chat.chatImageForPrivateChat.find(
          (u) => u.userId !== userId
        );
        chatImageToShow = otherUser ? otherUser.profile : "Unknown";
      }
    } else {
      chatImageToShow = chat.profile;
    }
  };
  handleChatNameToShow();
  handleChatImageToShow();
  return (
    <div onClick={handleClick}>
      <div className={styles.chatCard}>
        <div className={styles.chatAvatar}>
          <img src={chatImageToShow} alt="Profile" />
        </div>

        <div className={styles.chatInfo}>
          <div className={styles.chatHeader}>
            <span className={styles.chatName}>{chatNameToShow}</span>
            <span className={styles.chatTime}>
              {chat.chatCreated
                ? new Date(chat.latestMessage?.createdAt).toLocaleDateString()
                : ""}
            </span>
          </div>
          {chat.chatCreated ? (
            <div className={styles.chatFooter}>
              <span>
                {typingUsers.length > 0 ? (
                  <div>
                    {console.log("typing user chat card ")}
                    {console.log(
                      "typingUsers.length from typing user chat card",
                      typingUsers.length
                    )}
                    <TypingIndicatorChatCard
                      chatId={chat._id}
                      isGroupChat={chat.isGroupChat}
                    />
                  </div>
                ) : (
                  <div>
                    {console.log("latest message chat card ")}
                    {console.log(
                      "typingUsers.length from latest message chat card",
                      typingUsers.length
                    )}
                    <LatestMessageRenderer
                      latestMessage={latestMessage}
                      latestMessageSeenStatus={latestMessageSeenStatus}
                    />
                  </div>
                )}
              </span>
              <span
                className={
                  chat.unreadMessagesCount > 0
                    ? styles.chatUnread
                    : styles.noUnread
                }
              >
                {console.log(
                  "unreadMessagesCount from span tag",
                  chat.unreadMessagesCount
                )}
                {chat.unreadMessagesCount}
              </span>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
