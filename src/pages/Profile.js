

import React, { useEffect, useCallback } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../toast/ToastContext";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../features/auth";
import { fetchUserPosts, PostCard } from "../features/posts";
import ProfileHeader from '../features/profile/components/ProfileHeader';

import axiosClient from "../api/axiosClient";
import socket from "../socket"; 
import "../i18n";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { userPosts, isLoading: loadingPosts } = useSelector((state) => state.posts);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserPosts(user._id));
    }
  }, [user?._id, dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await axiosClient.post("/auth/logout"); 
    } catch (err) {
      console.error("Server logout error, forcing client cleanup:", err);
    } finally {
      if (socket) {
        socket.emit("logout", user?._id);
        socket.disconnect();
        socket.connect(); 
      }
      
      dispatch(logout());
      showToast("loggedOut", t("loggedOut"), { icon: "✅" });
      navigate("/login");
    }
  }, [dispatch, navigate, t, showToast, user?._id]);

  if (authLoading || !user) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>
        <Skeleton variant="circular" width={110} height={110} sx={{ mx: "auto", mb: 2 }} />
        <Skeleton width={150} height={30} sx={{ mx: "auto", mb: 1 }} />
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 5,
          direction: i18n.language === "ar" ? "rtl" : "ltr",
          px: 2,
        }}
      >
        <ProfileHeader
          profile={user}
          postsCount={userPosts?.length || 0}
          handleLogout={handleLogout}
          isOwner={true}
        />

        {loadingPosts
          ? Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
            ))
          : (!userPosts || userPosts.length === 0)
          ? (
            <Typography textAlign="center" sx={{ mt: 3, color: "text.secondary" }}>
              {t("noPostsYet")}
            </Typography>
          )
          : userPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
                isOnline={true} 
              />
            ))}
      </Box>
    </motion.div>
  );
}