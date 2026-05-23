

import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import socket from "../../../socket"; 

dayjs.extend(relativeTime);

export default function ChatHeader({ userId, onClearChat }) {
  const [user, setUser] = useState(null);
  const isMountedRef = useRef(true); 

  // MENU STATE
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const getAvatarUrl = useCallback((profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith("http")) return profilePic;
    return `http://localhost:4000/${profilePic.replace(/^\//, "")}`;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
const loadUser = async () => {
  try {
    const res = await axiosClient.get(`/users/${userId}`);
    
    let userData = null;
    
    if (res?.data?.user) {
      userData = res.data.user;
    } else if (res?.data) {
      userData = res.data; 
    } else if (res?.user) {
      userData = res.user; 
    } else {
      userData = res;
    }

    console.log("🔍 ChatHeader Resolved User Data:", userData);

    if (isMountedRef.current && userData && (userData.name || userData._id)) {
      setUser(userData);
    }
  } catch (err) {
    console.error("ChatHeader Load Error:", err);
  }
};
    if (userId) loadUser();

    const handleStatusChange = ({ userId: changedUserId, isOnline, lastSeen }) => {
      if (changedUserId === userId) {
        setUser((prev) => (prev ? { ...prev, isOnline, lastSeen } : prev));
      }
    };

    socket.on("userStatusChanged", handleStatusChange);

    return () => {
      isMountedRef.current = false;
      socket.off("userStatusChanged", handleStatusChange);
    };
  }, [userId]);

  if (!user) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: user.isOnline ? "#44b700" : "#bdbdbd",
              color: user.isOnline ? "#44b700" : "#bdbdbd",
              boxShadow: `0 0 0 2px #fff`,
              width: 12,
              height: 12,
              borderRadius: "50%",
            },
          }}
        >
          <Avatar
            src={getAvatarUrl(user.profilePic)}
            alt={user.name}
            sx={{ width: 45, height: 45, bgcolor: "#bdc3c7", fontWeight: "bold" }}
          >
            {!user.profilePic && user.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>

        <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#111", fontSize: "1rem", lineHeight: 1.2 }}
          >
            {user.name}
          </Typography>
          
          <Typography variant="caption" sx={{ color: user.isOnline ? "#44b700" : "#777", fontWeight: user.isOnline ? "600" : "normal" }}>
            {user.isOnline ? (
              "Online"
            ) : (
              user.lastSeen ? `Last seen ${dayjs(user.lastSeen).fromNow()}` : "Offline"
            )}
          </Typography>
        </Box>
      </Box>

      <Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              onClearChat?.();
              handleMenuClose();
            }}
            sx={{ color: "error.main", fontWeight: "500" }}
          >
            Clear Chat
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}