import React, { useRef, useEffect, useState } from "react";
import Footer from "./Footer";
import ErrorDiv from "./ErrorDiv.jsx";
import { ManageGroupMemebersCard } from "./ManageGroupMemebersCard";
import useCentralStore from "../centralStore.jsx";
import ButtonComp from "./ButtonComp";
import arrowIcon from "../assets/arrow-icon.png";
import { Virtuoso } from "react-virtuoso";
import { useNavigate } from "react-router-dom";

const url = import.meta.env.VITE_BACKEND_URL;
const RemoveMembersFromGroup = ({ setIsOpen }) => {
  const socket = useCentralStore((state) => state.socket);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const user = useCentralStore((state) => state.user);
  const userId = useCentralStore((state) => state.user._id);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const navigate = useNavigate();
  const appendMessage = useCentralStore((state) => state.appendMessage);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await fetch(
        `${url}/api/chats/membersOfChat?chatId=${activeChatId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setChat(data);
    };
    if (activeChatId) {
      fetchMembers();
    }
  }, [activeChatId]);
  const m = chat?.users || [];
  console.log("chat users from remove members", chat?.users);
  console.log("userId from remove members", userId);
  const members = m.filter((user) => user._id !== userId);
  console.log("m from remove members", m);
  console.log("members from remove members", members);

  console.log("setIsOpen from remove members", setIsOpen);
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
    const response = await fetch(`${url}/api/chats/removeMembersFromGroup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedMembers,
        chatId: activeChatId,
      }),
    });
    console.log("response of remove members from group", response);
    const data = await response.json();
    setResult(data);

    if (!response.ok) {
      setVisible(true);
    }
    if (response.ok) {
      console.log("entered response.ok");
      setLoading(false);
      setIsOpen(false);

      socket.emit("removed members from group", {
        chatId: activeChatId,
        members: selectedMembers,
      });

      const filteredUsers = members.filter((user) =>
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
      const messageToSend = `${adminKey} removed ${m} from group`;

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
      const data = await res.json();
      setResult(data);
      appendMessage(data);
      if (res.ok) {
        socket.emit("send message", {
          senderId: userId,
          message: messageToSend,
          chatId: activeChatId,
        });

        navigate("/main");
      }
      if (!res.ok) {
        setVisible(true);
      }
      navigate("/main");
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
          Remove members from group
        </div>

        <div className="w-6"></div>
      </div>
      <div className="fixed bottom-4 right-4" onClick={handleButtonClick}>
        <ButtonComp text="Done" />
      </div>

      <div className="flex-grow overflow-y-auto px-2 pb-24">
        {members.map((member) => {
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

export default RemoveMembersFromGroup;
