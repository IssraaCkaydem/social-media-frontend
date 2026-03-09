

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Box, Typography, List, ListItem, ListItemText, Badge } from "@mui/material";
import socket from "../socket";

export default function Inbox() {
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const navigate = useNavigate();

  // ================= Fetch inbox users =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get("/messages/users");
        setUsers(res.data.map(u => ({ ...u, unreadCount: 0 }))); // add unreadCount initial
      } catch (err) {
        console.log("Error loading inbox users:", err);
      }
    };
    fetchUsers();
  }, []);

  // ================= Socket events =================
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // 1️⃣ Typing indicator
    const handleTyping = (senderId) => {
      setTypingUsers(prev => ({ ...prev, [senderId]: true }));
      setTimeout(() => {
        setTypingUsers(prev => {
          const copy = { ...prev };
          delete copy[senderId];
          return copy;
        });
      }, 1500);
    };
    socket.on("typing", handleTyping);

    // 2️⃣ Stop typing
    const handleStopTyping = (senderId) => {
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[senderId];
        return copy;
      });
    };
    socket.on("stopTyping", handleStopTyping);

    // 3️⃣ New message → update users list and unread count
    const handleNewMessage = (msg) => {
      setUsers(prev => {
        // إذا المستخدم موجود → تحديث unreadCount
        const exists = prev.some(u => u._id === msg.senderId || u._id === msg.receiverId);
        if (exists) {
          return prev.map(u => {
            if (u._id === msg.senderId) {
              return { ...u, unreadCount: (u.unreadCount || 0) + 1 };
            }
            return u;
          });
        } else {
          // إذا جديد، نضيفه للقائمة
          return [...prev, { _id: msg.senderId, name: msg.senderName || "User", unreadCount: 1 }];
        }
      });
    };
    socket.on("newMessage", handleNewMessage);

    // 4️⃣ Update unread count after seen
    const handleUnreadCount = ({ userId, unreadCount }) => {
      setUsers(prev =>
        prev.map(u =>
          u._id === userId
            ? { ...u, unreadCount }
            : u
        )
      );
    };
    socket.on("unreadCount", handleUnreadCount);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("newMessage", handleNewMessage);
      socket.off("unreadCount", handleUnreadCount);
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
      <Typography variant="h5" mb={2}>Inbox</Typography>

      <List>
        {users.map(u => (
          <ListItem key={u._id} button onClick={() => navigate(`/messages/${u._id}`)}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{u.name}</span>
                  {u.unreadCount > 0 && (
                    <Badge badgeContent={u.unreadCount} color="error" />
                  )}
                </Box>
              }
              secondary={
                typingUsers[u._id]
                  ? "Typing..."
                  : u.lastMessage || "Tap to open chat"
              }
              secondaryTypographyProps={{
                color: typingUsers[u._id] ? "green" : "text.secondary",
                fontSize: 12
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
