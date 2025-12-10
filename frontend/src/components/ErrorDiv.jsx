import React, { useEffect } from "react";
import closeIcon from "../assets/close-icon.png";

const ErrorDiv = ({ message, visible, setVisible }) => {
  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [visible, setVisible]);

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-lg shadow-lg text-sm text-white bg-gray-800 transition-opacity duration-500 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
};

export default ErrorDiv;
