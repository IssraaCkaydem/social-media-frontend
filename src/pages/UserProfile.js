

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { logout } from "../features/auth";
import { fetchUserPosts, LikesPopup } from "../features/posts";
import { ProfileHeader, ProfilePost } from "../features/profile";

import axiosClient from "../api/axiosClient";
import socket from "../socket";
import "../i18n";

export default function UserProfile() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { userPosts, isLoading } = useSelector((state) => state.posts);

  const currentUserId = user?._id;

  // --- Local States ---
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likesUsersPopup, setLikesUsersPopup] = useState([]);
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const resUser = await axiosClient.get(`/users2/${id}`);
        setProfile(resUser.data.user);

        dispatch(fetchUserPosts(id));

        if (currentUserId) {
          setIsFollowing(resUser.data.user.followers.includes(currentUserId));
        }
      } catch (err) {
        console.error("Profile Load Error:", err);
        toast.error(t("profileLoadError"));
      }
    };

    fetchData();
  }, [id, currentUserId, t, dispatch]); 

  const handleFollow = useCallback(async () => {
    if (!id) return;
    try {
      await axiosClient.post(`/follow/follow/${id}`);
      setIsFollowing(true);
      toast.success(t("followSuccess"));
      dispatch(fetchUserPosts(id));
    } catch (err) {
      toast.error(t("followError"));
    }
  }, [id, dispatch, t]);

  const handleUnfollow = useCallback(async () => {
    if (!id) return;
    try {
      await axiosClient.delete(`/follow/unfollow/${id}`);
      setIsFollowing(false);
      toast.success(t("unfollowSuccess"));
      dispatch(fetchUserPosts(id));
    } catch (err) {
      toast.error(t("unfollowError"));
    }
  }, [id, dispatch, t]);

  const handleMessage = useCallback(() => {
    if (profile?._id) {
      navigate(`/messages/${profile._id}`);
    }
  }, [profile?._id, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout server error, processing client purge:", err);
    } finally {
      if (socket) {
        socket.emit("logout", currentUserId);
        socket.disconnect();
        socket.connect();
      }
      dispatch(logout());
      navigate("/login");
    }
  }, [currentUserId, dispatch, navigate]);

  const toggleCommentsVisibility = useCallback((postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }, []);

  const openLikesPopupHandler = useCallback((users) => {
    setLikesUsersPopup(users);
    setShowLikesPopup(true);
  }, []);

  // --- LOADING / FALLBACK SETUP ---
  if (isLoading || !profile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = currentUserId === profile._id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 5,
          px: 2,
          direction: i18n.language === "ar" ? "rtl" : "ltr",
        }}
      >
        <ProfileHeader
          profile={profile}
          postsCount={userPosts?.length || 0}
          handleLogout={handleLogout}
          isOwner={isOwner}
        />

        {!isOwner && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
            {isFollowing ? (
              <Button variant="outlined" color="error" onClick={handleUnfollow} sx={{ borderRadius: 2, fontWeight: "600" }}>
                {t("unfollow")}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleFollow} sx={{ borderRadius: 2, fontWeight: "600" }}>
                {t("follow")}
              </Button>
            )}

            <Button variant="outlined" onClick={handleMessage} sx={{ borderRadius: 2, fontWeight: "600" }}>
              {t("message")}
            </Button>
          </Box>
        )}

        {userPosts?.length === 0 ? (
          <Typography textAlign="center" mt={4} color="text.secondary">
            {t("noPostsYet")}
          </Typography>
        ) : (
          userPosts.map((post) => (
            <ProfilePost
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              toggleCommentsVisibility={toggleCommentsVisibility}
              openComments={openComments}
              openLikesList={openLikesPopupHandler}
            />
          ))
        )}
      </Box>

      <LikesPopup
        open={showLikesPopup}
        users={likesUsersPopup}
        onClose={() => setShowLikesPopup(false)}
      />
    </motion.div>
  );
}