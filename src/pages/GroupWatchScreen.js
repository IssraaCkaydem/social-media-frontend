
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, Paper, Typography, Avatar, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import axiosClient from "../api/axiosClient";
import { useOnline } from "../Context/OnlineContext";
import { useSelector } from "react-redux";

function GroupWatchScreen() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get("roomId");
  
  const { user } = useSelector((state) => state.auth);
  const { socket } = useOnline();

  // --- States ---
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messageText, setMessageText] = useState(""); 
  const [liveMessages, setLiveMessages] = useState([]);
  const [typingUserName, setTypingUserName] = useState(null);

  // --- Refs ---
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);

  // --- 1️⃣ Auto Scroll (Optimized Memory Reference) ---
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [liveMessages.length, typingUserName, scrollToBottom]);

  // --- 2️⃣ Fetch Post Data (Clean Setup) ---
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const response = await axiosClient.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [postId]);

  // --- 3️⃣ Handlers (useCallback for Maximum Performance) ---
  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (trimmed && socket && roomIdFromUrl && user) {
      socket.emit("sendLiveComment", {
        roomId: roomIdFromUrl,
        senderId: user._id,
        senderName: user.name,
        text: trimmed,
      });
      setMessageText("");
    }
  }, [messageText, socket, roomIdFromUrl, user]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setMessageText(value);
    if (socket && roomIdFromUrl && user) {
      socket.emit("typingLiveComment", { roomId: roomIdFromUrl, userName: user.name });
    }
  }, [socket, roomIdFromUrl, user]);

  const getImageUrl = useCallback(() => {
    if (!post) return null;
    const mediaPath = post.imageUrl || post.image || post.mediaUrl || post.file || post.media;
    if (!mediaPath) return null;
    if (mediaPath.startsWith("http")) return mediaPath;
    return `http://localhost:4000/${mediaPath.replace(/^\//, "")}`;
  }, [post]);

  // --- 4️⃣ Socket Connection & Listeners (The Rock-Solid Setup) ---
  useEffect(() => {
    if (!socket || !roomIdFromUrl || !user?._id) return;

    console.log("🚀 [JOINING ROOM]:", roomIdFromUrl);

    socket.emit("joinWatchRoom", { 
      roomId: roomIdFromUrl, 
      userId: user._id, 
      userName: user.name,
      profilePic: user.profilePic 
    });

    const handleUsersUpdate = (users) => setActiveUsers(users);
    const handleLiveComment = (newMsg) => setLiveMessages((prev) => [...prev, newMsg]);
    
    const handleUserJoined = ({ userName }) => {
      setLiveMessages((prev) => [
        ...prev,
        { senderName: "System", text: `👋 ${userName} joined the room`, isSystem: true }
      ]);
    };

    const handleUserLeft = ({ userName }) => {
      setLiveMessages((prev) => [
        ...prev,
        { senderName: "System", text: `🚪 ${userName} left the room`, isSystem: true }
      ]);
    };

    const handleUserTyping = ({ userName }) => {
      setTypingUserName(userName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUserName(null), 3000);
    };

    socket.on("roomUsersUpdate", handleUsersUpdate);
    socket.on("receiveLiveComment", handleLiveComment);
    socket.on("userJoinedRoom", handleUserJoined);
    socket.on("userLeftRoom", handleUserLeft);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("roomUsersUpdate", handleUsersUpdate);
      socket.off("receiveLiveComment", handleLiveComment);
      socket.off("userJoinedRoom", handleUserJoined);
      socket.off("userLeftRoom", handleUserLeft);
      socket.off("userTyping", handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomIdFromUrl, user?._id, user?.name, user?.profilePic]); 

  if (loading || !post) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 70px)", p: 2, gap: 2, bgcolor: "#f4f6f8" }}>
      
      {/* 👥 Active Users Sidebar */}
      <Paper sx={{ width: "250px", p: 2, display: "flex", flexDirection: "column", gap: 2, borderRadius: 4, boxShadow: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">👀 Active Now ({activeUsers.length})</Typography>
        <Box sx={{ overflowY: 'auto' }}>
          {activeUsers.map((u, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar 
                src={u.profilePic} 
                sx={{ width: 34, height: 34, bgcolor: u.userId === user?._id ? "secondary.main" : "#bdc3c7", fontSize: '14px' }}
              >
                {!u.profilePic && u.userName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight="600">{u.userName} {u.userId === user?._id && "(You)"}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* 🖼️ Shared Post Area */}
      <Paper sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 4, boxShadow: 3 }}>
        {getImageUrl() && (
          <img src={getImageUrl()} alt="Shared Post" style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "16px", boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
        )}
        <Typography variant="h6" sx={{ mt: 3, fontWeight: "500", textAlign: 'center', color: '#333' }}>{post.text}</Typography>
      </Paper>

      {/* 💬 Live Interaction Chat */}
      <Paper sx={{ width: "380px", p: 2, display: "flex", flexDirection: "column", borderRadius: 4, boxShadow: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, textAlign: "center", borderBottom: '1px solid #eee', pb: 1 }}>Live Chat 💬</Typography>
        
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", mb: 2, display: "flex", flexDirection: "column", gap: 1.5, px: 1 }}>
          {liveMessages.map((m, i) => (
            m.isSystem ? (
              <Typography key={i} variant="caption" sx={{ alignSelf: 'center', bgcolor: '#e0e0e0', px: 2, py: 0.5, borderRadius: 5, color: '#666' }}>
                {m.text}
              </Typography>
            ) : (
              <Box key={i} sx={{ alignSelf: m.senderId === user?._id ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <Typography variant="caption" sx={{ display: "block", mb: 0.3, px: 1, color: '#888' }}>{m.senderName}</Typography>
                <Paper sx={{ 
                    p: "10px 14px", 
                    bgcolor: m.senderId === user?._id ? "primary.main" : "#fff", 
                    color: m.senderId === user?._id ? "white" : "black", 
                    borderRadius: m.senderId === user?._id ? "18px 18px 0 18px" : "18px 18px 18px 0",
                    boxShadow: 1
                }}>
                  <Typography variant="body2">{m.text}</Typography>
                </Paper>
              </Box>
            )
          ))}
          {typingUserName && (
            <Typography variant="caption" color="primary" sx={{ fontStyle: "italic", ml: 1 }}>
              ✍️ {typingUserName} is typing...
            </Typography>
          )}
        </Box>

        {/* Input Controls */}
        <Box sx={{ display: "flex", gap: 1, pt: 1, borderTop: '1px solid #eee' }}>
          <TextField 
            fullWidth 
            placeholder="Type a comment..."
            size="small" 
            value={messageText} 
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
            onChange={handleInputChange} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={!messageText.trim()} 
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default GroupWatchScreen;