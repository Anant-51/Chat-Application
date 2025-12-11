import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import useCentralStore from "./centralStore.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import SignUpPage from "./pages/SignUppage/SignUpPage.jsx";
import SignInPage from "./pages/SignInPage/SignInPage.jsx";
const url = import.meta.env.VITE_BACKEND_URL;
function App() {
  const setUser = useCentralStore((state) => state.setUser);
  const setSocket = useCentralStore((state) => state.setSocket);
  const socket = useCentralStore((state) => state.socket);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser && !socket) {
      const newSocket = io(url, {
        transports: ["websocket"],
        withCredentials: true,
      });
      setSocket(newSocket);
      setUser(savedUser);
    }
  }, [setUser, setSocket, socket]);
  useEffect(() => {
    if (!socket) return;

    console.log("🌍 Global socket.onAny registered");

    socket.onAny((event, ...args) => {
      console.log("🔥 GLOBAL SOCKET EVENT →", event, args);
    });

    return () => {
      console.log("🧹 Global socket.onAny removed");
      socket.offAny();
    };
  }, [socket]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/main" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
