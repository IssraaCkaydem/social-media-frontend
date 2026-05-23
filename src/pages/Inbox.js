
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Badge, Avatar, Divider, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import socket from "../socket";
import { getInboxUsers } from "../features/chat";

export default function Inbox() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // --- States ---
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [recordingUsers, setRecordingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  
  const lastProcessedMsgId = useRef(null);

  const getAvatarUrl = useCallback((profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith("http")) return profilePic;
    return `http://localhost:4000/${profilePic.replace(/^\//, "")}`;
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return "";
    const now = dayjs();
    const msgDate = dayjs(date);
    if (now.isSame(msgDate, "day")) return msgDate.format("hh:mm A");
    if (now.subtract(1, "day").isSame(msgDate, "day")) return "Yesterday";
    return msgDate.format("DD/MM/YYYY");
  }, []);

  useEffect(() => {
    const loadInbox = async () => {
      try {
        setLoading(true);
        const res = await getInboxUsers();
        const data = Array.isArray(res) ? res : (res?.users || []);
        setUsers(data);
      } catch (err) {
        console.error("API Error:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) loadInbox();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleNewMessage = (msg) => {
      if (lastProcessedMsgId.current === msg._id) return;
      lastProcessedMsgId.current = msg._id;

      setUsers((prev) => {
        if (!Array.isArray(prev)) return [];
        const targetId = msg.senderId === user?._id ? msg.receiverId : msg.senderId;
        
        const existingUser = prev.find(u => u._id === targetId);
        if (!existingUser) return prev;

        const isFromMe = msg.senderId === user?._id;
        const updatedUser = {
          ...existingUser,
          unreadCount: !isFromMe ? (existingUser.unreadCount || 0) + 1 : existingUser.unreadCount,
          lastMessage: msg.text || (msg.type === "voice" ? "🎤 Voice message" : "📩 Message"),
          lastMessageTime: msg.createdAt,
        };

        const others = prev.filter((u) => u._id !== targetId);
        return [updatedUser, ...others]; 
      });
    };

    const handleTyping = ({ senderId }) => setTypingUsers((p) => ({ ...p, [senderId]: true }));
    const handleStopTyping = ({ senderId }) => setTypingUsers((p) => { const c = { ...p }; delete c[senderId]; return c; });
    const handleRecording = ({ senderId }) => setRecordingUsers((p) => ({ ...p, [senderId]: true }));
    const handleStopRecording = ({ senderId }) => setRecordingUsers((p) => { const c = { ...p }; delete c[senderId]; return c; });

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("recording", handleRecording);
    socket.on("stopRecording", handleStopRecording);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("recording", handleRecording);
      socket.off("stopRecording", handleStopRecording);
    };
  }, [user?._id]);

  const sortedUsers = useMemo(() => {
    return users
      .slice()
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  }, [users]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>Inbox</Typography>
      
      <List sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((u, index) => (
            <Box key={u._id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(`/messages/${u._id}`)} sx={{ py: 1.5 }}>
                  
                  <Avatar src={getAvatarUrl(u.profilePic)} sx={{ width: 55, height: 55, mr: 2, bgcolor: "#bdc3c7", fontWeight: "bold" }}>
                    {!u.profilePic && u.name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography component="span" variant="subtitle1" sx={{ fontWeight: "bold" }}>
                          {u.name}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTime(u.lastMessageTime)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: "80%", 
                            color: (recordingUsers[u._id] || typingUsers[u._id]) ? "success.main" : "text.secondary",
                            fontWeight: (recordingUsers[u._id] || typingUsers[u._id]) ? "bold" : "normal",
                            display: 'block'
                          }}
                        >
                          {recordingUsers[u._id] ? "🎤 Recording..." : typingUsers[u._id] ? "Typing..." : u.lastMessage || "No messages"}
                        </Typography>
                        {u.unreadCount > 0 && (
                          <Badge badgeContent={u.unreadCount} color="error" />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < sortedUsers.length - 1 && <Divider variant="inset" component="li" />}
            </Box>
          ))
        ) : (
          <Typography sx={{ p: 3, textAlign: "center", color: "gray" }}>No conversations found.</Typography>
        )}
      </List>
    </Box>
  );
}