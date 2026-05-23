


import React, { useCallback, memo } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../../i18n";

const ProfileHeader = memo(({ profile = {}, postsCount = 0, handleLogout, isOwner }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isRtl = i18n.language === "ar";
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const resolveUrl = useCallback((path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SERVER_URL}/${path.replace(/^\//, "")}`;
  }, [SERVER_URL]);

  // 2. حماية دوال الـ Navigation بـ useCallback
  const handleNavigateToFollowers = useCallback(() => {
    navigate(`/followers/${profile._id}`);
  }, [navigate, profile._id]);

  const handleNavigateToFollowing = useCallback(() => {
    navigate(`/following/${profile._id}`);
  }, [navigate, profile._id]);

  const handleNavigateToEdit = useCallback(() => {
    navigate("/profile/edit");
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Box sx={{ textAlign: "center", mb: 4, direction: isRtl ? "rtl" : "ltr" }}>

        <Avatar
          src={resolveUrl(profile.profilePic)}
          sx={{ width: 110, height: 110, mx: "auto", mb: 2, border: "3px solid #1976d2" }}
        />

        <Typography variant="h5" fontWeight="bold" color="text.primary">
          {profile.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {profile.email}
        </Typography>

        {/* Stats Section */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 3, px: 2, maxWidth: "450px", mx: "auto" }}>
          <Box sx={{ userSelect: "none" }}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">{postsCount}</Typography>
            <Typography variant="body2" color="text.secondary">{t("posts")}</Typography>
          </Box>

          <Box sx={{ cursor: "pointer", userSelect: "none" }} onClick={handleNavigateToFollowers}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {profile.followers?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">{t("followers")}</Typography>
          </Box>

          <Box sx={{ cursor: "pointer", userSelect: "none" }} onClick={handleNavigateToFollowing}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {profile.following?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">{t("following")}</Typography>
          </Box>
        </Box>

        {/* Owner Controls */}
        {isOwner && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleNavigateToEdit}
              sx={{ fontWeight: "bold" }}
            >
              {t("editProfile")}
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{ fontWeight: "bold" }}
            >
              {t("logout")}
            </Button>
          </Box>
        )}

      </Box>
    </motion.div>
  );
});

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;