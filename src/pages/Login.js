
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../toast/ToastContext";
import { useDispatch } from "react-redux";
import { login } from "../features/auth";
import "../i18n";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- States ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countdown, setCountdown] = useState(0);

  // --- Refs ---
  const countdownIntervalRef = useRef(null);

  const startCountdown = useCallback((blockedUntil) => {
    const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
    if (remaining <= 0) return;

    setCountdown(remaining);
    showToast("tooManyAttempts", t("tooManyAttempts"), { icon: "❌" });

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          localStorage.removeItem("blockedUntil");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [t, showToast]);

  useEffect(() => {
    const blockedUntilLS = localStorage.getItem("blockedUntil");
    if (blockedUntilLS) startCountdown(Number(blockedUntilLS));

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [startCountdown]);

  const handleLogin = useCallback(async () => {
    if (countdown > 0) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    try {
      const result = await dispatch(login({ email: trimmedEmail, password }));

      if (login.fulfilled.match(result)) {
        showToast("loginSuccess", t("loginSuccess"), { icon: "✅" });
        navigate("/");
      } else {
        const err = result.payload;
        const validationErrors = err?.errors;

        if (validationErrors && validationErrors.length > 0) {
          showToast("loginError", validationErrors[0], { icon: "❌" });
        } else {
          showToast("loginError", err?.message || t("loginFailed"), { icon: "❌" });
        }

        if (err?.blockedUntil) {
          localStorage.setItem("blockedUntil", err.blockedUntil);
          startCountdown(Number(err.blockedUntil));
        }
      }
    } catch (err) {
      console.error(err);
      showToast("loginError", t("loginFailed"), { icon: "❌" });
    }
  }, [email, password, countdown, dispatch, navigate, startCountdown, t, showToast]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

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
        direction: i18n.language === "ar" ? "rtl" : "ltr",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: 400 },
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold" color="primary.main">
          MyGram
        </Typography>

        {countdown > 0 && (
          <Typography color="error" mb={2} textAlign="center" variant="body2" fontWeight="600">
            {t("tooManyAttempts")} ({minutes}m {seconds}s)
          </Typography>
        )}

        <TextField
          fullWidth
          label={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} 
        />

        <TextField
          fullWidth
          type="password"
          label={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} 
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={countdown > 0 || !email.trim() || !password}
          sx={{ mt: 1.5, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
        >
          {t("login")}
        </Button>

        <Typography mt={2} textAlign="center" variant="body2" color="text.secondary">
          {t("dontHaveAccount")}{" "}
          <Link to="/register" style={{ color: "#00a8ff", fontWeight: 600, textDecoration: "none" }}>
            {t("register")}
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
}