import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

export default function AddCommentInput({ postId, addComment }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    addComment(postId, text);
    setText("");
  };

  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
      <TextField size="small" fullWidth placeholder="Add a comment..." value={text} onChange={e => setText(e.target.value)} />
      <Button variant="contained" onClick={handleSubmit}>Post</Button>
    </Box>
  );
}
