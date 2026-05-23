

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, TextField, Typography, Paper, Avatar, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { searchUsers } from '../features/users';

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // --- States ---
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Refs ---
  const debounceTimeoutRef = useRef(null);

  const getAvatarUrl = useCallback((profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith("http")) return profilePic;
    return `http://localhost:4000/${profilePic.replace(/^\//, "")}`;
  }, []);

  const executeSearch = useCallback(async (searchText) => {
    const trimmed = searchText.trim();
    if (trimmed === "") {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await searchUsers(trimmed); 
      const finalData = Array.isArray(result) ? result : (result.users || []);
      setUsers(finalData); 
    } catch (err) {
      console.error("Search Error:", err);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setUsers([]);
      setLoading(false);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      return;
    }

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    setLoading(true);
    debounceTimeoutRef.current = setTimeout(() => {
      executeSearch(value);
    }, 4000);
  }, [executeSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 5,
          px: 2,
          direction: i18n.language === "ar" ? "rtl" : "ltr",
        }}
      >
        <TextField
          fullWidth
          label={t("searchUsers")}
          variant="outlined"
          value={query}
          onChange={handleSearchChange} // 👈 الـ Debounced Handler الجديد
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": { borderRadius: 8 },
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  variant="rectangular"
                  height={60}
                  sx={{ borderRadius: 2 }}
                />
              ))
            : users.map((user) => (
                <motion.div
                  key={user._id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { boxShadow: 3, bgcolor: "#fafafa" },
                    }}
                    onClick={() => navigate(`/user/${user._id}`)}
                  >
                    <Avatar 
                      src={getAvatarUrl(user.profilePic)} 
                      sx={{ width: 50, height: 50, bgcolor: "#bdc3c7", fontWeight: "bold" }}
                    >
                      {!user.profilePic && user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Typography variant="body1" fontWeight={600} color="#262626">
                      {user.name}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
        </Box>

        {!loading && users.length === 0 && query.trim() !== "" && (
          <Typography textAlign="center" color="gray" sx={{ mt: 4 }}>
            {t("noUsersFound")}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}