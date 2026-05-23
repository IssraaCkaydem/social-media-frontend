
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, TextField, Button, Typography, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../toast/ToastContext";
import "../i18n";

import { updateUser, getMe, updateMe } from "../features/auth";

export default function EditProfile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ name: "", email: "" });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getMe(); 
        setForm({
          name: res?.name || "", 
          email: res?.email || "", 
        });
        setPreview(res?.profilePic || null); 
      } catch (err) {
        showToast("error", t("failedLoadProfile"), { icon: "❌" });
      }
    };
    loadUser();
  }, [t, showToast]); 

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImage = useCallback((e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    setFile(selected);
    setPreview((prevUrl) => {
      if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(selected);
    });
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) return;

    try {
      const data = new FormData();
      data.append("name", trimmedName);
      data.append("email", trimmedEmail);
      if (file) data.append("profilePic", file);

      const result = await updateMe(data); 
      const userData = result.user ? result.user : result;

      if (userData) {
        dispatch(updateUser(userData)); 
      }

      showToast("success", t("updateSuccess"), { icon: "✅" });
      
      const timer = setTimeout(() => navigate("/profile"), 100);
      return () => clearTimeout(timer);

    } catch (err) {
      console.error(err);
      showToast("error", t("updateFailed"), { icon: "❌" });
    }
  }, [form, file, dispatch, navigate, t, showToast]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  console.log("🔥 Component Rendered!");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box
        sx={{
          maxWidth: 450,
          mx: "auto",
          mt: 8,
          p: 3,
          textAlign: "center",
          direction: i18n.language === "ar" ? "rtl" : "ltr",
        }}
      >
        <Typography variant="h5" mb={3}>
          {t("editProfile")}
        </Typography>

        <Avatar src={preview} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />

        <Button variant="outlined" component="label">
          {t("uploadProfilePic")}
          <input type="file" hidden accept="image/*" onChange={handleImage} />
        </Button>

        <TextField
          fullWidth
          name="name"
          label={t("name")}
          value={form.name}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          name="email"
          label={t("email")}
          value={form.email}
          onChange={handleChange}
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSave}
          disabled={!form.name.trim() || !form.email.trim()}
        >
          {t("save")}
        </Button>
      </Box>
    </motion.div>
  );
}