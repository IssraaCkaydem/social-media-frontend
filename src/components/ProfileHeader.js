import { Box, Typography, Avatar, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function ProfileHeader({ profile, postsCount, handleLogout, isOwner }) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>

        <Avatar
          src={profile.profilePic}
          sx={{ width: 110, height: 110, mx: "auto", mb: 2, border: "3px solid #1976d2" }}
        />

        <Typography variant="h5" fontWeight="bold">{profile.name}</Typography>
        <Typography variant="body1" color="gray" mb={3}>{profile.email}</Typography>

        {/* Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 3, px: 2 }}>
          <Box>
            <Typography variant="h6">{postsCount || 0}</Typography>
            <Typography variant="body2">Posts</Typography>
          </Box>

          <Box sx={{ cursor: "pointer" }} onClick={() => navigate(`/followers/${profile._id}`)}>
            <Typography variant="h6">{profile.followers?.length || 0}</Typography>
            <Typography variant="body2">Followers</Typography>
          </Box>

          <Box sx={{ cursor: "pointer" }} onClick={() => navigate(`/following/${profile._id}`)}>
            <Typography variant="h6">{profile.following?.length || 0}</Typography>
            <Typography variant="body2">Following</Typography>
          </Box>
        </Box>

        {/* ====================
            OWNER ONLY CONTROLS
        ==================== */}
        {isOwner && (
          <Box>
            <Button variant="contained" sx={{ mr: 2 }} onClick={() => navigate("/profile/edit")}>
              Edit Profile
            </Button>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}

      </Box>
    </motion.div>
  );
}
