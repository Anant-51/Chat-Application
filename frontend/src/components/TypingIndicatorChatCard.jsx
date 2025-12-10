import React from "react";
import useCentralStore from "../centralStore.jsx";
const EMPTY_ARRAY = [];

const TypingIndicatorChatCard = ({ chatId, isGroupChat }) => {
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  const typingInformationByChatId =
    useCentralStore((state) => state.typingInformation[chatId]) || EMPTY_ARRAY;
  const t = typingInformationByChatId.filter((u) => u.userId !== userId);

  if (t.length == 0) {
    return null;
  }
  if (!isGroupChat) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit overflow-hidden text-ellipsis whitespace-nowrap">
        typing...
      </div>
    );
  }
  if (t.length == 1) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit overflow-hidden text-ellipsis whitespace-nowrap">
        {t[0].username} is typing...
      </div>
    );
  }
  if (t.length == 2) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit overflow-hidden text-ellipsis whitespace-nowrap">
        {t[0].username} and {t[1].username} are typing...
      </div>
    );
  }
  if (t.length > 2) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit overflow-hidden text-ellipsis whitespace-nowrap">
        several people are typing...
      </div>
    );
  }
  return <div></div>;
};

export default TypingIndicatorChatCard;
