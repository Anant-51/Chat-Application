import { useState, useEffect } from "react";
import TextMessage from "./TextMessage.jsx";
import ImageMessage from "./ImageMsg.jsx";
import DocumentMessage from "./DocumentMessage.jsx";
import ZipMessage from "./ZipMessage.jsx";
import AudioMessage from "./AudioMessage.jsx";
import VideoMsg from "./VideoMsg.jsx";
import PdfMessage from "./PdfMessage.jsx";
import useCentralStore from "../centralStore.jsx";
import useLatestMessageTypeSetter from "../utility/useLatestMessageTypeSetter.jsx";
import GroupChatActionDiv from "./GroupChatActionDiv.jsx";

const MessageRenderer = ({ message }) => {
  console.log("message from MessageRenderer", message);
  const user = useCentralStore((state) => state.user);
  const userId = user._id;
  console.log("sender", message.sender._id);
  console.log("userId", userId);
  const fileUploadErrors = useCentralStore((state) => state.fileUploadErrors);
  const isOwnMessage = message.sender._id === userId;
  console.log("isOwnMessage", isOwnMessage);
  const seenStatus = message.seenStatus;
  const showUsernameHeader =
    message.chat.isGroupChat && message.sender._id !== userId;

  const props = { message, isOwnMessage, showUsernameHeader };
  console.log("showUsernameHeader of MessageRenderer", showUsernameHeader);
  const imageTypes = ["jpg", "png", "jpeg", "webp"];
  const videoTypes = ["mp4", "ogv", "webm"];
  const docTypes = ["doc", "docx", "txt"];
  const audioTypes = ["mp3", "wav", "ogg"];

  const type = message.messageType?.toLowerCase();
  if (type === "text") {
    return <TextMessage {...props} />;
  }
  if (imageTypes.includes(type)) {
    return <ImageMessage {...props} />;
  }
  if (videoTypes.includes(type)) {
    return <VideoMsg {...props} />;
  }
  if (type === "pdf") {
    return <PdfMessage {...props} />;
  }
  if (docTypes.includes(type)) {
    return <DocumentMessage {...props} />;
  }
  if (type === "zip") {
    return <ZipMessage {...props} />;
  }
  if (audioTypes.includes(type)) {
    return <AudioMessage {...props} />;
  }
  if (type === "groupchatmodification") {
    return <GroupChatActionDiv message={message.content} />;
  }
  return null;
};

export default MessageRenderer;
