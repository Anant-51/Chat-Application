import React from "react";
import useCentralStore from "../centralStore.jsx";
const EMPTY_ARRAY = [];

const TypingIndicator = ({ isGroupChat }) => {
  const user = useCentralStore((state) => state.user);
  const userId = user?._id;
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const typingInformationByChatId = useCentralStore(
    (state) => state.typingInformation?.[activeChatId] || EMPTY_ARRAY
  );

  console.log("TypingIndicator render:", {
    activeChatId,
    userId,
    typingInformationByChatId,
  });

  if (!userId || !activeChatId) {
    console.log("TypingIndicator: Missing userId or activeChatId");
    return null;
  }

  const t = typingInformationByChatId.filter((u) => u.userId !== userId);

  console.log("Filtered typing users:", t);

  if (t.length === 0) {
    console.log("TypingIndicator: No typing users, returning null");
    return null;
  }

  console.log("TypingIndicator: RENDERING INDICATOR FOR:", t[0].username);
  if (!isGroupChat) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit">
        typing...
      </div>
    );
  }

  if (t.length === 1) {
    return (
      <div
        className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit"
        style={{
          minWidth: "150px",
          minHeight: "30px",
        }}
      >
        {t[0].username} is typing...
      </div>
    );
  }

  if (t.length === 2) {
    return (
      <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit">
        {t[0].username} and {t[1].username} are typing...
      </div>
    );
  }

  return (
    <div className="px-3 py-1 rounded-2xl text-gray-700 bg-gray-100 text-sm max-w-xs w-fit">
      several people are typing...
    </div>
  );
};

export default TypingIndicator;
