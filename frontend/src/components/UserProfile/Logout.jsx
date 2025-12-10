import React, { useState } from "react";
import styles from "./UserProfile.module.css";
import ErrorDiv from "../ErrorDiv.jsx";
import { useNavigate } from "react-router-dom";
import useCentralStore from "../../centralStore.jsx";

const Logout = ({ setIsProfileOpen }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useCentralStore((state) => state.user);
  const navigate = useNavigate();
  const setSocket = useCentralStore((state) => state.setSocket);
  const setUser = useCentralStore((state) => state.setUser);
  const socket = useCentralStore((state) => state.socket);

  const handleYesButtonClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${url}/api/user/signout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();

      if (res.ok) {
        if (socket?.connected) {
          socket.disconnect();
        }

        setSocket(null);
        setUser(null);
        localStorage.removeItem("user");

        navigate("/");
      } else {
        setVisible(true);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setVisible(true);
    } finally {
      setLoading(false);
      setIsProfileOpen(false);
    }
  };

  const handleNoButtonClick = () => {
    setIsProfileOpen(false);
  };

  return (
    <div className={styles.logoutContainer}>
      {visible && (
        <ErrorDiv
          message="Something went wrong"
          visible={visible}
          setVisible={setVisible}
        />
      )}

      <div className={styles.modalBox}>
        <div className={styles.message}>Are you sure you want to logout?</div>

        <div className={styles.buttonRow}>
          <div
            className={styles.yesButton}
            onClick={handleYesButtonClick}
            style={{
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging out..." : "Yes"}
          </div>
          <div
            className={styles.noButton}
            onClick={handleNoButtonClick}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            No
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
