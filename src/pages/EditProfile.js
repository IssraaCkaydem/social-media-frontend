import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";

export default function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient.get("/users/me")
      .then(res => {
        setName(res.data.name);
        setEmail(res.data.email);
        setProfilePic(res.data.profilePic || null);
      })
      .catch(err => console.log(err));
  }, []);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (profilePic instanceof File) formData.append("profilePic", profilePic);

      await axiosClient.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/profile"); 
    } catch (err) {
      setError(err.response?.data?.msg || "Update failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ maxWidth: 500, mx: "auto", mt: 10 }}>
        <Typography variant="h5" mb={2}>Edit Profile</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField 
          fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} margin="normal" 
        />
        <TextField 
          fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" 
        />
        <Button
          variant="contained"
          component="label"
          sx={{ mt: 2 }}
        >
          Upload Profile Picture
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={e => setProfilePic(e.target.files[0])}
          />
        </Button>
        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}
