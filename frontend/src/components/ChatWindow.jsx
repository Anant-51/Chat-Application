import React, { useState, useEffect, useRef, useCallback } from "react";
import useCentralStore from "../centralStore.jsx";
import MessageRenderer from "./MessageRenderer.jsx";
import { Virtuoso } from "react-virtuoso";
import DateSeparator from "./DateSeparator.jsx";
import MessageInputComp from "./MessageInputComp/MessageInputComp.jsx";
import GroupChatOverlayPanel from "./GroupChatOverlayPanel/GroupChatPanel.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatPageHeader from "./ChatPageHeader.jsx";
import getDateLabel from "../utility/getDateLabel.jsx";
import ChatInfo from "./ChatInfo/ChatInfo.jsx";
import UserInformation from "./UserInformation/UserInformation.jsx";

const EMPTY_ARRAY = [];

const ChatWindow = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const user = useCentralStore((state) => state.user);
  const userId = user?._id ?? null;
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const panelRef = useRef(null);
  const chatInfoRef = useRef(null);
  const userInformationRef = useRef(null);

  const messages = useCentralStore(
    (state) => state.messages[activeChatId] || EMPTY_ARRAY
  );
  console.log("messages from chat window", messages);
  const prependMessage = useCentralStore((state) => state.prependMessage);
  const setInitialMessages = useCentralStore(
    (state) => state.setInitialMessages
  );

  const typingUsersBychatId = useCentralStore(
    (state) => state.typingInformation[activeChatId] || EMPTY_ARRAY
  );

  const socket = useCentralStore((state) => state.socket);
  const chatExists = useCentralStore((state) => state.chatExists);

  const cursor = useRef(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [online, setOnline] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const virtuosoRef = useRef(null);
  const headerRef = useRef(null);

  const loadedChatRef = useRef(null);

  console.log("activeChatId of chat window", activeChatId);
  useEffect(() => {
    if (socket && activeChatId) {
      socket.emit("join chat", activeChatId);
      console.log("Joined chat:", activeChatId);
    }
  }, [socket, activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    fetch(`${url}/api/chats/chatInfo?chatId=${activeChatId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data?.chat?.users);
        setIsGroupChat(data?.chat?.isGroupChat);
        setIsChat(data?.isChat);

        console.log("chat info", isGroupChat);
      })
      .catch((err) => console.error("Error fetching chat info:", err));
  }, [activeChatId, url]);
  useEffect(() => {
    if (!users) {
      return;
    }
    const fetchUserInfo = async () => {
      if (isGroupChat) return;
      const reqUser = users.filter((user) => user._id !== userId);
      const reqUserId = reqUser[0]?._id;
      console.log("users from chat window", users);
      console.log("reqUserId from chat window", reqUserId);
      try {
        const res = await fetch(
          `${url}/api/user/userProfile?userId=${reqUserId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("user information from chat window", data);
        if (!isGroupChat) {
          setOnline(data?.user?.isOnline);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserInfo();
  }, [users, url, userId]);
  console.log("online status", online);

  const typingUsers = typingUsersBychatId.filter((u) => u.userId !== userId);

  const loadOlderMessages = useCallback(async () => {
    if (!loading && hasMore && virtuosoRef.current && activeChatId) {
      const params = new URLSearchParams({
        cursor: cursor.current || null,
        chatId: activeChatId,
      });

      try {
        setLoading(true);
        const response = await fetch(
          `${url}/api/messages/getMessages?${params.toString()}`,
          { credentials: "include" }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setLoading(false);
        setHasMore(data.hasMore);

        const newCount = data.messages?.length || 0;

        if (newCount > 0) {
          virtuosoRef.current.adjustForPrependedItems(newCount);

          prependMessage(activeChatId, data.messages);
        }

        cursor.current = data.cursor;
      } catch (err) {
        console.error("Error loading older messages:", err);
        setLoading(false);
      }
    }
  }, [activeChatId, loading, hasMore, prependMessage, url]);

  const settingOnline = useCallback(
    (userData) => {
      if (
        isGroupChat === false &&
        users.some((u) => u._id === userData._id && userData._id !== userId)
      ) {
        setOnline(true);
      }
    },
    [userId, users, isGroupChat]
  );
  const settingOffline = useCallback(
    (userData) => {
      if (
        isGroupChat === false &&
        users.some((u) => u._id === userData._id && userData._id !== userId)
      ) {
        setOnline(false);
      }
    },
    [userId, users, isGroupChat]
  );
  // Socket listener
  useEffect(() => {
    if (!socket) return;
    socket.on("user online", settingOnline);
    return () => {
      socket.off("user online", settingOnline);
    };
  }, [socket, settingOnline]);
  useEffect(() => {
    if (!socket) return;
    socket.on("user offline", settingOffline);
    return () => {
      socket.off("user offline", settingOffline);
    };
  });

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    if (loadedChatRef.current === activeChatId) {
      return;
    }

    loadedChatRef.current = activeChatId;
    cursor.current = null;
    setHasMore(true);
    setLoading(false);

    const loadMessages = async () => {
      const params = new URLSearchParams({
        cursor: null,
        chatId: activeChatId,
      });

      try {
        setLoading(true);
        const response = await fetch(
          `${url}/api/messages/getMessages?${params.toString()}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("chat window data", data);

        if (loadedChatRef.current === activeChatId) {
          setLoading(false);
          setHasMore(data.hasMore);
          setInitialMessages(activeChatId, data.messages || []);
          cursor.current = data.cursor;
        }
      } catch (err) {
        console.error("Error fetching initial messages:", err);
        if (loadedChatRef.current === activeChatId) {
          setLoading(false);
        }
      }
    };

    loadMessages();
  }, [activeChatId, url, setInitialMessages]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {isOpen &&
        (!isChat ? (
          <UserInformation userInformationRef={userInformationRef} />
        ) : isGroupChat ? (
          <GroupChatOverlayPanel setIsOpen={setIsOpen} panelRef={panelRef} />
        ) : (
          <ChatInfo chatInfoRef={chatInfoRef} />
        ))}

      <ChatPageHeader
        onlineStatus={online}
        userInformationRef={userInformationRef}
        chatInfoRef={chatInfoRef}
        panelRef={panelRef}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div className="flex-grow min-h-0 mt-[56px] mb-[120px]">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          followOutput="smooth"
          startReached={loadOlderMessages}
          increaseViewportBy={{ top: 300, bottom: 300 }}
          components={{
            Header: () => <div style={{ height: 23 }} />,
            Footer: () => (
              <div style={{ height: 123 }} className="flex items-end px-3 pb-2">
                {/* Spacer at top, typing indicator at the bottom of footer */}
                {typingUsers.length > 0 && (
                  <TypingIndicator isGroupChat={isGroupChat} />
                )}
              </div>
            ),
          }}
          itemContent={(index, message) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;

            const showDateSeparator =
              !prevMessage ||
              new Date(prevMessage.createdAt).toDateString() !==
                new Date(message.createdAt).toDateString();

            const isSystemMessage =
              message.messageType === "groupChatModification";

            const isOwnMessage =
              message?.sender?._id?.toString?.() === userId?.toString?.();

            return (
              <div>
                {showDateSeparator && (
                  <DateSeparator label={getDateLabel(message.createdAt)} />
                )}

                <div
                  style={{
                    marginBottom:
                      prevMessage &&
                      message.sender?._id === prevMessage.sender?._id
                        ? "10px"
                        : "0px",
                    marginTop: "10px",
                  }}
                  className={`flex px-2 ${
                    isSystemMessage
                      ? "justify-center"
                      : isOwnMessage
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <MessageRenderer message={message} />
                </div>
              </div>
            );
          }}
          className="h-full"
        />
      </div>

      <div>
        <MessageInputComp />
      </div>
    </div>
  );
};

export default ChatWindow;
