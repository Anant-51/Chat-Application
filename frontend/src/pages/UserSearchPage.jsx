import React, { useEffect, useState } from "react";
import ChatListHeader from "../components/ChatListHeader";
import ChatCard from "../components/ChatCard/ChatCard";
import SearchBar from "../components/SearchBar";
import { Virtuoso } from "react-virtuoso";
import useCentralStore from "../centralStore.jsx";
const url = import.meta.env.VITE_BACKEND_URL;

const UserSearchPage = () => {
  const userSearchResponse = useCentralStore(
    (state) => state.userSearchResponse
  );
  const setUserSearchResponse = useCentralStore(
    (state) => state.setUserSearchResponse
  );
  return (
    <div className="flex flex-col h-full">
      <ChatListHeader />
      <SearchBar setUserSearchResponse={setUserSearchResponse} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        <div className="flex-grow min-h-0">
          <Virtuoso
            className="h-full"
            data={userSearchResponse}
            itemContent={(index, chat) => (
              <ChatCard key={chat.chatId} chat={chat} />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;
