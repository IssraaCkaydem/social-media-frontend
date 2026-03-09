
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";

import PostCard from "../components/PostCard";
import LikesPopup from "../components/LikesPopup";
import ProfileHeader from "../components/ProfileHeader";

export default function Profile({ setUser }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");

  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likesUsersPopup, setLikesUsersPopup] = useState([]);
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    axiosClient.get("/users/me")
      .then(res => {
        setProfile(res.data);
        setCurrentUserId(res.data._id);
      })
      .catch(err => console.log(err));
  }, []);


  const fetchPosts = async () => {
    if (!profile) return;
    try {
      const res = await axiosClient.get(`/posts/profile/${profile._id}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    if (profile) fetchPosts();
  }, [profile]);

  const toggleLike = async (postId) => {
    try {
      const res = await axiosClient.put(`/posts/${postId}/like`);
      setPosts(prev =>
        prev.map(p =>
          p._id === postId ? { ...p, likesUsers: res.data.likesUsers } : p
        )
      );
    } catch (err) {
      console.log(err);
    }
  };


  const openLikesList = (likesUsers) => {
    setLikesUsersPopup(likesUsers);
    setShowLikesPopup(true);
  };

  
  const addComment = async (postId, text) => {
    if (!text.trim()) return;

    try {
      const res = await axiosClient.post(`/comments/${postId}/comments`, { text });
      setPosts(prev =>
        prev.map(p =>
          p._id === postId ? { ...p, comments: res.data.comments } : p
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosClient.delete(`/comments/${postId}/comments/${commentId}`);
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, comments: p.comments.filter(c => c._id !== commentId) }
            : p
        )
      );
    } catch (err) {
      console.log(err);
    }
  };


  const toggleCommentsVisibility = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };


  const handleLogout = async () => {
    await axiosClient.post("/auth/logout");
    setUser(false);
    navigate("/login");
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>

     <ProfileHeader
  profile={profile}
  postsCount={posts.length}
  handleLogout={handleLogout}
  fetchPosts={fetchPosts}
  isOwner={true}     // 🔥 هيدي هي الحل
/>

        {/* POSTS */}
        {posts.length === 0 && (
          <Typography textAlign="center">No posts yet</Typography>
        )}

        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            toggleLike={toggleLike}
            toggleCommentsVisibility={toggleCommentsVisibility}
            openComments={openComments[post._id]}
            openLikesList={openLikesList}
            addComment={addComment}
            deleteComment={deleteComment}
            fetchPosts={fetchPosts} 
          />
        ))}

      </Box>

      {/* LIKES POPUP */}
      {showLikesPopup && (
        <LikesPopup
          users={likesUsersPopup}
          onClose={() => setShowLikesPopup(false)}
        />
      )}
    </motion.div>
  );
}
