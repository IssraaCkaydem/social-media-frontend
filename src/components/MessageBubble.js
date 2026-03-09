


import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

export default function MessageBubble({
  message,                // الرسالة كاملة
  isMe,                   // هل الرسالة مني
  onDeleteForMe,          // دالة حذف للرسائل الخاصة فيني
  onDeleteForEveryone,    // دالة حذف لكل الناس (sender)
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
      }}
    >
      <Box>
        {message.type === "voice" ? (
          <audio controls src={`http://localhost:4000/${message.audioUrl}`} />
        ) : (
          <Typography sx={{ wordBreak: "break-word" }}>
            {message.text}
          </Typography>
        )}

        {message.type === "voice" && message.audioDuration && (
          <Typography sx={{ fontSize: 12, color: "#555" }}>
            Duration: {message.audioDuration}s
          </Typography>
        )}

        {isMe && (
          <Typography sx={{ fontSize: 11, color: "#777", mt: 0.5 }}>
            {message.seen ? "Seen" : "Sent"}
          </Typography>
        )}
      </Box>

      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onDeleteForMe?.(message._id);
            handleClose();
          }}
        >
          Delete for me
        </MenuItem>

        {isMe && (
          <MenuItem
            onClick={() => {
              onDeleteForEveryone?.(message._id);
              handleClose();
            }}
          >
            Delete for everyone
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}


