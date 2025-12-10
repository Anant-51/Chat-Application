import React, { useState, useEffect, useRef } from "react";
import styles from "./GroupChatOverlayPanel.module.css";
import useCentralStore from "../../centralStore.jsx";
import LeftPanelOptionsCard from "./LeftPanelOptionsCard.jsx";
import GroupChatMembersList from "../GroupChatMemebersList.jsx";
import EditGroupDetails from "../EditGroupDetails.jsx";
import RemoveMembersFromGroup from "../RemoveMembersFromGroup.jsx";
import AddMembersToGroup from "../AddMembersToGroup.jsx";
import LeaveGroup from "../LeaveGroup/LeaveGroup.jsx";
const GroupChatOverlayPanel = ({ setIsOpen, panelRef }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const [selectedOption, setSelectedOption] = useState("Overview");
  const [chatInformation, setChatInformation] = useState({});

  const leftPanelOptions = useRef(null);

  useEffect(() => {
    async function fetchChatInfo() {
      try {
        const response = await fetch(
          `${url}/api/chats/chatInfo?chatId=${activeChatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setChatInformation(data.chat);
        console.log("chatInformation from GroupChatPanel", chatInformation);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    }

    if (activeChatId) {
      fetchChatInfo();
    }
  }, [activeChatId, url]);

  const adminId = chatInformation.admin;
  console.log("userId from GroupChatPanel", userId);
  console.log("adminId from GroupChatPanel", adminId);
  if (userId === adminId) {
    leftPanelOptions.current = [
      "Overview",
      "Leave group",
      "Edit group details",
      "Add members",
      "Remove members",
    ];
  }
  if (userId !== adminId) {
    leftPanelOptions.current = ["Overview", "Leave group"];
  }
  const handleClick = (option) => {
    setSelectedOption(option);
  };
  return (
    <div ref={panelRef} className={styles.container}>
      <div className={styles.leftPanel}>
        {leftPanelOptions.current.map((option, index) => {
          return (
            <LeftPanelOptionsCard
              option={option}
              key={index}
              onClick={() => handleClick(option)}
              isOptionActive={selectedOption === option}
            />
          );
        })}
      </div>
      <div className={styles.rightPanel}>
        {selectedOption === "Overview" && <GroupChatMembersList />}
        {selectedOption === "Leave group" && (
          <LeaveGroup setIsOpen={setIsOpen} />
        )}
        {selectedOption === "Edit group details" && (
          <EditGroupDetails setIsOpen={setIsOpen} />
        )}
        {selectedOption === "Add members" && (
          <AddMembersToGroup setIsOpen={setIsOpen} />
        )}
        {selectedOption === "Remove members" && (
          <RemoveMembersFromGroup setIsOpen={setIsOpen} />
        )}
      </div>
    </div>
  );
};

export default GroupChatOverlayPanel;
