import { useState, useRef } from "react";
import pdfIcon from "../assets/pdf-icon.png";
import MessageStatusIcon from "./MessageStatusIcon.jsx";
import useCentralStore from "../centralStore.jsx";
import PdfMessageRenderer from "./PdfMessageRenderer.jsx";
import CircularProgress from "@mui/material/CircularProgress";

const url = import.meta.env.VITE_BACKEND_URL;

export default function PdfMessage({
  message,
  isOwnMessage,
  showUsernameHeader,
}) {
  const [status, setStatus] = useState(
    message.isDownloaded.includes(useCentralStore.getState().user._id) ||
      message.sender._id === useCentralStore.getState().user._id
      ? "done"
      : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const contentLength = message.mediaSize;
  const chunks = useRef([]);
  const receivedLength = useRef(0);

  const user = useCentralStore((state) => state.user);
  const userId = user._id;

  const fileUrl = message.fileUrl;
  const fileName = message.fileName;

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const handleDownload = async () => {
    setStatus("downloading");
    try {
      const response = await fetch(fileUrl);
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.current.push(value);
        receivedLength.current += value.length;
        setProgress(Math.round((receivedLength.current / contentLength) * 100));
      }

      const blob = new Blob(chunks.current, {
        type: response.headers.get("content-type"),
      });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "file.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Mark downloaded on server
      await fetch(`${url}/api/messages/markDownloaded`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: message._id, userId }),
      });

      setStatus("done");
    } catch (err) {
      console.error("Download failed:", err);
      setStatus("idle");
    }
  };

  const handleOpenPdf = () => {
    setShowPdfViewer(true);
  };

  const handleClosePdf = () => {
    setShowPdfViewer(false);
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      {showPdfViewer && (
        <PdfMessageRenderer pdfUrl={fileUrl} onClick={handleClosePdf} />
      )}

      <div
        className={`flex items-start gap-2 px-4 relative ${
          isOwnMessage ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex-shrink-0 mt-1">
          <img
            className="w-6 h-6 rounded-full object-cover"
            src={message.sender.profile}
            alt={message.sender.username}
          />
        </div>

        <div className="relative max-w-[320px]">
          <div
            onClick={handleOpenPdf}
            className={`relative flex flex-col  rounded-2xl cursor-pointer transition-colors ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-white"
            }`}
          >
            {showUsernameHeader && !isOwnMessage && (
              <div className="w-full bg-amber-50 px-2 py-1 rounded-t-lg mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {message.sender?.username}
                </span>
              </div>
            )}
            <div className="p-4">
              <div
                className={`flex items-start rounded-xl p-2 ${
                  showUsernameHeader && !isOwnMessage ? "mt-4" : ""
                }  ${
                  isOwnMessage
                    ? "bg-blue-500 text-white"
                    : "bg-slate-500/50 text-white"
                }`}
              >
                <img
                  src={pdfIcon}
                  alt="PDF Preview"
                  className="w-10 h-12 object-contain me-3"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white pb-1 truncate">
                    {message.originalFileName}
                  </span>
                  <span className="flex flex-wrap text-xs font-normal text-white gap-1">
                    {message.pageCount && <>{message.pageCount} pages</>}
                    {message.pageCount && <span>•</span>}
                    {formatSize(message.mediaSize)} • PDF
                  </span>
                </div>

                {status !== "done" && (
                  <div className="inline-flex self-center items-center flex-shrink-0 ml-2">
                    {status === "idle" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload();
                        }}
                        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-500 dark:hover:bg-gray-400 transition"
                      >
                        <svg
                          className="w-4 h-4 text-gray-900 dark:text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                          <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                        </svg>
                      </button>
                    )}
                    {status === "downloading" && (
                      <div className="w-8 h-8">
                        <CircularProgress
                          variant="determinate"
                          value={progress}
                          size={18}
                          thickness={5}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-1 text-[10px] text-gray-500 dark:text-gray-300 mt-2">
                <span>{time}</span>
                {isOwnMessage && (
                  <MessageStatusIcon status={message.seenStatus} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
