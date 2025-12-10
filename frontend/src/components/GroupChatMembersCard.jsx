import React from "react";
import useCentralStore from "../centralStore.jsx";
const GroupChatMembersCard = ({ member }) => {
  const chatProfile = member.profile;
  const chatName = member.username;
  const statusMessage = member.statusMessage;
  return (
    <div
      className="w-full h-[68px] 
             flex items-center px-3 gap-3 
             bg-white rounded-lg 
             cursor-pointer 
             transition-colors duration-150 "
    >
      <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-[#DADADA]">
        <img src={chatProfile} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col gap-[2px]">
        <div className="text-[14px] font-medium text-[#111B21]">{chatName}</div>

        <div className="text-[12px] text-[#667781] max-w-[210px] truncate">
          ~{statusMessage}
        </div>
      </div>
    </div>
  );
};
export default GroupChatMembersCard;
