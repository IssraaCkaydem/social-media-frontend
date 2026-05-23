


// src/components/UploadDialog.jsx
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, Typography } from "@mui/material";
import axiosClient from "../api/axiosClient";
import { useTranslation } from "react-i18next";
import "../i18n";

export default function UploadDialog({ open, onClose, fetchPosts, isStory }) {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!isStory && !text) return alert(t("enterTextAndFile"));
    if (!file) return alert(t("chooseFile"));

    try {
      const formData = new FormData();
      
      if (isStory) {
        // حالة الستوري (شغالة تمام)
        formData.append("image", file);
        await axiosClient.post("/stories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        formData.append("image", file);
        
        formData.append("text", text);

        await axiosClient.post("/posts/uploadpost", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onClose();
      setText("");
      setFile(null);
      
      if (fetchPosts) fetchPosts();
      
    } catch (err) {
      console.error("Upload Error Info:", err.response?.data); 
      alert(isStory ? "Error uploading story" : t("errorUploadingPost"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isStory ? (i18n.language === "ar" ? "إضافة قصة" : "Add Story") : t("uploadNewPost")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300, direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
        {!isStory && (
          <TextField
            label={t("postText")}
            value={text}
            onChange={e => setText(e.target.value)}
            multiline
            rows={3}
            inputProps={{ style: { textAlign: i18n.language === "ar" ? "right" : "left" } }}
          />
        )}
        <Button variant="contained" component="label">
          {t("chooseFile")}
          <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
        </Button>
        {file && <Typography variant="caption">{t("selectedFile")}: {file.name}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button variant="contained" onClick={handleUpload}>{t("upload")}</Button>
      </DialogActions>
    </Dialog>
  );
}