

import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "../../../i18n";

import VoiceMessage from "./VoiceMessage";

export default function MessageBubble({
  message,
  isMe,
  onDeleteForMe,
  onDeleteForEveryone,
}) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const isRtl = i18n.language === "ar";
  const SERVER_URL = "http://localhost:4000";

  console.log("DEBUG MESSAGE:", message);

  return (
    <Box
      sx={{
        mb: 1,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: isMe ? "#DCF8C6" : "#FFF",
        alignSelf: isMe ? "flex-end" : "flex-start",
        maxWidth: "80%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0px 1px 1px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ pr: isMe ? 2 : 0, pl: !isMe ? 0 : 0 }}>
        
        {message.type === "voice" ? (
          <VoiceMessage
            src={`${SERVER_URL}/${message.audioUrl}`}
            duration={message.audioDuration}
          />
        ) : 

        message.type === "image" ? (
          <Box sx={{ mt: 0.5 }}>
            <img 
              src={message.imageUrl.startsWith("http") ? message.imageUrl : `${SERVER_URL}${message.imageUrl}`} 
              alt="sent-attachment" 
              style={{ 
                width: "100%", 
                maxHeight: "350px", 
                borderRadius: "8px", 
                objectFit: "cover",
                display: "block",
                cursor: "pointer"
              }}
              onClick={() => window.open(message.imageUrl.startsWith("http") ? message.imageUrl : `${SERVER_URL}${message.imageUrl}`, '_blank')}
            />
            {message.text && (
              <Typography sx={{ wordBreak: "break-word", fontSize: "0.95rem", mt: 1 }}>
                {message.text}
              </Typography>
            )}
          </Box>
        ) : 

        message.type === "story_reply" ? (
          <Box 
            sx={{ 
              mt: 0.5, 
              bgcolor: "rgba(0, 0, 0, 0.04)", 
              borderRadius: "8px", 
              p: 1,
              borderLeft: isRtl ? "none" : "3px solid #E1306C", 
              borderRight: isRtl ? "3px solid #E1306C" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 1
            }}
          >
            {message.storySnapshot && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img 
                  src={message.storySnapshot.startsWith("http") ? message.storySnapshot : `${SERVER_URL}${message.storySnapshot}`} 
                  alt="story-snapshot" 
                  style={{ 
                    width: "50px", 
                    height: "70px", 
                    borderRadius: "6px", 
                    objectFit: "cover",
                    border: "1px solid #ddd"
                  }} 
                />
                <Typography sx={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>
                  {isRtl ? "الرد على القصة" : "Replied to story"}
                </Typography>
              </Box>
            )}

            <Typography sx={{ wordBreak: "break-word", fontSize: "0.95rem", fontWeight: 500 }}>
              {message.text}
            </Typography>
          </Box>
        ) : (

          <Typography sx={{ wordBreak: "break-word", fontSize: "0.95rem" }}>
            {message.text}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <Typography sx={{ fontSize: 10, color: "#888" }}>
            {dayjs(message.createdAt).format("hh:mm A")}
          </Typography>

          {isMe && (
            <Typography sx={{ fontSize: 11, color: message.seen ? "#34B7F1" : "#888", fontWeight: "bold" }}>
              {message.seen ? "✓✓" : "✓"} 
            </Typography>
          )}
        </Box>
      </Box>

      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ 
          position: "absolute", 
          top: 2, 
          right: isRtl ? "unset" : 2, 
          left: isRtl ? 2 : "unset",
          opacity: 0,
          "&:hover": { opacity: 1 },
          transition: "0.2s"
        }}
        className="message-options-btn"
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onDeleteForMe?.(message._id);
            handleClose();
          }}
        >
          {t("deleteForMe")}
        </MenuItem>

        {isMe && (
          <MenuItem
            onClick={() => {
              onDeleteForEveryone?.(message._id);
              handleClose();
            }}
          >
            {t("deleteForEveryone")}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}