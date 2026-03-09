// src/components/UploadDialog.jsx
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, Typography } from "@mui/material";
import axiosClient from "../api/axiosClient";

export default function UploadDialog({ open, onClose, fetchPosts }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!text || !file) return alert("Please enter text and select a file!");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axiosClient.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const mediaUrl = uploadRes.data.mediaUrl;
      const mediaType = file.type.startsWith("video") ? "video" : "image";

      await axiosClient.post("/posts/uploadpost", { text, mediaUrl, mediaType });
      onClose();
      setText(""); setFile(null);
      fetchPosts();
    } catch (err) {
      console.log(err);
      alert("Error uploading post");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload New Post</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Post text" value={text} onChange={e => setText(e.target.value)} multiline rows={3} />
        <Button variant="contained" component="label">
          Choose file
          <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
        </Button>
        {file && <Typography>Selected file: {file.name}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
}
