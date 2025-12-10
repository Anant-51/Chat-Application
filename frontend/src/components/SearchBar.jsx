import React, { useState } from "react";
import Button from "@mui/material/Button";

const SearchBar = ({ setUserSearchResponse }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [searchItem, setSearchItem] = useState("");

  const handleChange = async (e) => {
    const value = e.target.value.trim();
    setSearchItem(value);

    if (!value) {
      setUserSearchResponse([]);
      return;
    }

    const response = await fetch(
      `${url}/api/chats/searchChats?searchItem=${encodeURIComponent(value)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    console.log("data from search bar", data);
    setUserSearchResponse(data.chats);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchItem.trim()) return;

    const response = await fetch(
      `${url}/api/chats/searchChats?searchItem=${searchItem}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    setUserSearchResponse(data.chats);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center px-1 sm:px-2 lg:px-4 gap-2">
        <input
          type="text"
          value={searchItem}
          onChange={handleChange}
          placeholder="Search or start new chat"
          className="flex-1
                     
                     h-[50px]
                     w-[360px]
                     px-6 py-3 text-lg
                     text-gray-900 placeholder-gray-500
                     bg-[#f0f2f5]
                     rounded-md
                     border-b-2 border-transparent
                     focus:outline-none focus:border-[#003366]
                     transition-all duration-200
                     shadow-inner"
        />

        <div className=" mr-2">
          <Button
            type="submit"
            variant="contained"
            sx={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.125rem",
              height: "40px",
              fontWeight: 600,
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
