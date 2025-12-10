import React from "react";
import audioIcon from "../assets/audio-icon.png";
import imageIcon from "../assets/image-icon.png";
import pdfIcon from "../assets/pdf-icon.png";
import videoIcon from "../assets/video-icon.png";
import zipIcon from "../assets/zipfile-icon.png";
import docIcon from "../assets/document-icon.png";
const LatestMessageOnChatCard = (message) => {
  const messageType = message.latestMessageType;
  if (messageType === "text") return <div>{message}</div>;
  if (messageType === "image")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={imageIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>image</div>
      </div>
    );
  if (messageType === "video")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={videoIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>video</div>
      </div>
    );
  if (messageType === "audio")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={audioIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>audio</div>
      </div>
    );
  if (messageType === "pdf")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={pdfIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>pdf</div>
      </div>
    );
  if (messageType === "zip")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={zipIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>zip</div>
      </div>
    );
  if (messageType === "doc")
    return (
      <div className="flex items-center gap-1.5 text-gary-500">
        <img src={docIcon} className=" shrink-0 w-4 h-4" alt="" />
        <div>doc</div>
      </div>
    );
};

export default LatestMessageOnChatCard;
