import { useEffect, useCallback, act } from "react";
import useCentralStore from "../centralStore.jsx";

function Footer() {
  const setChatListData = useCentralStore((state) => state.setChatListData);

  const appendMessage = useCentralStore((state) => state.appendMessage);
  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);
  const updateMessageTick = useCentralStore((state) => state.updateMessageTick);
  const setTypingInformationAdd = useCentralStore(
    (state) => state.setTypingInformationAdd
  );
  const setTypingInformationDelete = useCentralStore(
    (state) => state.setTypingInformationDelete
  );

  const socket = useCentralStore((state) => state.socket);

  console.log("socket in footer", socket);
  console.log(
    "activeChatId in footer",
    useCentralStore.getState().activeChatId
  );

  const handleNewMessage = useCallback(
    (newMessage) => {
      console.log(
        "activeChatId in footer handleNewMessage",
        useCentralStore.getState().activeChatId
      );
      console.log("footer new message", newMessage);
      try {
        appendMessage(newMessage.message);
        console.log("appended footer message", newMessage.message);
      } catch (err) {
        console.log(err);
      }
    },
    [appendMessage, setChatListData]
  );

  const handleMessageTickUpdation = useCallback(
    (response) => {
      console.log("🔵 message tick updation received:", response);
      updateMessageTick(response);
    },
    [updateMessageTick]
  );

  const settingTypingInformationAdd = useCallback(
    (typingInformation) => {
      setTypingInformationAdd(typingInformation);
    },
    [setTypingInformationAdd]
  );

  const settingTypingInformationDelete = useCallback(
    (typingInformation) => {
      setTypingInformationDelete(typingInformation);
    },
    [setTypingInformationDelete]
  );
  const handleRemovedFromGroup = useCallback(
    async (removedFromGroupData) => {
      console.log("removed from group", removedFromGroupData);
      try {
        console.log(
          "activeChatId from handleRemovedFromGroup",
          useCentralStore.getState().activeChatId
        );
        console.log("removedFromGroupData.chatId", removedFromGroupData.chatId);
        if (
          removedFromGroupData.chatId ===
          useCentralStore.getState().activeChatId
        ) {
          setActiveChatId(null);
          console.log(
            "activeChatId set to null",
            useCentralStore.getState().activeChatId
          );
        }
        await setChatListData();
      } catch (err) {
        console.log(err);
      }
    },
    [setChatListData]
  );

  const handleNewChat = useCallback(
    async (newChat) => {
      try {
        await setChatListData();
      } catch (err) {
        console.log(err);
      }
    },
    [setChatListData]
  );
  const handleGroupChatCreated = useCallback(
    async (groupChatCreated) => {
      try {
        console.log("group chat created in footer", groupChatCreated);
        await setChatListData();
      } catch (err) {
        console.log(err);
      }
    },
    [setChatListData]
  );

  const handleAddedToGroup = useCallback(
    async (addedToGroup) => {
      console.log("added to group footer", addedToGroup);
      try {
        await setChatListData();
      } catch (err) {
        console.log(err);
      }
    },
    [setChatListData]
  );

  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket not available in Footer");
      return;
    }

    console.log("🎧 Registering socket listeners in Footer");

    socket.on("new message", handleNewMessage);
    socket.on("updateSeen", handleMessageTickUpdation);
    socket.on("typing", settingTypingInformationAdd);
    socket.on("new chat", handleNewChat);
    socket.on("group chat created", handleGroupChatCreated);
    socket.on("added to group", handleAddedToGroup);
    socket.on("removed from group", handleRemovedFromGroup);
    socket.on("stop typing", settingTypingInformationDelete);

    return () => {
      console.log("🎧 Removing socket listeners from Footer");
      socket.off("new message", handleNewMessage);
      socket.off("updateSeen", handleMessageTickUpdation);
      socket.off("typing alert", settingTypingInformationAdd);
      socket.off("stop typing alert", settingTypingInformationDelete);
      socket.off("new chat", handleNewChat);
    };
  }, [
    socket,
    handleNewMessage,
    handleMessageTickUpdation,
    settingTypingInformationAdd,
    settingTypingInformationDelete,
    handleNewChat,
  ]);

  return (
    <div
      style={{
        height: "50px",
        backgroundColor: "white",
        borderTop: "2px solid blue",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        width: "100%",
        bottom: 0,
      }}
    ></div>
  );
}

export default Footer;
