
import React, { useMemo, useCallback, memo } from "react";
import {
  Card, CardHeader, CardContent, CardActions, Avatar,
  Typography, IconButton, Box
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toggleLike, addComment, deleteComment } from "../../posts/postsSlice";
import AddCommentInput from '../../posts/components/AddCommentInput';
import { useTranslation } from "react-i18next";
import { useToast } from "../../../toast/ToastContext";
import dayjs from "dayjs";
import "../../../i18n";

const ProfilePost = memo(({
  post,
  currentUserId,
  toggleCommentsVisibility,
  openComments,
  openLikesList
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isRtl = i18n.language === "ar";
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const resolveUrl = useCallback((path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SERVER_URL}/${path.replace(/^\//, "")}`;
  }, [SERVER_URL]);

  const likesUsers = useMemo(() => post.likesUsers || [], [post.likesUsers]);

  const isLiked = useMemo(() => {
    return likesUsers.some(u => (u._id || u) === currentUserId);
  }, [likesUsers, currentUserId]);

  const formattedDate = useMemo(() => {
    return dayjs(post.createdAt).format("YYYY-MM-DD hh:mm A");
  }, [post.createdAt]);

  const goToUserProfile = useCallback((targetId) => {
    if (!targetId) return;
    const targetPath = targetId === currentUserId ? "/profile" : `/user/${targetId}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [currentUserId, location.pathname, navigate]);

  const handleLike = useCallback(async () => {
    try {
      await dispatch(toggleLike(post._id)).unwrap();
    } catch {
      showToast("failedToggleLike", t("failedToggleLike"), { icon: "❌" });
    }
  }, [dispatch, post._id, showToast, t]);

  const handleAddComment = useCallback(async (text) => {
    try {
      await dispatch(addComment({ postId: post._id, text })).unwrap();
    } catch {
      showToast("failedAddComment", t("failedAddComment"), { icon: "❌" });
    }
  }, [dispatch, post._id, showToast, t]);

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await dispatch(deleteComment({ postId: post._id, commentId })).unwrap();
    } catch {
      showToast("failedDeleteComment", t("failedDeleteComment"), { icon: "❌" });
    }
  }, [dispatch, post._id, showToast, t]);

  const handleOpenLikesClick = useCallback(() => {
    openLikesList?.(likesUsers);
  }, [openLikesList, likesUsers]);

  const handleFirstLikerClick = useCallback(() => {
    if (likesUsers[0]) {
      goToUserProfile(likesUsers[0]._id || likesUsers[0]);
    }
  }, [likesUsers, goToUserProfile]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Card sx={{ mb: 3, borderRadius: 3, direction: isRtl ? "rtl" : "ltr", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

        <CardHeader
          sx={{ 
            cursor: "pointer",
            "&:hover": { opacity: 0.85 }
          }}
          onClick={() => goToUserProfile(post.userId?._id)}
          avatar={<Avatar src={resolveUrl(post.userId?.profilePic)} />}
          title={<Typography fontWeight="bold" variant="subtitle2">{post.userId?.name}</Typography>}
          subheader={formattedDate}
        />

        {post.mediaUrl && post.mediaType === "image" && (
          <Box sx={{ p: 1 }}>
            <img
              src={resolveUrl(post.mediaUrl)}
              alt="post"
              style={{ width: "100%", borderRadius: 8, display: "block", maxHeight: "450px", objectFit: "cover" }}
            />
          </Box>
        )}

        {post.mediaUrl && post.mediaType === "video" && (
          <Box sx={{ p: 1 }}>
            <video controls style={{ width: "100%", borderRadius: 8, maxHeight: "450px", backgroundColor: "#000" }}>
              <source src={resolveUrl(post.mediaUrl)} />
            </video>
          </Box>
        )}

        <CardContent sx={{ py: 1 }}>
          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
            {post.text}
          </Typography>
        </CardContent>

        <CardActions sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pb: 1.5 }}>
          <IconButton onClick={handleLike} aria-label="like">
            {isLiked ? <FavoriteIcon sx={{ color: "error.main" }} /> : <FavoriteBorderIcon />}
          </IconButton>

          {likesUsers.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("likedBy")}{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", cursor: "pointer", color: "text.primary", "&:hover": { textDecoration: "underline" } }}
                onClick={handleFirstLikerClick}
              >
                {likesUsers[0].name || t("someone")}
              </Box>

              {likesUsers.length > 1 && (
                <>
                  {` ${t("and")} `}
                  <Box
                    component="span"
                    sx={{ fontWeight: "bold", cursor: "pointer", color: "text.primary", "&:hover": { textDecoration: "underline" } }}
                    onClick={handleOpenLikesClick}
                  >
                    {likesUsers.length - 1} {t("others")}
                  </Box>
                </>
              )}
            </Typography>
          )}

          <IconButton onClick={() => toggleCommentsVisibility?.(post._id)} aria-label="comments">
            <ChatBubbleOutlineIcon />
          </IconButton>
        </CardActions>

        {openComments[post._id] && (
          <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: "1px solid #f9f9f9" }}>
            {post.comments?.map(comment => (
              <Box
                key={comment._id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  mb: 1.5,
                  bgcolor: "#fcfcfc",
                  p: 1,
                  borderRadius: 2
                }}
              >
                <Avatar
                  src={resolveUrl(comment.user?.profilePic)}
                  sx={{ width: 28, height: 28, cursor: "pointer", mt: 0.5 }}
                  onClick={() => goToUserProfile(comment.user?._id)}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="caption" 
                    fontWeight="bold" 
                    sx={{ cursor: "pointer", display: "block", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => goToUserProfile(comment.user?._id)}
                  >
                    {comment.user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ wordBreak: "break-word" }}>
                    {comment.text}
                  </Typography>
                </Box>

                {(comment.user?._id === currentUserId || post.userId?._id === currentUserId) && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment._id)}
                    sx={{ alignSelf: "center" }}
                    aria-label="delete comment"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            <AddCommentInput onAdd={handleAddComment} />
          </Box>
        )}

      </Card>
    </motion.div>
  );
});

ProfilePost.displayName = "ProfilePost";

export default ProfilePost;