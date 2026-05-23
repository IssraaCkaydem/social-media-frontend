

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Box, Typography, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useToast } from "../toast/ToastContext";
import "../i18n";

import { getFollowers } from "../features/users";

export default function FollowersPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getFollowers(id);
      setFollowers(res || []);
    } catch (err) {
      console.error(err);
      showToast("failedLoadFollowers", t("failedLoadFollowers"), {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          padding: "12px 20px",
        },
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [id, t, showToast]); 
  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]); 
  return (
    <Box sx={{ padding: 2, direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("followers")}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : followers.length === 0 ? (
        <Typography textAlign="center" color="gray">
          {t("noFollowersYet")}
        </Typography>
      ) : (
        followers.map((u) => (
          <Box
            key={u._id}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              cursor: "pointer",
            }}
            onClick={() => navigate(`/user/${u._id}`)}
          >
            <Avatar
              src={u.profilePic}
              sx={{
                mr: i18n.language === "ar" ? 0 : 2,
                ml: i18n.language === "ar" ? 2 : 0,
              }}
            />
            <Typography>{u.name}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
}