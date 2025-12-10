import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import useCentralStore from "../../centralStore";

const UserProfileOverview = () => {
  const userDetails = useCentralStore((state) => state.user);
  const userProfile = userDetails?.profile || "/default-profile.png";
  const url = import.meta.env.VITE_BACKEND_URL;
  const [user, setUser] = useState(null);
  console.log(userDetails, "userDetails");
  console.log(user, "user");
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userDetails?._id) {
        console.log("userDetails not found");
        return;
      }

      try {
        const response = await fetch(
          `${url}/api/user/userProfile?userId=${userDetails._id}`,
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
    };

    fetchUserProfile();
  }, [userDetails?._id]);
  console.log("user from ser profile", user);
  console.log("user details", userDetails);

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 text-center">
      <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 shadow-lg">
        <img
          src={userProfile}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-lg font-semibold text-white mt-5">
        {user.username}
      </div>

      <div className="text-sm text-gray-300 max-w-xs">
        ~{user.statusMessage || "No status message"}
      </div>

      <div className="text-sm text-white mt-2">
        Account created on:
        <span className="ml-1 text-black">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default UserProfileOverview;
