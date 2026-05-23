


import { createContext, useState, useEffect, useContext } from "react";
import socket from "../socket"; 

const OnlineContext = createContext();

export const OnlineProvider = ({ children, user }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    console.log("%c Context useEffect Triggered! ", "background: #222; color: #bada55; font-size: 14px");
    console.log("Current User ID:", user?._id);

    if (!user || !user._id) {
      console.log("❌ No User ID found, skipping socket connection.");
      setOnlineUsers([]);
      return;
    }

    console.log("Socket connected status BEFORE check:", socket.connected);

    if (!socket.connected) {
      console.log("🔌 Attempting to connect socket...");
      socket.connect();
    }

    console.log("%c 🚀 EMITTING JOIN FOR:", "color: orange; font-weight: bold", user._id);
    socket.emit("join", user._id);

    // 4. استلام القائمة الكاملة
    const handleGetInitialUsers = (usersList) => {
      console.log("📥 Received Initial Online Users:", usersList);
      setOnlineUsers(usersList);
    };

    const handleStatusChange = (data) => {
      console.log("📡 Status Changed Event:", data);
      const { userId, isOnline } = data;
      setOnlineUsers((prevUsers) => {
        if (isOnline) {
          return prevUsers.includes(userId) ? prevUsers : [...prevUsers, userId];
        } else {
          return prevUsers.filter((id) => id !== userId);
        }
      });
    };

    socket.on("getOnlineUsers", handleGetInitialUsers);
    socket.on("userStatusChanged", handleStatusChange);

    return () => {
      console.log("%c 🧹 Cleanup: Removing Listeners for ID:", "color: red", user._id);
      socket.off("getOnlineUsers", handleGetInitialUsers);
      socket.off("userStatusChanged", handleStatusChange);
    };
  }, [user?._id]); 

  return (
    <OnlineContext.Provider value={{ onlineUsers, socket }}> 
      {children}
    </OnlineContext.Provider>
  );
};

export const useOnline = () => useContext(OnlineContext);