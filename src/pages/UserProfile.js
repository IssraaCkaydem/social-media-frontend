<<<<<<< HEAD

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

import ProfileHeader from "../components/ProfileHeader";
import PostCard from "../components/PostCard";
import LikesPopup from "../components/LikesPopup";

<<<<<<< HEAD
export default function UserProfile({ setUser }) {
  const { id } = useParams(); // id تبع الشخص اللي عم شوف بروفايلو
=======

export default function UserProfile({ setUser }) {
  const { id } = useParams();
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likesUsersPopup, setLikesUsersPopup] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
<<<<<<< HEAD
        // 1️⃣ user profile
        const resUser = await axiosClient.get(`/users2/${id}`);
        setProfile(resUser.data.user);

        // 2️⃣ posts
        const resPosts = await axiosClient.get(`/posts/profile/${id}`);
        setPosts(resPosts.data);

        // 3️⃣ current logged user
        const resMe = await axiosClient.get("/users/me");
        setCurrentUserId(resMe.data._id);

        // 4️⃣ follow state
        setIsFollowing(
          resUser.data.user.followers.includes(resMe.data._id)
        );
      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    };

    fetchData();
  }, [id]);

  // ===== FOLLOW / UNFOLLOW =====
  const handleFollow = async () => {
    await axiosClient.post(`/follow/follow/${id}`);
    setIsFollowing(true);
    setProfile(prev => ({
      ...prev,
      followers: [...prev.followers, currentUserId],
    }));
  };

  const handleUnfollow = async () => {
    await axiosClient.delete(`/follow/unfollow/${id}`);
    setIsFollowing(false);
    setProfile(prev => ({
      ...prev,
      followers: prev.followers.filter(uid => uid !== currentUserId),
    }));
  };

  // ===== MESSAGE (Instagram style) =====
  const handleMessage = () => {
    // دايمًا نروح عالشات مع الشخص التاني
    navigate(`/messages/${profile._id}`);
  };

=======
        const resUser = await axiosClient.get(`/users2/${id}`);
        setProfile(resUser.data.user);

        const resPosts = await axiosClient.get(`/posts/profile/${id}`);
        setPosts(resPosts.data);

        const resCurrent = await axiosClient.get("/users/me");
        setCurrentUserId(resCurrent.data._id);

        // CHECK IF I FOLLOW THIS USER
        setIsFollowing(resUser.data.user.followers.includes(resCurrent.data._id));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [id]);


  // FOLLOW USER
  const handleFollow = async () => {
    try {
      await axiosClient.post(`/follow/follow/${id}`);
      setIsFollowing(true);

      // Immediately update follower count
      setProfile(prev => ({
        ...prev,
        followers: [...prev.followers, currentUserId]
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // UNFOLLOW USER
  const handleUnfollow = async () => {
    try {
      await axiosClient.delete(`/follow/unfollow/${id}`);
      setIsFollowing(false);

      // update followers count instantly
      setProfile(prev => ({
        ...prev,
        followers: prev.followers.filter(uid => uid !== currentUserId)
      }));
    } catch (err) {
      console.log(err);
    }
  };


  // LIKE POPUP
  const openLikesList = (likesUsers) => {
    setLikesUsersPopup(likesUsers);
    setShowLikesPopup(true);
  };


>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
  const handleLogout = async () => {
    await axiosClient.post("/auth/logout");
    setUser(false);
    navigate("/login");
  };

  if (!profile) {
    return <Typography textAlign="center" mt={5}>Loading...</Typography>;
  }

  const isOwner = currentUserId === profile._id;

  return (
<<<<<<< HEAD
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>
=======
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, px: 2 }}>

        {/* ===========================
            PROFILE HEADER
        ============================ */}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        <ProfileHeader
          profile={profile}
          postsCount={posts.length}
          handleLogout={handleLogout}
          isOwner={isOwner}
        />

<<<<<<< HEAD
        {/* 🔥 أزرار Follow + Message (بس لغير صاحب الحساب) */}
        {!isOwner && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {isFollowing ? (
              <Button variant="outlined" color="error" onClick={handleUnfollow}>
                Unfollow
              </Button>
            ) : (
              <Button variant="contained" onClick={handleFollow}>
                Follow
              </Button>
            )}

            <Button
              variant="outlined"
              color="primary"
              onClick={handleMessage}
            >
              Message
            </Button>
          </Box>
        )}

        {/* POSTS */}
        {posts.length === 0 && (
          <Typography textAlign="center" mt={3}>
            No posts yet
          </Typography>
=======
        {/* ===========================
            FOLLOW / UNFOLLOW BUTTON
        ============================ */}
        {!isOwner && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            {isFollowing ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleUnfollow}
              >
                Unfollow
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFollow}
              >
                Follow
              </Button>
            )}
          </Box>
        )}

        {posts.length === 0 && (
          <Typography textAlign="center" mt={3}>No posts yet</Typography>
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        )}

        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
<<<<<<< HEAD
            openLikesList={setLikesUsersPopup}
          />
        ))}
=======
            toggleLike={(id) => console.log("like", id)}
            openLikesList={openLikesList}
            addComment={() => {}}
            deleteComment={() => {}}
          />
        ))}

>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
      </Box>

      {showLikesPopup && (
        <LikesPopup
          users={likesUsersPopup}
          onClose={() => setShowLikesPopup(false)}
        />
      )}
    </motion.div>
  );
}
