import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Avatar, Box, Typography } from "@mui/material";

export default function FollowingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const res = await axiosClient.get(`/follow/${id}/following`);
      setFollowing(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Following</Typography>

      {following.map((u) => (
        <Box
          key={u._id}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            cursor: "pointer"
          }}
          onClick={() => navigate(`/user/${u._id}`)}
        >
          <Avatar src={u.profilePic} sx={{ mr: 2 }} />
          <Typography>{u.name}</Typography>
        </Box>
      ))}
    </Box>
  );
}
