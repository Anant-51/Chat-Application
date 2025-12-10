import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import useCentralStore from "../centralStore.jsx";
import MessageStatusIcon from "./MessageStatusIcon.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadOptionIcon from "../assets/download-option-icon.png";

const AudioMessage = ({ message, isOwnMessage, showUsernameHeader }) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [totalDuration, setTotalDuration] = useState("0:00");
  const [status, setStatus] = useState(
    message.isDownloaded.includes(useCentralStore.getState().user._id) ||
      message.sender._id === useCentralStore.getState().user._id
      ? "done"
      : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const user = useCentralStore((state) => state.user);
  const userId = user._id;

  const fileUrl = message.fileUrl;
  const fileName = message.originalFileName || "audio.mp3";
  const contentLength = message.mediaSize || 0;
  const chunks = useRef([]);
  const receivedLength = useRef(0);

  const isSentByMe = message.sender._id === userId;

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isOwnMessage ? "#93C5FD" : "#d1d5db",
      progressColor: isOwnMessage ? "#1E40AF" : "#4B5563",
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      responsive: true,
      height: 50,
      cursorWidth: 2,
      cursorColor: isOwnMessage ? "#1E40AF" : "#4B5563",
      interact: true,
    });

    wavesurferRef.current.load(fileUrl);

    wavesurferRef.current.on("ready", () => {
      const totalSec = wavesurferRef.current.getDuration();
      const mins = Math.floor(totalSec / 60);
      const secs = Math.floor(totalSec % 60)
        .toString()
        .padStart(2, "0");
      setTotalDuration(`${mins}:${secs}`);
      setIsAudioReady(true);
    });

    wavesurferRef.current.on("audioprocess", () => {
      const currentTime = wavesurferRef.current.getCurrentTime();
      const mins = Math.floor(currentTime / 60);
      const secs = Math.floor(currentTime % 60)
        .toString()
        .padStart(2, "0");
      setDuration(`${mins}:${secs}`);
    });

    wavesurferRef.current.on("finish", () => setIsPlaying(false));

    return () => wavesurferRef.current?.destroy();
  }, [fileUrl]);

  const togglePlayback = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
    setIsPlaying(!isPlaying);
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
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/markDownloaded`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ messageId: message._id, userId }),
        }
      );

      setStatus("done");
    } catch (err) {
      console.error("Download failed:", err);
      setStatus("idle");
    }
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
      <div className="relative min-w-[320px] max-w-[400px]">
        <div
          className={`relative flex flex-col gap-2  rounded-2xl ${
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

          {/* Main row: play/pause, waveform, download */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              {/* Play/Pause button */}
              <button
                onClick={togglePlayback}
                disabled={!isAudioReady}
                className={`rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all ${
                  isOwnMessage
                    ? "bg-blue-500 hover:bg-blue-400"
                    : "bg-slate-700/50 hover:bg-slate-400"
                } ${!isAudioReady ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isOwnMessage ? "white" : "#374151"}
                    className="w-5 h-5"
                  >
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isOwnMessage ? "white" : "#374151"}
                    className="w-5 h-5"
                  >
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                )}
              </button>

              {/* Waveform container */}
              <div className="flex-1 min-w-0">
                <div ref={containerRef} className="w-full h-[50px]" />
                {/* Duration display */}
                <div
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-blue-100" : "text-white"
                  }`}
                >
                  {duration} / {totalDuration}
                </div>
              </div>

              {/* Download / Progress */}
              {!isSentByMe && (
                <div className="flex-shrink-0">
                  {status === "idle" && (
                    <button
                      onClick={handleDownload}
                      className={`p-2 rounded transition-all ${
                        isOwnMessage
                          ? "bg-blue-500 hover:bg-blue-400"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <img
                        src={DownloadOptionIcon}
                        alt="Download"
                        className="w-5 h-5"
                      />
                    </button>
                  )}
                  {status === "downloading" && (
                    <div className="w-9 h-9">
                      <CircularProgress
                        variant="determinate"
                        value={progress}
                        size={18}
                        thickness={5}
                      />
                    </div>
                  )}
                  {status === "done" && (
                    <div className="text-xs text-center">
                      <span
                        className={
                          isOwnMessage ? "text-blue-200" : "text-gray-500"
                        }
                      >
                        {formatSize(contentLength)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom row: timestamp + status */}
            <div className="flex justify-end items-center gap-1 text-[10px] -mt-1">
              <span className={isOwnMessage ? "text-blue-100" : "text-white"}>
                {time}
              </span>
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

export default AudioMessage;
