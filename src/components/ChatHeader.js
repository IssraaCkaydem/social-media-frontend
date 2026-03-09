import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Box, Avatar, Typography } from "@mui/material";

const userCache = new Map();

export default function ChatHeader({ userId }) {
  const [user, setUser] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadUser = async () => {
      if (userCache.has(userId)) {
        setUser(userCache.get(userId));
        return;
      }
      try {
        const res = await axiosClient.get(`/users/${userId}`);
        if (!isMounted.current) return;
        setUser(res.data);
        userCache.set(userId, res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();

    return () => {
      isMounted.current = false;
    };
  }, [userId]);

  if (!user) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Avatar
        src={user.profilePic || "/default.png"}
        alt={user.name}
        sx={{ width: 50, height: 50, mr: 2 }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "#111", fontSize: "1rem" }}
        >
          {user.name}
        </Typography>
      </Box>
    </Box>
  );
}