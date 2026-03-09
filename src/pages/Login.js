
<<<<<<< HEAD

import { useState, useEffect } from "react";
=======
// src/pages/Login.jsx
import { useState } from "react";
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";
import axiosClient from "../api/axiosClient";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [countdown, setCountdown] = useState(0);

  // 🔎 Helper: start countdown
  const startCountdown = (blockedUntil) => {
    const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
    if (remaining <= 0) return;

    setCountdown(remaining);
    setError("Too many login attempts");

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("");
          localStorage.removeItem("blockedUntil");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🔎 Check if account blocked when email changes or page loads
  useEffect(() => {
    const blockedUntilLS = localStorage.getItem("blockedUntil");
    if (blockedUntilLS) {
      startCountdown(Number(blockedUntilLS));
    }

    if (!email) return;

    const checkBlock = async () => {
      try {
        const res = await axiosClient.get(`/auth/check-block/${email}`, {
          withCredentials: true,
        });
        if (res.data.blockedUntil) {
          localStorage.setItem("blockedUntil", res.data.blockedUntil);
          startCountdown(Number(res.data.blockedUntil));
        }
      } catch (err) {
        console.log("Block check error", err);
      }
    };

    checkBlock();
  }, [email]);

  // 🔐 Handle login request
  const handleLogin = async () => {
    setError("");
    try {
      await axiosClient.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(true);
      navigate("/");
    }
   catch (err) {

  const validationErrors = err.response?.data?.errors;

  if (validationErrors && validationErrors.length > 0) {
    setError(validationErrors[0]); // show validation message
  } else {
    const message = err.response?.data?.message || "Login failed";
    setError(message);
  }

  if (err.response?.data?.blockedUntil) {
    localStorage.setItem("blockedUntil", err.response.data.blockedUntil);
    startCountdown(Number(err.response.data.blockedUntil));
  }
}
  };

  // 🕒 convert seconds to minutes + seconds
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

=======

  const handleLogin = async () => {
    try {
      await axiosClient.post("/auth/login", { email, password });
      setUser(true);
      navigate("/"); // Redirect to Home
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
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
        }}
      >
<<<<<<< HEAD
        <Typography variant="h4" mb={3} textAlign="center">
=======
        <Typography
          variant="h4"
          mb={3}
          textAlign="center"
          color="text.primary"
        >
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
          MyGram
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
<<<<<<< HEAD
            {error} {countdown > 0 && `(${minutes}m ${seconds}s)`}
=======
            {error}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
          </Typography>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
          sx={{ mb: 2 }}
=======
          variant="outlined"
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
          sx={{ mb: 2 }}
=======
          variant="outlined"
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        />

        <Button
          fullWidth
          variant="contained"
<<<<<<< HEAD
          onClick={handleLogin}
          disabled={countdown > 0}
          sx={{ mt: 1.5, py: 1.5 }}
=======
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2, py: 1.5 }}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        >
          Login
        </Button>

<<<<<<< HEAD
        <Typography mt={2} textAlign="center">
=======
        <Typography mt={2} textAlign="center" color="text.secondary">
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#00a8ff", fontWeight: 500 }}>
            Register
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
