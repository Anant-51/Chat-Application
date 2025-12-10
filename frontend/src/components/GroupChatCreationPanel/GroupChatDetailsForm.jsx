import React from "react";
import { useForm } from "react-hook-form";
import cameraPlusIcon from "../../assets/camera-plus-icon.png";
import ErrorDiv from "../ErrorDiv";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import useCentralStore from "../../centralStore.jsx";

const url = import.meta.env.VITE_BACKEND_URL;
const GroupChatDetailsForm = ({ setIsGroupPanelOpen, selectedUsers }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
  });
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const file = watch("file");
  const fileRef = useRef(null);
  const formData = new FormData();
  const [result, setResult] = useState("");
  const user = useCentralStore((state) => state.user);
  const setChatListData = useCentralStore((state) => state.setChatListData);

  const userEmail = user.email;
  const userId = user._id;

  const setActiveChatId = useCentralStore((state) => state.setActiveChatId);

  const socket = useCentralStore((state) => state.socket);
  const appendMessage = useCentralStore((state) => state.appendMessage);

  const handleClick = () => {
    fileRef.current.click();
  };

  async function urlToFile(url, fileName) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  const onSubmit = async (data) => {
    const formData = new FormData();

    let fileToUpload;

    if (data.file && data.file[0]) {
      fileToUpload = data.file[0];
    } else {
      fileToUpload = await urlToFile(cameraPlusIcon, "default_group_pic.png");
    }

    formData.append("file", fileToUpload);
    formData.append("groupName", data.groupName);
    formData.append("users", JSON.stringify(selectedUsers));
    formData.append("groupDescription", data.groupDescription);
    if (selectedUsers.length < 3) {
      setVisible(true);
      setResult({ message: "Select at least 3 users" });
      return;
    }
    const response = await fetch(`${url}/api/chats/createGroupChat`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const responseData = await response.json();
    setResult(responseData);

    if (!response.ok) {
      setVisible(true);
    }
    if (response.ok) {
      socket.emit("group chat created", { members: selectedUsers });
      setChatListData();
      setActiveChatId(responseData.populatedGroupChat._id);
      console.log("group chat created", responseData.populatedGroupChat._id);
      setIsGroupPanelOpen(false);

      function emailToUserKey(email) {
        if (!email || !email.includes("@")) return null;

        const [prefix, domain] = email.split("@");

        const domainName = domain.split(".")[0];

        const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const cleanDomain = domainName
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();

        return `${cleanPrefix}_${cleanDomain}`;
      }
      function convertEmails(userEmail) {
        return emailToUserKey(userEmail);
      }

      const usersKey = convertEmails(userEmail);

      const adminKey = emailToUserKey(user.email);
      const messageToSend = `Group chat created by ${adminKey}`;
      console.log("⏱️ Waiting 300ms for group creation to propagate...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("✅ Delay complete, now posting system message");
      console.log(
        "📤 Posting system message to chatId:",
        responseData.populatedGroupChat._id
      );
      console.log("📤 Message text:", messageToSend);
      console.log(
        "📤 Full URL:",
        `${url}/api/messages/postMessages?chatId=${responseData.populatedGroupChat._id}`
      );
      const postMessagesResponse = await fetch(
        `${url}/api/messages/postMessages?chatId=${responseData.populatedGroupChat._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            chatId: responseData.populatedGroupChat._id,
            text: messageToSend,
            messageType: "groupChatModification",
          }),
        }
      );
      const postMessagesData = await postMessagesResponse.json();

      console.log(
        "📥 Post message response status:",
        postMessagesResponse.status
      );
      console.log("📥 Post message response data:", postMessagesData);
      appendMessage(postMessagesData);
      if (postMessagesResponse.ok) {
        console.log("✅ postMessagesResponse is OK!");
        console.log("🔍 senderId (userId) from Group chatmmmmmmm :", userId);
        console.log(
          "🔍 chatId from Group chatnnnnnnn:",
          responseData.populatedGroupChat._id
        );
        console.log("🔍 message from group chatnnnnnnn:", postMessagesData);
        console.log("🔍 socket exists group chatmmmmmmmm: ", !!socket);
        console.log(
          "🔍 socket.connected group chatnnnnnnn:",
          socket?.connected
        );

        socket.emit("send message", {
          senderId: userId,
          message: postMessagesData,
          chatId: responseData.populatedGroupChat._id,
        });

        console.log("✅ socket.emit('send message') called!");
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3 p-2 border-b border-gray-200">
        {visible && (
          <ErrorDiv
            message={result.message}
            visible={visible}
            setVisible={setVisible}
          />
        )}

        <div className="flex items-center gap-3">
          <div
            onClick={handleClick}
            className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer flex-shrink-0"
          >
            {file?.[0] ? (
              <img
                src={URL.createObjectURL(file[0])}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={cameraPlusIcon}
                className="w-full h-full object-cover"
              />
            )}
          </div>
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
                  const accepted = ["image/jpeg", "image/png", "image/webp"];
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

          <div className="flex flex-col flex-grow gap-2">
            <input
              type="text"
              {...register("groupName")}
              placeholder="Group Name"
              className="text-sm px-3 py-2 border border-gray-300 rounded-md outline-none w-full"
            />

            <input
              type="text"
              {...register("groupDescription")}
              placeholder="Description"
              className="text-sm px-3 py-2 border border-gray-300 rounded-md outline-none w-full"
            />
          </div>
        </div>

        <div className="text-[12px] text-gray-500 pl-1">
          {selectedUsers.length} participants selected
        </div>

        <button
          type="submit"
          className="self-end bg-blue-500 text-white text-sm px-4 py-1 rounded-md hover:bg-blue-600 transition"
        >
          Done
        </button>
      </div>
    </form>
  );
};

export default GroupChatDetailsForm;
