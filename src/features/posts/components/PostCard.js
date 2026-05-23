
import React, { useState, useCallback, memo, useMemo } from "react";
import {
  Card, CardHeader, Avatar, CardContent, Typography,
  CardActions, IconButton, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Badge, TextField
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConnectedTvIcon from "@mui/icons-material/ConnectedTv";

import { useDispatch, useSelector } from "react-redux";
import { toggleLike, addComment, deleteComment, deletePost, updatePost } from "../postsSlice";

import AddCommentInput from "./AddCommentInput";
import LikesPopup from "./LikesPopup"; 
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useOnline } from "../../../Context/OnlineContext";
import dayjs from "dayjs";

const PostCard = memo(({ post, currentUserId, currentUser, onGroupWatch }) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = useSelector((state) => state.auth?.user); 
  const activeUser = currentUser || authUser;
  
  const { onlineUsers } = useOnline();

  const [openComments, setOpenComments] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [openLikes, setOpenLikes] = useState(false);

  const isRtl = i18n.language === "ar";
  const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const resolveUrl = useCallback((path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${SERVER_URL}/${path.replace(/^\//, "")}`;
  }, [SERVER_URL]);

  const isPostOwnerOnline = useMemo(() => {
    return onlineUsers.includes(post.userId?._id);
  }, [onlineUsers, post.userId?._id]);

  const likes = useMemo(() => post.likesUsers || post.likes || [], [post.likesUsers, post.likes]);
  
  const isLiked = useMemo(() => {
    return likes.some(u => (u._id || u) === currentUserId);
  }, [likes, currentUserId]);

  const handleProfileClick = useCallback(() => {
    const path = location.pathname;
    if (path === "/profile" || path === `/user/${post.userId?._id}`) return;
    
    if (post.userId?._id === activeUser?._id) {
      navigate("/profile");
    } else {
      navigate(`/user/${post.userId?._id}`);
    }
  }, [location.pathname, post.userId?._id, activeUser?._id, navigate]);

  const toggleCommentsVisibility = useCallback(() => setOpenComments(prev => !prev), []);
  const handleCloseLikes = useCallback(() => setOpenLikes(false), []);
  const handleCloseEdit = useCallback(() => setOpenEditDialog(false), []);

  const handleLike = useCallback(async () => {
    try {
      await dispatch(toggleLike(post._id)).unwrap();
    } catch (err) { console.error("Error in handleLike:", err); }
  }, [dispatch, post._id]);

  const handleAddComment = useCallback(async (text) => {
    try {
      await dispatch(addComment({ postId: post._id, text })).unwrap();
    } catch (err) { console.error(err); }
  }, [dispatch, post._id]);

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await dispatch(deleteComment({ postId: post._id, commentId })).unwrap();
    } catch (err) { console.error(err); }
  }, [dispatch, post._id]);

  const handleDelete = useCallback(async () => {
    if (window.confirm(t("confirmDeletePost") || "Are you sure?")) {
      try {
        await dispatch(deletePost(post._id)).unwrap();
      } catch (err) { console.error(err); }
    }
  }, [dispatch, post._id, t]);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim()) return;
    try {
      await dispatch(updatePost({ postId: post._id, text: editText })).unwrap();
      setOpenEditDialog(false);
    } catch (err) { console.error(err); }
  }, [dispatch, post._id, editText]);

  const handleFirstLikerClick = useCallback(() => {
    const firstLikerId = likes[0]._id || likes[0];
    if (firstLikerId === activeUser?._id) navigate("/profile");
    else navigate(`/user/${firstLikerId}`);
  }, [likes, activeUser?._id, navigate]);

  const formattedDate = useMemo(() => {
    return dayjs(post.createdAt).format("YYYY-MM-DD hh:mm A");
  }, [post.createdAt]);

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <CardHeader
        sx={{ 
          cursor: (location.pathname === "/profile" || location.pathname === `/user/${post.userId?._id}`) ? "default" : "pointer", 
          "&:hover": { opacity: (location.pathname === "/profile" || location.pathname === `/user/${post.userId?._id}`) ? 1 : 0.8 },
          direction: isRtl ? "rtl" : "ltr"
        }}
        onClick={handleProfileClick}
        avatar={
          <Badge
            overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot"
            sx={{ 
              "& .MuiBadge-badge": { 
                backgroundColor: isPostOwnerOnline ? "#44b700" : "transparent", 
                width: 11, 
                height: 11, 
                borderRadius: "50%",
                boxShadow: isPostOwnerOnline ? "0 0 0 2px #fff" : "none"
              } 
            }}
          >
            <Avatar src={resolveUrl(post.userId?.profilePic)} />
          </Badge>
        }
        title={<Typography variant="subtitle1" fontWeight="bold">{post.userId?.name}</Typography>}
        subheader={formattedDate}
      />

      {post.mediaUrl && (
        <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#f9f9f9" }}>
          <img src={resolveUrl(post.mediaUrl)} alt="post" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
        </Box>
      )}
      
      <CardContent sx={{ py: 1.5, direction: isRtl ? "rtl" : "ltr" }}>
        <Typography variant="body1" sx={{ mb: 1, color: "text.primary", whiteSpace: "pre-wrap" }}>
          {post.text}
        </Typography>

        {likes.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("Liked by")}{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", cursor: "pointer", color: "text.primary", "&:hover": { textDecoration: "underline" } }}
                onClick={handleFirstLikerClick}
              >
                {likes[0]?.name || t("someone")}
              </Box>
              
              {likes.length > 1 && (
                <>
                  {" "}{t("and")}{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: "bold", cursor: "pointer", color: "text.primary", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => setOpenLikes(true)}
                  >
                    {likes.length - 1} {likes.length - 1 === 1 ? t("other") : t("others")}
                  </Box>
                </>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 1, direction: isRtl ? "rtl" : "ltr" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleLike} aria-label="like">
            {isLiked ? <FavoriteIcon sx={{ color: "error.main" }} /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton onClick={toggleCommentsVisibility} aria-label="comments">
            <ChatBubbleOutlineIcon />
          </IconButton>
          
          <IconButton onClick={() => onGroupWatch?.(post._id)} aria-label="group watch">
            <ConnectedTvIcon sx={{ color: "primary.main" }} />
          </IconButton>
        </Box>

        {post.userId?._id === activeUser?._id && (
          <Box>
            <IconButton onClick={() => setOpenEditDialog(true)} aria-label="edit"><EditIcon /></IconButton>
            <IconButton onClick={handleDelete} aria-label="delete"><DeleteIcon /></IconButton>
          </Box>
        )}
      </CardActions>

      <LikesPopup open={openLikes} users={likes} onClose={handleCloseLikes} />

      {openComments && (
        <Box sx={{ px: 2, pb: 2, borderTop: "1px solid #f5f5f5", pt: 1, direction: isRtl ? "rtl" : "ltr" }}>
          {post.comments?.map(c => (
            <Box key={c._id} sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "flex-start" }}>
              <Avatar src={resolveUrl(c.user?.profilePic)} sx={{ width: 28, height: 28, mt: 0.5 }} />
              <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 1, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="bold" display="block">{c.user?.name}</Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{c.text}</Typography>
              </Box>
              {(c.user?._id === activeUser?._id || post.userId?._id === activeUser?._id) && (
                <IconButton size="small" onClick={() => handleDeleteComment(c._id)} sx={{ alignSelf: "center" }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
          <AddCommentInput onAdd={handleAddComment} />
        </Box>
      )}

      <Dialog open={openEditDialog} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>{t("editPost") || "Edit Post"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            slotProps={{
              htmlInput: {
                style: { direction: isRtl ? "rtl" : "ltr" }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>{t("cancel") || "Cancel"}</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editText.trim()}>
            {t("save") || "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  ); 
});

PostCard.displayName = "PostCard";

export default PostCard;