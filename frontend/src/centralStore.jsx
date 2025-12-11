import { create } from "zustand";
const url = import.meta.env.VITE_BACKEND_URL;
const useCentralStore = create((set, get) => ({
  messages: {},
  allChats: [],
  activeChatId: null,
  isAuthenticated: false,
  user: JSON.parse(localStorage.getItem("user")) || null,
  socket: null,
  userSearchResponse: [],
  seenStatus: "sent",
  typingInformation: {},
  chatExists: null,
  chatListData: [],

  setChatListData: async () => {
    console.log("Entered setChatListData");
    const { socket } = get();
    try {
      const res = await fetch(`${url}/api/chats/allChats`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch chats:", res.status, res.statusText);
        set({ chatListData: [] });
        return;
      }

      const data = await res.json();
      data.formattedData.forEach((chat) => {
        socket.emit("join chat", chat._id);
      });
      console.log("chatlist data", data.formattedData);
      set({ chatListData: data.formattedData || [] });
    } catch (err) {
      console.error("Error fetching chats:", err);
      set({ chatListData: [] });
    }
  },
  updateChatListData: (chatId) => {
    console.log("chatId from updateChatListData", chatId);
    const { chatListData } = get();
    const updatedChatListData = chatListData.map((chat) => {
      console.log("chatId", chatId, "chat._id", chat._id);
      if (chat._id === chatId) {
        console.log("entered updateChatListData");
        return {
          ...chat,
          unreadMessagesCount: 0,
        };
      }
      return chat;
    });
    console.log("chatListData from updateChatListData", updatedChatListData);
    set({ chatListData: updatedChatListData });
  },
  setChatExists: (isChat) => {
    set({ chatExists: isChat });
  },

  /* appendMessage: (msg) => {
    console.log("appendMessage called with:", msg);
    const {
      messages,
      user,
      activeChatId,
      socket,
      chatListData,
      userSearchResponse,
    } = get();
    const chatId = msg.chat._id;
    const msgByChatId = messages[chatId] || [];
    if (msgByChatId.some((m) => m._id === msg._id)) return;

    // Append message to messages state
    set((state) => ({
      messages: { ...state.messages, [chatId]: [...msgByChatId, msg] },
    }));

    if (activeChatId === chatId) {
      if (msg.sender._id.toString() !== user._id.toString()) {
        console.log("Emitting 'read' event");

        socket.emit("read", {
          msgId: msg._id.toString(),
          userId: user._id.toString(),
          chatId: chatId.toString(),
        });

        console.log("socket from appendmessage", socket.id);
        console.log("socket read event emitted from appendMessage");
      }
    } else {
      if (msg.sender._id.toString() !== user._id.toString()) {
        console.log(" Emitting 'delievered' event");
        socket.emit("delievered", { msgId: msg._id, userId: user._id, chatId });
      }
    }
    // Update chatListData locally
    const updatedChatList = chatListData.map((chat) => {
      if (chat._id === chatId) {
        const isActive = activeChatId === chatId;
        return {
          ...chat,
          latestMessage: msg,
          updatedAt: new Date().toISOString(),
          unreadMessagesCount: isActive
            ? 0
            : (chat.unreadMessagesCount || 0) +
              (msg.sender._id !== user._id ? 1 : 0),
        };
      }
      return chat;
    });
    console.log("updatedChatList ", updatedChatList);

    // Sort by updatedAt descending
    updatedChatList.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    console.log("updatedChatList after sort", updatedChatList);

    set({ chatListData: updatedChatList });
    if (userSearchResponse.length > 0) {
      const updatedUserSearchResponse = userSearchResponse.map((chat) => {
        if (chat._id === chatId) {
          const isActive = activeChatId === chatId;
          return {
            ...chat,
            latestMessage: msg,
            updatedAt: new Date().toISOString(),
            unreadMessagesCount: isActive
              ? 0
              : (chat.unreadMessagesCount || 0) +
                (msg.sender._id !== user._id ? 1 : 0),
          };
        }
        return chat;
      });

      // Sort by updatedAt descending
      updatedUserSearchResponse.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      set({ userSearchResponse: updatedUserSearchResponse });
    }

    
  },
 */

  setUnreadCounts: (c, chatId) => {
    set((state) => ({
      unreadMessages: { ...state.unreadMessages, [chatId]: c },
    }));
  },
  appendMessage: (msg) => {
    console.log("========================================");
    console.log("📩 appendMessage called with:", msg);
    console.log("========================================");

    const {
      messages,
      user,
      activeChatId,
      socket,
      chatListData,
      userSearchResponse,
    } = get();

    const chatId = msg.chat._id;
    const msgByChatId = messages[chatId] || [];

    console.log("📊 Current State:");
    console.log("  - chatId:", chatId);
    console.log("  - activeChatId:", activeChatId);
    console.log("  - chatListData length:", chatListData.length);
    console.log("  - userSearchResponse length:", userSearchResponse.length);
    console.log("  - msg.chat structure:", msg.chat);

    // Check if message already exists
    const isDuplicate = msgByChatId.some((m) => m._id === msg._id);

    if (isDuplicate) {
      console.log("⚠️  Duplicate message detected");
    } else {
      // Append message to messages state only if not duplicate
      set((state) => ({
        messages: { ...state.messages, [chatId]: [...msgByChatId, msg] },
      }));
      console.log("✅ Message added to messages state");
    }

    // Handle socket events for read/delivered
    const isActive = activeChatId === chatId;
    if (isActive) {
      if (msg.sender._id.toString() !== user._id.toString()) {
        console.log("📤 Emitting 'read' event");
        socket.emit("read", {
          msgId: msg._id.toString(),
          userId: user._id.toString(),
          chatId: chatId.toString(),
        });
      }
    } else {
      if (msg.sender._id.toString() !== user._id.toString()) {
        console.log("📤 Emitting 'delivered' event");
        socket.emit("delivered", {
          msgId: msg._id,
          userId: user._id,
          chatId,
        });
      }
    }

    // ========================================
    // UPDATE OR ADD TO chatListData
    // ========================================
    console.log("\n🔍 Processing chatListData...");
    const existingChatIndex = chatListData.findIndex(
      (chat) => chat._id === chatId
    );
    console.log("  - existingChatIndex:", existingChatIndex);

    let updatedChatList;

    if (existingChatIndex !== -1) {
      // Chat exists - update it
      console.log("✏️  Updating existing chat in chatListData");
      updatedChatList = chatListData.map((chat) => {
        if (chat._id === chatId) {
          const updated = {
            ...chat,
            latestMessage: msg,
            updatedAt: new Date().toISOString(),
            unreadMessagesCount: isActive
              ? 0
              : (chat.unreadMessagesCount || 0) +
                (msg.sender._id !== user._id ? 1 : 0),
          };
          console.log("  - Updated chat:", updated);
          return updated;
        }
        return chat;
      });
    } else {
      // Chat doesn't exist - create new entry from msg.chat (fully populated by backend)
      console.log("🆕 Creating NEW chat entry in chatListData");
      const newChatEntry = {
        _id: chatId,
        chatName: msg.chat.chatName || null,
        chatNameForPrivateChat: msg.chat.chatNameForPrivateChat || null,
        isGroupChat: msg.chat.isGroupChat || false,
        users: msg.chat.users || [],
        chatImage: msg.chat.chatImage || null,
        chatImageForPrivateChat: msg.chat.chatImageForPrivateChat || null,
        latestMessage: msg,
        updatedAt: new Date().toISOString(),
        unreceivedMessages: [],
        unreadMessagesCount: isActive || msg.sender._id === user._id ? 0 : 1,
        chatCreated: true,
      };
      console.log("  - New chat entry:", newChatEntry);
      updatedChatList = [newChatEntry, ...chatListData];
      console.log("  - Total chats after adding:", updatedChatList.length);
    }

    // Sort by updatedAt descending
    updatedChatList.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    console.log("📋 Sorted chatListData:");
    console.log("  - Total chats:", updatedChatList.length);
    console.log(
      "  - First 3 chats:",
      updatedChatList.slice(0, 3).map((c) => ({
        _id: c._id,
        latestMessage: c.latestMessage?.content?.substring(0, 20),
        updatedAt: c.updatedAt,
      }))
    );

    set({ chatListData: updatedChatList });
    console.log("✅ chatListData updated in store");

    // ========================================
    // UPDATE OR ADD TO userSearchResponse
    // ========================================
    if (userSearchResponse.length > 0) {
      console.log("\n🔍 Processing userSearchResponse...");
      const existingSearchIndex = userSearchResponse.findIndex(
        (item) => item._id === chatId
      );
      console.log("  - existingSearchIndex:", existingSearchIndex);

      let updatedUserSearchResponse;

      if (existingSearchIndex !== -1) {
        // Chat exists in search results
        console.log("✏️  Updating existing chat in userSearchResponse");
        updatedUserSearchResponse = userSearchResponse.map((chat) => {
          if (chat._id === chatId) {
            const updated = {
              ...chat,
              latestMessage: msg,
              updatedAt: new Date().toISOString(),
              unreadMessagesCount: isActive
                ? 0
                : (chat.unreadMessagesCount || 0) +
                  (msg.sender._id !== user._id ? 1 : 0),
            };
            console.log("  - Updated search chat:", updated);
            return updated;
          }
          return chat;
        });
      } else {
        // Chat doesn't exist in search results
        console.log("🆕 Creating NEW chat entry in userSearchResponse");
        const newChatEntry = {
          _id: chatId,
          chatName: msg.chat.chatName || null,
          chatNameForPrivateChat: msg.chat.chatNameForPrivateChat || null,
          isGroupChat: msg.chat.isGroupChat || false,
          users: msg.chat.users || [],
          chatImage: msg.chat.chatImage || null,
          chatImageForPrivateChat: msg.chat.chatImageForPrivateChat || null,
          latestMessage: msg,
          updatedAt: new Date().toISOString(),
          unreceivedMessages: [],
          unreadMessagesCount: isActive || msg.sender._id === user._id ? 0 : 1,
          chatCreated: true,
        };
        console.log("  - New search chat entry:", newChatEntry);
        updatedUserSearchResponse = [newChatEntry, ...userSearchResponse];
      }

      // Sort by updatedAt descending
      updatedUserSearchResponse.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      console.log("📋 Sorted userSearchResponse:");
      console.log("  - Total items:", updatedUserSearchResponse.length);

      set({ userSearchResponse: updatedUserSearchResponse });
      console.log("✅ userSearchResponse updated in store");
    } else {
      console.log("\n⏭️  Skipping userSearchResponse (empty)");
    }

    console.log("========================================");
    console.log("✅ appendMessage completed successfully");
    console.log("========================================\n");
  },

  prependMessage: (chatId, msgs) => {
    if (!chatId || !Array.isArray(msgs)) {
      console.warn("Invalid parameters for setInitialMessages");
      return;
    }
    const { messages } = get();

    const msgByChatId = messages[chatId] || [];
    set((state) => ({
      messages: { ...state.messages, [chatId]: [...msgs, ...msgByChatId] },
    }));
  },

  setInitialMessages: (chatId, msgs) => {
    const existingMsgs = get().messages[chatId] || [];
    const allMsgs = [...existingMsgs, ...msgs];

    // Deduplicate by _id
    const uniqueMsgs = Array.from(
      new Map(allMsgs.map((m) => [m._id, m])).values()
    );

    set((state) => ({
      messages: { ...state.messages, [chatId]: uniqueMsgs },
    }));
  },
  updateBasedOnCurrentChat: async (chatId) => {
    console.log("chaID with updateBasedOnCurrentChat", chatId);
    const { socket, user } = get();
    console.log("chatId", chatId);
    console.log("user", user);

    set((state) => ({
      activeChatId: chatId,
    }));
    const params = new URLSearchParams({
      chatId: chatId,
    });
    const res = await fetch(
      `${url}/api/messages/allMessages?${params.toString()}`,
      {
        credentials: "include",
      }
    );
    const msgByChatId = await res.json();

    console.log("msgByChatId", msgByChatId);

    if (msgByChatId.length === 0) {
      return;
    }

    msgByChatId.forEach((msg) => {
      if (!msg.readBy?.includes(user._id) && msg.sender._id !== user._id) {
        socket.emit("read", {
          msgId: msg._id,
          userId: user._id,
          chatId: chatId,
        });
      }
    });
  },
  setActiveChatId: (chatId) => {
    console.log("setActiveChatId chatId", chatId);
    set((state) => ({
      activeChatId: chatId,
    }));
  },
  setSocket: (s) => {
    set((state) => ({
      socket: s,
    }));
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },

  updateMessageTick: ({ msgId, chatId, status }) => {
    console.log("updateMessageTick entered central", msgId, chatId, status);
    const { messages } = get();
    const msgByChatId = messages[chatId] || [];
    const updatedMessage = msgByChatId.map((msg) => {
      if (status === "seen") {
        msg.seenStatus = status;
      }
      if (status === "delievered") {
        if (msg.seenStatus !== "seen") {
          msg.seenStatus = status;
        }
      }
      return msg;
    });
    set((state) => ({
      messages: { ...state.messages, [chatId]: updatedMessage },
    }));
  },

  setTypingInformationAdd: (obj) => {
    console.log("setTypingInformationAdd", obj);
    set((state) => {
      const current = state.typingInformation[obj.activeChatId] ?? [];
      if (current.some((u) => u.userId === obj.userId)) return state;
      const updated = [
        ...current,
        { userId: obj.userId, username: obj.username },
      ];
      return {
        typingInformation: {
          ...state.typingInformation,
          [obj.activeChatId]: updated,
        },
      };
    });
  },

  setTypingInformationDelete: (obj) => {
    console.log("setTypingInformationDelete", obj);
    set((state) => {
      const current = state.typingInformation[obj.activeChatId] ?? [];
      const updated = current.filter((u) => u.userId !== obj.userId);
      if (updated.length === current.length) return state;
      return {
        typingInformation: {
          ...state.typingInformation,
          [obj.activeChatId]: updated,
        },
      };
    });
  },

  setUserSearchResponse: (response) => {
    console.log("setUserSearchResponse", response);
    const { userSearchResponse } = get();
    set((state) => ({ userSearchResponse: [...response] }));
    console.log("userSearchResponse", userSearchResponse);
  },
  handleUnreadMessagesWhileOffline: (messages) => {
    const { chatListData, user, socket } = get();
    chatListData.forEach((chat) => {
      const { unrecievedMessages } = chat;
      if (unrecievedMessages.length > 0) {
        unrecievedMessages.forEach((msg) => {
          if (msg.sender._id.toString() !== user._id.toString()) {
            socket.emit("delievered", {
              msgId: msg._id,
              userId: user._id,
              chatId: chat._id,
            });
          }
        });
      }
    });
  },
}));

export default useCentralStore;
