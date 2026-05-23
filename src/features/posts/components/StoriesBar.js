

import React, { useMemo, useCallback, memo } from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../../../i18n";

const StoriesBar = memo(({ stories = [], currentUser, onAddStory, onOpenStory }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const resolveUrl = useCallback((path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SERVER_URL}/${path.replace(/^\//, "")}`;
  }, [SERVER_URL]);

  const otherStories = useMemo(() => {
    if (!stories.length) return [];
    return Array.from(
      new Map(
        stories
          .filter((s) => s.userId?._id && s.userId?._id !== currentUser?._id)
          .map((s) => [s.userId?._id, s])
      ).values()
    );
  }, [stories, currentUser?._id]);

  const myStory = useMemo(() => {
    return stories.find((s) => s.userId?._id === currentUser?._id);
  }, [stories, currentUser?._id]);

  const currentUserHasStory = Boolean(myStory);

  const handleMyStoryClick = useCallback(() => {
    if (currentUserHasStory) {
      onOpenStory?.(myStory);
    } else {
      onAddStory?.();
    }
  }, [currentUserHasStory, myStory, onOpenStory, onAddStory]);

  const handleAddBtnClick = useCallback((e) => {
    e.stopPropagation();
    onAddStory?.();
  }, [onAddStory]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        overflowX: "auto",
        backgroundColor: "background.paper",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: 3,
        mb: 2,
        direction: isRtl ? "rtl" : "ltr", 
        "::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {/* --- Your Story Section --- */}
      <Box sx={{ textAlign: "center", flexShrink: 0 }}>
        <Box 
          sx={{ 
            position: "relative",
            padding: currentUserHasStory ? "3px" : "0px",
            borderRadius: "50%",
            background: currentUserHasStory 
              ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" 
              : "none",
            display: "inline-block",
            cursor: "pointer"
          }}
          onClick={handleMyStoryClick}
        >
          <Avatar
            src={resolveUrl(currentUser?.profilePic)}
            sx={{ 
              width: 65, 
              height: 65, 
              border: "3px solid #fff",
              boxShadow: currentUserHasStory ? "none" : "0 0 0 2px #e0e0e0" 
            }}
          />

          <IconButton
            onClick={handleAddBtnClick}
            size="small"
            aria-label={t("addStory") || "Add Story"}
            sx={{
              position: "absolute",
              bottom: 0,
              right: isRtl ? "unset" : 0,
              left: isRtl ? 0 : "unset",
              backgroundColor: "#0095f6",
              color: "#fff",
              width: 22,
              height: 22,
              border: "2px solid #fff",
              "&:hover": { backgroundColor: "#1976d2" },
              zIndex: 2
            }}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 0.5, 
            display: "block", 
            fontWeight: currentUserHasStory ? 600 : 400,
            color: "text.primary"
          }}
        >
          {isRtl ? "قصتك" : "Your Story"}
        </Typography>
      </Box>

      {/* --- Others Stories --- */}
      {otherStories.map((story) => (
        <motion.div
          key={story._id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenStory?.(story)}
          style={{ textAlign: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <Box
            sx={{
              padding: "3px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar
              src={resolveUrl(story.userId?.profilePic)}
              sx={{ width: 60, height: 60, border: "3px solid #fff" }}
            />
          </Box>
          <Typography variant="caption" sx={{ mt: 0.5, display: "block", fontWeight: 500, color: "text.primary" }}>
            {story.userId?.name ? story.userId.name.split(" ")[0] : "User"}
          </Typography>
        </motion.div>
      ))}
    </Box>
  );
});

StoriesBar.displayName = "StoriesBar";

export default StoriesBar;