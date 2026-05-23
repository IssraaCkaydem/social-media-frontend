

import React, { useState, useCallback, memo } from "react";
import { 
  Dialog, DialogTitle, DialogContent, Box, Typography, Avatar, IconButton 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../../i18n";

const LikesPopup = memo(({ open, users = [], onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isRtl = i18n.language === "ar";
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const getAvatarUrl = useCallback((profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith("http")) return profilePic;
    return `${SERVER_URL}/${profilePic.replace(/^\//, "")}`;
  }, [SERVER_URL]);

  const handleUserClick = useCallback((userId) => {
    onClose?.();
    navigate(`/user/${userId}`);
  }, [navigate, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          borderRadius: 4, 
          width: '360px', 
          maxWidth: '100%',
          direction: isRtl ? "rtl" : "ltr"
        } 
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #f0f0f0', 
        py: 1.5,
      }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {t("likedBy")}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 1, maxHeight: '350px', overflowY: 'auto' }}>
        {users.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">{t("noLikesYet") || "No likes yet"}</Typography>
          </Box>
        ) : (
          users.map((u) => (
            <Box 
              key={u._id} 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                mb: 1, 
                gap: 2, 
                p: 1,
                borderRadius: 2,
                cursor: "pointer",
                transition: "background 0.15s ease-in-out",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
              onClick={() => handleUserClick(u._id)}
            >
              <Avatar 
                src={getAvatarUrl(u.profilePic)} 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: "#bdc3c7", 
                  fontSize: "14px", 
                  fontWeight: "bold" 
                }}
              >
                {!u.profilePic && u.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="body2" fontWeight="600" color="text.primary">
                {u.name}
              </Typography>
            </Box>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
});

LikesPopup.displayName = "LikesPopup";

export default LikesPopup;