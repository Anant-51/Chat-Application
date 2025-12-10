import React from "react";
import styles from "./GroupChatOverlayPanel.module.css";

const LeftPanelOptionsCard = ({ option, onClick, isOptionActive }) => {
  return (
    <div
      className={
        isOptionActive ? styles.leftPanelOptionActive : styles.leftPanelOption
      }
      onClick={onClick}
    >
      {option}
    </div>
  );
};

export default LeftPanelOptionsCard;
