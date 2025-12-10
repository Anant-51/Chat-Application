import React, { useState } from "react";
import useCentralStore from "../../centralStore.jsx";
import { GroupChatListCard } from "../GroupChatListCard.jsx";
import GroupChatDetailsForm from "./GroupChatDetailsForm.jsx";
import styles from "./GroupChatCreationPanel.module.css";
import { Virtuoso } from "react-virtuoso";
import { set } from "lodash";
const GroupChatCreationList = ({
  setIsGroupPanelOpen,
  groupChatCreationRef,
}) => {
  const [selectedChats, setSelectedChats] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const chatListData = useCentralStore((state) => state.chatListData);
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  let users = null;
  let reqUser = null;
  let reqUserId = null;
  console.log("chatListData from GroupChatCreationList", chatListData);

  const handleClick = (chat) => {
    users = chat.users;
    console.log("users from group", users);
    reqUser = users.filter((user) => user._id !== userId);
    console.log("reqUser from groupppppp", reqUser);
    reqUserId = reqUser[0]?._id;
    console.log("reqUserId from groupppppp", reqUserId);
    setSelectedUsers((prev) =>
      prev.includes(reqUserId)
        ? prev.filter((id) => id !== reqUserId)
        : [...prev, reqUserId]
    );
    setSelectedChats((prev) =>
      prev.includes(chat._id)
        ? prev.filter((id) => id !== chat._id)
        : [...prev, chat._id]
    );
  };

  const requiredChats = chatListData.filter(
    (chat) => chat.isGroupChat === false
  );
  console.log("requiredChats from GroupChatCreationList", requiredChats);
  return (
    <div className={styles.container} ref={groupChatCreationRef}>
      <GroupChatDetailsForm
        setIsGroupPanelOpen={setIsGroupPanelOpen}
        selectedUsers={selectedUsers}
      />

      <div className="flex-grow overflow-y-auto pr-1">
        {requiredChats.map((chat) => (
          <GroupChatListCard
            key={chat._id}
            chat={chat}
            onClick={() => handleClick(chat)}
            selectedChats={selectedChats}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupChatCreationList;
