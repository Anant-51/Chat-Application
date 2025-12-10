import React, { useState, useEffect } from "react";
import styles from "./UserInformation.module.css";
import useCentralStore from "../../centralStore";
const url = import.meta.env.VITE_BACKEND_URL;

const UserInformation = ({ userInformationRef }) => {
  const [user, setUser] = useState(null);
  const activeChatId = useCentralStore((state) => state.activeChatId);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(
          `${url}/api/user/userProfile?userId=${activeChatId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        alert(error.message);
      }
    }
    if (activeChatId) {
      fetchUserData();
    }
  }, [activeChatId]);

  return (
    <div className={styles.container} ref={userInformationRef}>
      <div className={styles.rightPanel}>
        <div className="flex flex-col items-center gap-4 py-6 px-4 text-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 shadow-lg">
            <img
              src={user?.profile}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-lg font-semibold text-white mt-5">
            {user?.username}
          </div>

          <div className="text-sm text-gray-300 max-w-xs">
            ~{user?.statusMessage || "No status message"}
          </div>

          <div className="text-sm text-white mt-2">
            Account created on:
            <span className="ml-1 text-black">
              {new Date(user?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;
