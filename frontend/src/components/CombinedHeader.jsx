import React, { useEffect, useRef } from "react";
import plusIcon from "../assets/plus-icon.png";
import userIcon from "../assets/user-icon.jpg";
import useCentralStore from "../centralStore.jsx";

export default function CombinedHeader({
  setIsProfileOpen,
  setIsGroupPanelOpen,
  groupChatCreationRef,
  profileRef,
}) {
  const user = useCentralStore((state) => state.user);
  const userProfile = user?.profile ?? userIcon;

  const groupChatButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideGroup =
        groupChatButtonRef.current &&
        !groupChatButtonRef.current.contains(event.target) &&
        groupChatCreationRef.current &&
        !groupChatCreationRef.current.contains(event.target);

      if (clickedOutsideGroup) {
        setIsGroupPanelOpen(false);
      }
      const clickedOutsideProfile =
        profileRef.current && !profileRef.current.contains(event.target);

      if (clickedOutsideProfile) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between
                 h-14 px-4 md:px-6 text-white font-semibold
                 bg-gradient-to-r from-[#0A3D62] to-[#1A5276] shadow-md"
    >
      <div className="text-base md:text-lg font-semibold select-none">
        Convy...
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          ref={groupChatButtonRef}
          onClick={() => setIsGroupPanelOpen(true)}
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10
                     rounded-full hover:bg-[#1A5276]/60 transition-colors duration-200"
          title="Create group"
        >
          <img
            src={plusIcon}
            alt="Create group"
            className="w-4 h-4 md:w-5 md:h-5 invert"
          />
        </button>

        <button
          ref={profileButtonRef}
          onClick={() => setIsProfileOpen(true)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/30 
                     overflow-hidden hover:scale-105 shadow-md 
                     transition-transform duration-200"
          title="Profile"
        >
          <img
            src={userProfile}
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
