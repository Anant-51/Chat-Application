import React, { useRef, useState, useEffect } from "react";
import { ManageGroupMemebersCard } from "./ManageGroupMemebersCard";
import ButtonComp from "./ButtonComp";
import useCentralStore from "../centralStore.jsx";
import ErrorDiv from "./ErrorDiv.jsx";
import arrowIcon from "../assets/arrow-icon.png";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { set } from "lodash";
const url = import.meta.env.VITE_BACKEND_URL;
const AddMembersToGroup = ({ setIsOpen }) => {
  const socket = useCentralStore((state) => state.socket);
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const user = useCentralStore((state) => state.user);
  const userId = useCentralStore((state) => state.user._id);
  const allChats = useCentralStore((state) => state.chatListData);
  const potentialUsers = useRef([]);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const appendMessage = useCentralStore((state) => state.appendMessage);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({});

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch(
        `${url}/api/chats/membersOfChat?chatId=${activeChatId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      setChat(data);
    };
    if (activeChatId) {
      fetchMembers();
    }
  }, [activeChatId]);

  const existingMembers = chat?.users || [];

  console.log("setIsOpen from AddMembersToGroup", setIsOpen);
  const directUsers = allChats
    .filter((chat) => !chat.isGroupChat)
    .flatMap((chat) => chat.users.filter((u) => u._id !== userId));

  // Make unique list
  const uniqueUsers = Array.from(
    new Map(directUsers.map((u) => [u._id, u])).values()
  );

  const reqUsers = uniqueUsers.filter(
    (u) => !existingMembers.some((m) => m._id === u._id)
  );

  const handleClick = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };
  const handleButtonClick = async () => {
    if (selectedMembers.length === 0) return;
    setLoading(true);
    const response = await fetch(`${url}/api/chats/addUsersToGroup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedMembers,
        chatId: activeChatId,
      }),
    });
    const data = await response.json();
    setResult(data);
    if (!response.ok) {
      setVisible(true);
    }
    if (response.ok) {
      setLoading(false);
      setIsOpen(false);

      socket.emit("added members to group", {
        chatId: activeChatId,
        members: selectedMembers,
      });
      console.log("entered response.ok");
      const filteredUsers = reqUsers.filter((user) =>
        selectedMembers.includes(user._id)
      );
      const filteredUsersName = filteredUsers.map((user) => user.email);
      function emailToUserKey(email) {
        if (!email || !email.includes("@")) return null;

        const [prefix, domain] = email.split("@");

        const domainName = domain.split(".")[0];

        const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const cleanDomain = domainName
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();

        return `${cleanPrefix}_${cleanDomain}`;
      }
      function convertEmails(emailArray) {
        return emailArray.map((email) => emailToUserKey(email));
      }

      const usersKey = convertEmails(filteredUsersName);

      const m = usersKey.join(",");

      const adminKey = emailToUserKey(user.email);
      const messageToSend = `${adminKey} added ${m} to group`;

      const res = await fetch(
        `${url}/api/messages/postMessages?chatId=${activeChatId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            chatId: chat._id,
            text: messageToSend,
            messageType: "groupChatModification",
          }),
        }
      );

      const newResult = await res.json();
      setResult(newResult);
      appendMessage(newResult);
      if (res.ok) {
        socket.emit("send message", {
          senderId: userId,
          message: newResult,
          chatId: activeChatId,
        });

        navigate("/main");
      }
      if (!res.ok) {
        setVisible(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {visible && (
        <ErrorDiv
          message={result.message}
          visible={visible}
          setVisible={setVisible}
        />
      )}

      <div className="flex items-center bg-blue-100 p-2 mb-2 justify-between">
        <div className="text-xl font-bold text-gray-500">
          Add members to group
        </div>

        <div className="w-6"></div>
      </div>

      <div className="fixed bottom-4 right-4">
        <div onClick={handleButtonClick}>
          <ButtonComp
            disabled={loading || selectedMembers.length === 0}
            text="Done"
          >
            {loading ? "Adding..." : "Done"}
          </ButtonComp>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-grow overflow-y-auto px-2 pb-24">
        {reqUsers.map((member) => {
          const memberId = member._id;
          return (
            <ManageGroupMemebersCard
              key={memberId}
              member={member}
              onClick={() => handleClick(memberId)}
              selectedMembers={selectedMembers}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AddMembersToGroup;
