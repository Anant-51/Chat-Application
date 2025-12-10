import React, { useState } from "react";
import checkMark from "../assets/check-mark.png";
import useCentralStore from "../centralStore.jsx";

export const ManageGroupMemebersCard = ({
  onClick,
  selectedMembers,
  member,
}) => {
  const memberId = member._id;
  const memberName = member.username;
  const memberImage = member.profile;
  const showTickMark = selectedMembers.includes(memberId);
  const statusMessage = member.statusMessage;
  return (
    <div
      className="flex items-center px-4 py-2 hover:bg-gray-300 hover:text-gray-900 active:bg-blue-500 cursor-pointer"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
        <img src={memberImage} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="text-[15px] font-medium leading-tight ">
          {memberName}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {statusMessage ? `~${statusMessage}` : ""}
        </div>
      </div>

      {showTickMark && (
        <div className="w-6 h-6">
          <img src={checkMark} className="w-full h-full object-contain" />
        </div>
      )}
    </div>
  );
};
