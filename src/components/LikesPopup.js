import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

export default function LikesPopup({ open, users, onClose }) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={onClose}>
      <div style={{ width:"300px", background:"#fff", borderRadius:10, padding:20, maxHeight:400, overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <Typography variant="h6" mb={2}>Liked by</Typography>
        {users.map(u => (
          <Box key={u._id} sx={{ display:"flex", alignItems:"center", mb:1, gap:1 }}>
            <Avatar src={u.profilePic} sx={{ width:30, height:30 }} />
            <Typography>{u.name}</Typography>
          </Box>
        ))}
      </div>
    </div>
  );
}
