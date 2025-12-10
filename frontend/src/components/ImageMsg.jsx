import React, { useRef, useState, useEffect } from "react";
import useCentralStore from "../centralStore.jsx";
import MessageStatusIcon from "./MessageStatusIcon";
import getUrlForImageMessage from "../utility/getUrlForImageMessage.js";
import DownloadOptionIcon from "../assets/download-option-icon.png";
import CircularProgress from "@mui/material/CircularProgress";

const url = import.meta.env.VITE_BACKEND_URL;

const ImageMsg = ({ message, isOwnMessage, showUsernameHeader }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  const user = useCentralStore((state) => state.user);
  const userId = user._id;

  const { thumbnailUrl, thumbnailUrlOnDownloaded } = getUrlForImageMessage({
    cloudinaryUrl: message.fileUrl,
  });

  const contentLength = message.mediaSize;
  const chunks = useRef([]);
  const receivedLength = useRef(0);

  const isSentByMe = message.sender._id === userId;

  useEffect(() => {
    if (isSentByMe || message.isDownloaded.includes(userId)) {
      setDownloaded(true);
      setStatus("done");
    }
  }, []);

  const handleDownload = async () => {
    setStatus("downloading");
    console.log("image msg", message);

    try {
      const response = await fetch(message.fileUrl);
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.current.push(value);
        receivedLength.current += value.length;
        const percent = Math.round(
          (receivedLength.current / contentLength) * 100
        );
        setProgress(percent);
      }

      setStatus("done");

      await fetch(`${url}/api/messages/markDownloaded`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: message._id, userId }),
      });

      setDownloaded(true);

      const blob = new Blob(chunks.current, {
        type: response.headers.get("content-type"),
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = message.originalFileName || "image";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      setStatus("idle");
    }
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };
  console.log("image message", message);
  return (
    <div
      className={`flex items-start gap-2 px-4 relative ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      {/* Profile pic */}
      <div className="flex-shrink-0 mt-1">
        <img
          className="w-6 h-6 rounded-full object-cover"
          src={message.sender?.profile}
          alt="User"
        />
      </div>

      {/* Bubble */}
      <div className="relative max-w-[260px]">
        <div
          className={`relative rounded-lg overflow-hidden border-4 ${
            isOwnMessage ? "border-blue-500" : "border-gray-500"
          }`}
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          {showUsernameHeader && !isOwnMessage && (
            <div className="w-full bg-amber-50 px-2 py-1 rounded-t-lg mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {message.sender?.username}
              </span>
            </div>
          )}

          <div className="relative">
            <img
              src={message.fileUrl}
              className="w-full h-auto max-h-[320px] object-cover block"
              alt="img"
            />
          </div>

          <div
            className={`flex items-center justify-between px-2 py-1 text-white text-[10px] backdrop-blur-sm  ${
              isOwnMessage ? "bg-blue-500/50 " : "bg-slate-700/50 "
            }`}
          >
            {!isSentByMe && status !== "done" ? (
              <button
                onClick={handleDownload}
                disabled={status === "downloading"}
                className="flex items-center gap-1 bg-black/40 rounded px-2 py-[2px] hover:bg-black/50 transition"
              >
                {status === "downloading" ? (
                  <div className="w-4 h-4">
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={18}
                      thickness={5}
                    />
                  </div>
                ) : (
                  <img
                    src={DownloadOptionIcon}
                    className="w-4 h-4"
                    alt="Download"
                  />
                )}
                <span>{formatSize(contentLength)}</span>
              </button>
            ) : (
              <div className="w-16" />
            )}

            <div className="flex items-center gap-[3px]">
              <span>{time}</span>
              {isOwnMessage && (
                <MessageStatusIcon status={message.seenStatus} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMsg;
