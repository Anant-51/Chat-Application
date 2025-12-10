import React, { useEffect, useState } from "react";
import styles from "./UserProfile.module.css";
import LeftPanelOptionsCard from "./LeftPanelOptionsCard.jsx";
import UserProfileOverview from "./UserProfileOverview.jsx";
import EditDetails from "./EditDetails.jsx";
import Logout from "./Logout.jsx";
const UserProfile = ({ profileRef, setIsProfileOpen }) => {
  const [selectedOption, setSelectedOption] = useState("Overview");
  const options = ["Overview", "Edit details", "Logout"];
  const handleClick = (option) => {
    setSelectedOption(option);
  };
  return (
    <div ref={profileRef}>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          {options.map((option, index) => (
            <LeftPanelOptionsCard
              onClick={() => handleClick(option)}
              isOptionActive={selectedOption === option}
              option={option}
              key={index}
            />
          ))}
        </div>
        <div className={styles.rightPanel}>
          {selectedOption === "Overview" && <UserProfileOverview />}
          {selectedOption === "Edit details" && (
            <EditDetails setIsProfileOpen={setIsProfileOpen} />
          )}
          {selectedOption === "Logout" && (
            <Logout setIsProfileOpen={setIsProfileOpen} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
