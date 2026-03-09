import {
  Card, CardHeader, CardContent, CardActions, Avatar,
  Typography, IconButton, Box
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import AddCommentInput from "./AddCommentInput";

export default function ProfilePost({
  post,
  currentUserId,
  toggleLike,
  toggleCommentsVisibility,
  openComments,
  deleteComment,
  addComment,
  openLikesList
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card sx={{ mb: 3 }}>

        <CardHeader
          avatar={<Avatar src={post.userId?.profilePic} />}
          title={post.userId?.name}
          subheader={new Date(post.createdAt).toLocaleString()}
        />

        {/* Media First (Instagram Style) */}
        {post.mediaUrl && post.mediaType === "image" && (
          <img
            src={post.mediaUrl}
            style={{ width: "100%", borderRadius: 10 }}
          />
        )}

        {post.mediaUrl && post.mediaType === "video" && (
          <video controls style={{ width: "100%", borderRadius: 10 }}>
            <source src={post.mediaUrl} />
          </video>
        )}

        <CardContent>
          <Typography>{post.text}</Typography>
        </CardContent>

        <CardActions sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => toggleLike(post._id)}>
            {post.likesUsers?.some(u => u._id === currentUserId)
              ? <FavoriteIcon sx={{ color: "red" }} />
              : <FavoriteBorderIcon />}
          </IconButton>

          {post.likesUsers?.length > 0 && (
            <Typography variant="body2">
              Liked by <strong>{post.likesUsers[0].name}</strong>
              {post.likesUsers.length > 1 && (
                <> and
                  <span
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => openLikesList(post.likesUsers)}
                  >
                    {post.likesUsers.length - 1} others
                  </span>
                </>
              )}
            </Typography>
          )}

          <IconButton onClick={() => toggleCommentsVisibility(post._id)}>
            <ChatBubbleOutlineIcon />
          </IconButton>
        </CardActions>

        {/* Comments */}
        {openComments[post._id] && (
          <Box sx={{ px: 2, pb: 2 }}>
            {post.comments?.map(comment => (
              <Box
                key={comment._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  borderBottom: "1px solid #eee",
                  pb: 1,
                }}
              >
                <Avatar src={comment.user?.profilePic} sx={{ width: 30, height: 30 }} />

                <Typography variant="body2">
                  <strong>{comment.user?.name}</strong>: {comment.text}
                </Typography>

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

      </Card>
    </motion.div>
  );
}
