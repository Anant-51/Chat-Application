import React, { useRef, useEffect } from "react";
import ChatCard from "./ChatCard/ChatCard.jsx";
import useCentralStore from "../centralStore.jsx";

import SearchBar from "../components/SearchBar";
import { Virtuoso } from "react-virtuoso";

const ChatList = () => {
  const chatListData = useCentralStore((state) => state.chatListData);
  const setChatListData = useCentralStore((state) => state.setChatListData);
  const socket = useCentralStore((state) => state.socket);
  const userSearchResponse = useCentralStore(
    (state) => state.userSearchResponse
  );
  const setUserSearchResponse = useCentralStore(
    (state) => state.setUserSearchResponse
  );
  console.log("userSearchResponse", userSearchResponse);
  console.log("chatListData", chatListData);
  const listToDisplay = useRef([]);

  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) {
      socket.once("connect", () => setChatListData());
    } else {
      setChatListData();
    }

    return () => socket?.off("connect"); // cleanup
  }, [socket, setChatListData]);

  listToDisplay.current =
    userSearchResponse.length > 0 ? userSearchResponse : chatListData;
  console.log("listToDisplay", listToDisplay.current);

  return (
    <div className="flex flex-col h-full bg-white relative ">
      <div className="h-[70px] border-b border-gray-200 py-2  mt-[56px]  z-10 flex-shrink-0 bg-white">
        <SearchBar setUserSearchResponse={setUserSearchResponse} />
      </div>

      <div className="flex-1 mb-[60px] min-h-0 overflow-y-auto">
        {listToDisplay.current.map((chat) => (
          <ChatCard key={chat._id} chat={chat} />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
