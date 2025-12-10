import React, { useState, useEffect } from "react";
import styles from "./LeaveGroup.module.css";
import useCentralStore from "../../centralStore.jsx";
import ErrorDiv from "../ErrorDiv.jsx";
import { useNavigate } from "react-router-dom";
import { set } from "react-hook-form";
const LeaveGroup = ({ setIsOpen }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const appendMessage = useCentralStore((state) => state.appendMessage);
  const user = useCentralStore((state) => state.user);
  const setChatListData = useCentralStore((state) => state.setChatListData);

  const [visible, setVisible] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const navigate = useNavigate();

  const userEmail = user.email;

  const userId = user._id;

  const handleYesButtonClick = async () => {
    const response = await fetch(`${url}/api/chats/leaveGroup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: activeChatId, userId: userId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setVisible(true);
    }
    if (response.ok) {
      setActiveChatId(null);
      setIsOpen(false);
      setChatListData();

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
      function convertEmails(userEmail) {
        return emailToUserKey(userEmail);
      }

      const userKey = convertEmails(userEmail);

      const messageToSend = `${userKey} left the group.`;

      const res = await fetch(
        `${url}/api/messages/postMessages?chatId=${activeChatId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            chatId: activeChatId,
            text: messageToSend,
            messageType: "groupChatModification",
          }),
        }
      );

      const newResult = await res.json();

      appendMessage(newResult);
    }
  };
  const handleNoButtonClick = () => {
    setIsOpen(false);
  };

  return (
    isActive && (
      <div className={styles.container}>
        {visible && (
          <ErrorDiv
            message="Something went wrong"
            visible={visible}
            setVisible={setVisible}
          />
        )}

        <div className={styles.modalBox}>
          <div className={styles.message}>
            Are you sure you want to leave the group?
          </div>

          <div className={styles.buttonRow}>
            <div className={styles.yesButton} onClick={handleYesButtonClick}>
              Yes
            </div>
            <div className={styles.noButton} onClick={handleNoButtonClick}>
              No
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default LeaveGroup;
