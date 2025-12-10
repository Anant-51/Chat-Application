import React from "react";
import useCentralStore from "../centralStore.jsx";
import audioIcon from "../assets/audio-icon.png";
import imageIcon from "../assets/image-icon.png";
import pdfIcon from "../assets/pdf-icon.png";
import videoIcon from "../assets/video-icon.png";
import zipIcon from "../assets/zipfile-icon.png";
import docIcon from "../assets/document-icon.png";
import MessageStatusIcon from "./MessageStatusIcon";

const LatestMessageRenderer = ({ latestMessage, latestMessageSeenStatus }) => {
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  if (!latestMessage) return null;
  console.log("latestMessage from latestMessageRenderer", latestMessage);
  console.log("latestMessageSeenStatus", latestMessageSeenStatus);
  const imageTypes = ["jpg", "png", "jpeg", "webp"];
  const videoTypes = ["mp4", "ogv", "webm"];
  const docTypes = ["doc", "docx", "txt"];
  const audioTypes = ["mp3", "wav", "ogg"];
  const type = latestMessage?.messageType?.toLowerCase();
  const msg = latestMessage;
  console.log("latestMessage.content from latestMessageRenderer", msg?.content);
  console.log(
    "latestMessage.seenStatus from latestMessageRenderer",
    msg?.seenStatus
  );
  console.log("type", type);

  if (type === "text") {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}

        <span className="truncate max-w-[170px] block">{msg.content}</span>
      </div>
    );
  }
  if (imageTypes.includes(type)) {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={imageIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>image</div>
      </div>
    );
  }
  if (videoTypes.includes(type)) {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={videoIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>video</div>
      </div>
    );
  }
  if (docTypes.includes(type)) {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={docIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>doc</div>
      </div>
    );
  }
  if (audioTypes.includes(type)) {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={audioIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>audio</div>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={pdfIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>pdf</div>
      </div>
    );
  }
  if (type === "zip") {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}
        <img src={zipIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>zip</div>
      </div>
    );
  }
  if (type === "groupchatmodification") {
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        {msg.sender._id === userId ? (
          <MessageStatusIcon status={msg.seenStatus} />
        ) : null}

        <span className="truncate max-w-[170px] block">{msg.content}</span>
      </div>
    );
  }
};

export default LatestMessageRenderer;
