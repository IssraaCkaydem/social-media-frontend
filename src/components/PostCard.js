import React, { useState } from "react";
import { Card, CardHeader, Avatar, CardContent, Typography, CardActions, IconButton, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axiosClient from "../api/axiosClient";
import AddCommentInput from "./AddCommentInput";


export default function PostCard({ post, currentUserId, toggleLike, fetchPosts, openLikesList }) {
  const [openComments, setOpenComments] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editText, setEditText] = useState(post.text);

  const toggleCommentsVisibility = () => setOpenComments(prev => !prev);

  const addComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      await axiosClient.post(`/comments/${postId}/comments`, { text });
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosClient.delete(`/comments/${postId}/comments/${commentId}`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/posts/${post._id}`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenEdit = () => {
    setEditText(post.text);
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => setOpenEditDialog(false);

  const handleSaveEdit = async () => {
    try {
      await axiosClient.put(`/posts/${post._id}`, { text: editText });
      fetchPosts();
      handleCloseEdit();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar src={post.userId?.profilePic}>
            {(!post.userId?.profilePic && post.userId?.name) ? post.userId.name[0] : ""}
          </Avatar>
        }
        title={post.userId?.name || "User"}
        subheader={post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
      />
      <CardContent>
        {post.mediaUrl && post.mediaType === "image" && (
          <img src={post.mediaUrl} alt="post" style={{ width: "100%", borderRadius: 8, marginTop: 10 }} />
        )}
        {post.mediaUrl && post.mediaType === "video" && (
          <video controls style={{ width: "100%", borderRadius: 8, marginTop: 10 }} src={post.mediaUrl} />
        )}
        <Typography sx={{ mt: 1 }}>{post.text}</Typography>
      </CardContent>

      <CardActions sx={{ gap: 1 }}>
        <IconButton onClick={() => toggleLike(post._id)}>
          {post.likesUsers?.some(u => u._id === currentUserId) ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon />}
        </IconButton>

        <Typography variant="body2">
          {post.likesUsers?.length > 0 && (
            <>
              Liked by <strong>{post.likesUsers[0].name}</strong>
              {post.likesUsers.length > 1 && (
                <> and <span onClick={() => openLikesList(post.likesUsers)} style={{ fontWeight: 600, cursor: "pointer" }}>{post.likesUsers.length - 1} others</span></>
              )}
            </>
          )}
        </Typography>

        <IconButton onClick={toggleCommentsVisibility}>
          <ChatBubbleOutlineIcon />
        </IconButton>

        {/* Edit & Delete buttons only for post owner */}
        {post.userId?._id === currentUserId && (
          <>
            <IconButton onClick={handleOpenEdit}><EditIcon /></IconButton>
            <IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
          </>
        )}
      </CardActions>

      {openComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          {post.comments?.map(comment => (
            <Box key={comment._id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, borderBottom: "1px solid #eee", pb: 0.5 }}>
              <Avatar src={comment.user?.profilePic} sx={{ width: 30, height: 30 }} />
              <Typography variant="body2"><strong>{comment.user?.name}</strong>: {comment.text}</Typography>
              {(comment.user?._id === currentUserId || post.userId?._id === currentUserId) && (
                <IconButton size="small" onClick={() => deleteComment(post._id, comment._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
          <AddCommentInput postId={post._id} addComment={addComment} />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEdit}>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
