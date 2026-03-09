import React, { useState } from "react";
import { Box, TextField, Typography, Paper, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosClient from "../api/axiosClient";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setUsers([]);
      return;
    }

    try {
      const res = await axiosClient.get(`/users2/search?name=${value}`);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>
        <TextField
          fullWidth
          label="Search users..."
          variant="outlined"
          value={query}
          onChange={handleSearch}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {users.map(user => (
            <motion.div
              key={user._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Paper
                elevation={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate(`/user/${user._id}`)}
              >
                <Avatar src={user.profilePic} sx={{ width: 50, height: 50 }} />
                <Typography variant="body1" fontWeight={500}>
                  {user.name}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>

        {users.length === 0 && query.trim() !== "" && (
          <Typography textAlign="center" color="gray" sx={{ mt: 4 }}>
            No users found
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}
