


import React, { useState, useCallback } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../toast/ToastContext";

import { useDispatch } from "react-redux";
import { register } from "../features/auth";
import "../i18n";

export default function Register() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- States ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) return;

    try {
      const result = await dispatch(
        register({ name: trimmedName, email: trimmedEmail, password })
      );

      if (register.fulfilled.match(result)) {
        showToast("registrationSuccess", t("registrationSuccess"), {
          icon: "✅",
        });
        navigate("/");
      } 
      else {
        const err = result.payload;
        const validationErrors = err?.errors;
        let message;

        if (validationErrors && validationErrors.length > 0) {
          message = validationErrors.join(", ");
        } else {
          message = err?.message || t("registrationFailed");
        }

        showToast("registrationFailed", message, { icon: "❌" });
      }
    } catch (err) {
      console.error("Critical Registration Error:", err);
      showToast("registrationFailed", t("registrationFailed"), { icon: "❌" });
    }
  }, [name, email, password, dispatch, navigate, t, showToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f6fa",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: 400 },
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "background.paper",
          direction: i18n.language === "ar" ? "rtl" : "ltr",
        }}
      >
        <Typography
          variant="h4"
          mb={3}
          textAlign="center"
          fontWeight="bold"
          color="primary.main"
        >
          MyGram
        </Typography>

        <TextField
          fullWidth
          label={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()} 
        />

        <TextField
          fullWidth
          label={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()} 
        />

        <TextField
          fullWidth
          type="password"
          label={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()} 
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleRegister}
          disabled={!name.trim() || !email.trim() || !password} 
          sx={{ mt: 2, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
        >
          {t("register")}
        </Button>

        <Typography mt={2} textAlign="center" variant="body2" color="text.secondary">
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" style={{ color: "#00a8ff", fontWeight: 600, textDecoration: "none" }}>
            {t("login")}
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
}