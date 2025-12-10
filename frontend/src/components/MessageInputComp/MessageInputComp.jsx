import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import styles from "./MessageInputComp.module.css";
import fileInputIcon from "../../assets/attachment-icon.png";
import sendIcon from "../../assets/send-button-icon.png";
import { useForm } from "react-hook-form";
import useCentralStore from "../../centralStore.jsx";
import { debounce } from "lodash";
const url = import.meta.env.VITE_BACKEND_URL;

const MessageInputComp = () => {
  const appendMessage = useCentralStore((state) => state.appendMessage);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const userId = useCentralStore((state) => state.user._id);
  const username = useCentralStore((state) => state.user.username);
  const setChatListData = useCentralStore((state) => state.setChatListData);
  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);
  const socket = useCentralStore((state) => state.socket);
  const chatExists = useCentralStore((state) => state.chatExists);

  console.log("Socket", socket);

  const [visible, setVisible] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  const handleClick = () => {
    console.log("fileRef", fileRef.current);
    fileRef.current.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    setValue("file", file);
  };

  async function onSubmit(data) {
    console.log("entered send");
    console.log(data.file[0]);
    const formData = new FormData();
    formData.append("text", data.text);
    if (data.file && data.file.length > 0) {
      formData.append("file", data.file[0]);
    }

    try {
      let currentChatId = activeChatId;
      if (!chatExists) {
        console.log("chat exists", chatExists);
        const res = await fetch(`${url}/api/chats/createPrivateChat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: activeChatId,
          }),
        });
        const data = await res.json();
        if (data.done === "1") {
          currentChatId = data.populatedChat._id;
          socket.emit("join chat", data.populatedChat._id);

          setActiveChatId(data.populatedChat._id);
        }
        if (!res.ok) {
          console.log("cannot create private chat");
          return;
        }
      }

      const res = await fetch(
        `${url}/api/messages/postMessages?chatId=${currentChatId}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      console.log("sent");

      if (!res.ok) {
        setVisible(true);
      }

      const result = await res.json();
      console.log("result", result);
      appendMessage(result);
      reset();

      socket.emit("send message", {
        senderId: userId,
        message: result,
        chatId: currentChatId,
      });
      console.log("emitted send message", "chatId", activeChatId);
    } catch (err) {
      console.log(err);
    }
  }

  const emitStopTyping = useMemo(
    () =>
      debounce(() => {
        socket.emit("stop typing alert", { userId, username, activeChatId });
        console.log("emitted stop typing alert");
        setIsTyping(false);
      }, 3000),
    [userId, username, activeChatId, socket]
  );

  const handleChange = useCallback(
    (e) => {
      if (!isTyping) {
        console.log("emitting typing alert");
        socket.emit("typing alert", { userId, username, activeChatId });
        setIsTyping(true);
      }
      emitStopTyping();
    },
    [emitStopTyping, userId, username, activeChatId, isTyping, socket]
  );

  useEffect(() => {
    return () => {
      emitStopTyping.cancel();
    };
  }, [emitStopTyping]);

  if (!activeChatId) return null;
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.container}>
        <div className={styles.fileInputContainer} onClick={handleClick}>
          <img
            className={styles.fileInputIcon}
            src={fileInputIcon}
            alt="attach"
          />
        </div>

        <input
          {...register("text")}
          name="text"
          className={styles.inputArea}
          placeholder="Type a message"
          onChange={handleChange}
        />

        <input
          type="file"
          className="hidden"
          {...register("file", {
            required: false,
            validate: {
              lessThan5MB: (files) => {
                if (!files || files.length === 0) return true;
                return (
                  files[0].size < 5 * 1024 * 1024 ||
                  "File size should be less than 5MB"
                );
              },
              acceptedFormats: (files) => {
                if (!files || files.length === 0) return true;
                const accepted = [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "video/mp4",
                  "video/webm",
                  "audio/mpeg",
                  "audio/wav",
                  "video/ogg",
                  "audio/ogg",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "text/plain",
                  "application/pdf",
                  "application/zip",
                ];
                return (
                  accepted.includes(files[0].type) ||
                  "This file format is not supported"
                );
              },
            },
          })}
          ref={(e) => {
            fileRef.current = e;
            register("file").ref(e);
          }}
        />
        {errors.file && <p className="text-red-500">{errors.file.message}</p>}

        <button className={styles.sendButton} type="submit">
          <img src={sendIcon} className={styles.sendButtonImage} alt="send" />
        </button>
      </div>
    </form>
  );
};

export default MessageInputComp;
