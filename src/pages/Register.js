
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";
import axiosClient from "../api/axiosClient";

export default function Register({ setUser }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
<<<<<<< HEAD
  try {
    await axiosClient.post("/auth/register", { name, email, password });
    setUser(true);
    navigate("/"); // Redirect to Home
  } catch (err) {
    // أقرأ أولاً رسائل الـ validation
    const validationErrors = err.response?.data?.errors;
    if (validationErrors && validationErrors.length > 0) {
      setError(validationErrors.join(", ")); // كل الرسائل معاً
    } else {
      // رسائل أخرى من backend
      setError(err.response?.data?.message || "Registration failed");
    }
  }
};
=======
    try {
      await axiosClient.post("/auth/register", { name, email, password });
      setUser(true);
      navigate("/"); // Redirect to Home
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
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
        <Typography
          variant="h4"
          mb={3}
          textAlign="center"
          color="text.primary"
        >
          MyGram
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleRegister}
          sx={{ mt: 2, py: 1.5 }}
        >
          Register
        </Button>

        <Typography mt={2} textAlign="center" color="text.secondary">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00a8ff", fontWeight: 500 }}>
            Login
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
}
