
<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"; // 🆕
=======


// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde

import axiosClient from "../api/axiosClient";
import PostCard from "../components/PostCard";
import UploadDialog from "../components/UploadDialog";
import LikesPopup from "../components/LikesPopup";

export default function Home() {
  const navigate = useNavigate();
<<<<<<< HEAD

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [openUpload, setOpenUpload] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likesUsersPopup, setLikesUsersPopup] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosClient.get("/users/me");
      setCurrentUserId(res.data._id);
    } catch (err) {
<<<<<<< HEAD
      console.log("Error fetching user:", err);
=======
      console.log(err);
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axiosClient.get("/posts/all");
      setPosts(res.data.map(p => ({ ...p, comments: p.comments || [] })));
    } catch (err) {
<<<<<<< HEAD
      console.log("Error fetching posts:", err);
=======
      console.log(err);
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await axiosClient.put(`/posts/${postId}/like`);
      setPosts(prev =>
<<<<<<< HEAD
        prev.map(p =>
          p._id === postId
            ? { ...p, likesUsers: res.data.likesUsers }
            : p
        )
      );
    } catch (err) {
      console.log("Error toggling like:", err);
=======
        prev.map(p => p._id === postId ? { ...p, likesUsers: res.data.likesUsers } : p)
      );
    } catch (err) {
      console.log(err);
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
<<<<<<< HEAD

          {/* Profile */}
          <IconButton color="inherit" onClick={() => navigate("/profile")}>
            <PersonIcon />
          </IconButton>

          {/* Title */}
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            MYGRAM
          </Typography>

          {/* Inbox 🆕 */}
          <IconButton color="inherit" onClick={() => navigate("/inbox")}>
            <ChatBubbleOutlineIcon />
          </IconButton>

          {/* Search */}
          <IconButton color="inherit" onClick={() => navigate("/search")}>
            <SearchIcon />
          </IconButton>

          {/* Upload */}
          <IconButton color="inherit" onClick={() => setOpenUpload(true)}>
            <CloudUploadIcon />
          </IconButton>

=======
          <IconButton color="inherit" onClick={() => navigate("/profile")}>
            <PersonIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            MYGRAM
          </Typography>
          <IconButton color="inherit" onClick={() => navigate("/search")}>
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setOpenUpload(true)}>
            <CloudUploadIcon />
          </IconButton>
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
        {posts.length === 0 && <Typography>No posts yet</Typography>}
<<<<<<< HEAD

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            toggleLike={toggleLike}
            fetchPosts={fetchPosts}
<<<<<<< HEAD
            openLikesList={(likes) => {
              setLikesUsersPopup(likes);
              setShowLikesPopup(true);
            }}
=======
            openLikesList={(likes) => { setLikesUsersPopup(likes); setShowLikesPopup(true); }}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
          />
        ))}
      </Box>

      <UploadDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        fetchPosts={fetchPosts}
      />

      <LikesPopup
        open={showLikesPopup}
        users={likesUsersPopup}
        onClose={() => setShowLikesPopup(false)}
      />
    </motion.div>
  );
}
