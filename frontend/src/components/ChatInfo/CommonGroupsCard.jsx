import React from "react";
import styles from "./ChatInfo.module.css";

const CommonGroupsCard = ({ group }) => {
  return (
    <div
      className="w-full h-[50px] 
             flex items-center px-3 gap-3 
             bg-white rounded-lg 
             cursor-pointer 
             transition-colors duration-150 "
    >
      <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-[#DADADA]">
        <img src={group.chatImage} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col gap-[2px]">
        <div className="text-[14px] font-medium text-[#111B21]">
          {group.chatName}
        </div>

        <div className="text-[12px] text-[#667781] max-w-[210px] truncate">
          ~{group.description}
        </div>
      </div>
    </div>
  );
};

export default CommonGroupsCard;
