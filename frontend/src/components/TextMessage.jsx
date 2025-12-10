import React from "react";
import MessageStatusIcon from "./MessageStatusIcon.jsx";

const TextMessage = ({ message, isOwnMessage, showUsernameHeader }) => {
  console.log("showUsernameHeader of img msg", showUsernameHeader);
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log("showUsername", showUsernameHeader);
  console.log("text message", message);
  console.log("isOwnMessage", isOwnMessage);
  return (
    <div
      className={`flex items-start gap-2 relative mx-3 ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      <img
        className="w-6 h-6 rounded-full object-cover mt-1"
        src={message.sender?.profile || "/default-avatar.png"}
        alt={message.sender?.username || "User"}
      />

      <div
        className={`relative flex flex-col max-w-[320px] min-w-[120px] rounded-lg 
        ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-slate-700/50 text-white"
        }`}
      >
        {/* Username (only for others, group chat style) */}
        {showUsernameHeader && !isOwnMessage && (
          <div className="w-full bg-amber-50 px-2 py-1 rounded-t-lg mb-1">
            <span className="text-xs font-semibold text-gray-700">
              {message.sender?.username}
            </span>
          </div>
        )}

        <div className="px-3  py-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          <div
            className={`absolute bottom-1 right-2 flex items-center gap-[2px] ${
              isOwnMessage ? "text-blue-100" : "text-white"
            }`}
          >
            <span className="text-[10px]">{time}</span>
            {isOwnMessage && <MessageStatusIcon status={message.seenStatus} />}
          </div>

          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default TextMessage;
