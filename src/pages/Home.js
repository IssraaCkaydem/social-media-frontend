

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Box, AppBar, Toolbar, IconButton, Typography, CircularProgress, Badge,
  Dialog, Avatar, Button, Drawer, List, ListItem, ListItemAvatar,
  ListItemText, DialogTitle, DialogContent, DialogActions, ListItemButton, Checkbox
} from "@mui/material";
import { motion } from "framer-motion";
import InfiniteScroll from "react-infinite-scroll-component";

// Icons
import {
  Person as PersonIcon, CloudUpload as CloudUploadIcon, Search as SearchIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon, Close as CloseIcon,
  Visibility as VisibilityIcon, Delete as DeleteIcon, Send as SendIcon,
  GroupWork as GroupWorkIcon
} from "@mui/icons-material";

// Redux, Context & Features
import { fetchMe } from "../features/auth";
import { useOnline } from "../Context/OnlineContext";
import { fetchPosts, toggleLike, PostCard, LikesPopup, StoriesBar } from "../features/posts";
import UploadDialog from "../components/UploadDialog";
import LanguageSwitcher from "../components/LanguageSwitcher";

// Utilities
import axiosClient from "../api/axiosClient";
import socket from "../socket";

const formatStoryTime = (createdAt, lang) => {
  const diffInMs = new Date() - new Date(createdAt);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (lang === "ar") {
    if (diffInHours > 0) return `منذ ${diffInHours} ساعة`;
    if (diffInMinutes === 0) return "الآن";
    return `منذ ${diffInMinutes} دقيقة`;
  } else {
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMinutes === 0) return "Just now";
    return `${diffInMinutes}m ago`;
  }
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { onlineUsers } = useOnline(); 
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const posts = useSelector((state) => state.posts.posts || []);

  // --- States ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [isStoryUpload, setIsStoryUpload] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likesUsersPopup, setLikesUsersPopup] = useState([]);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [watchInvite, setWatchInvite] = useState(null);
  const [openViewer, setOpenViewer] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [openViewersDrawer, setOpenViewersDrawer] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPaused, setIsPaused] = useState(false); 
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [storyIdToDelete, setStoryIdToDelete] = useState(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [activePostId, setTargetPostId] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]);

  // --- Refs ---
  const isPausedRef = useRef(isPaused);
  const currentStoryIndexRef = useRef(currentStoryIndex);
  const selectedUserStoriesRef = useRef(selectedUserStories);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentStoryIndexRef.current = currentStoryIndex; }, [currentStoryIndex]);
  useEffect(() => { selectedUserStoriesRef.current = selectedUserStories; }, [selectedUserStories]);

  // ================= DATA FETCHING =================
  const fetchFirstPage = useCallback(async () => {
    try {
      setPostsLoading(true);
      const res = await axiosClient.get(`/posts/all?page=1&limit=5`);
      dispatch({ type: "posts/fetchPosts/fulfilled", payload: res.data.posts || [] });
      setHasMore(res.data.hasMore);
      setPage(2);
    } catch (err) { console.error(err); } finally { setPostsLoading(false); }
  }, [dispatch]);

  const fetchFollowingList = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axiosClient.get(`/follow/${user._id}/following`);
      const data = res.data.map(item => item.following || item);
      setMyFollowing(data);
    } catch (err) { console.error("Error fetching following:", err); }
  }, [user?._id]);

  const fetchHomePosts = useCallback(async () => {
    if (!hasMore) return;
    try {
      const res = await axiosClient.get(`/posts/all?page=${page}&limit=5`);
      dispatch({ type: "posts/fetchPostsMore/fulfilled", payload: res.data.posts || [] });
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) { console.error(err); }
  }, [hasMore, page, dispatch]);

  const loadStories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/stories");
      setStories(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const updateStoryInState = useCallback((updatedStory) => {
    setStories((prev) => prev.map((s) => (s._id === updatedStory._id ? updatedStory : s)));
    setSelectedUserStories((prev) => prev.map((s) => (s._id === updatedStory._id ? updatedStory : s)));
  }, []);

  const fetchTotalBadge = useCallback(async () => {
    try {
      const res = await axiosClient.get("/messages/inbox-badge");
      setInboxBadge(res.data.count || 0);
    } catch (err) { console.error(err); }
  }, []);

  // ================= HANDLERS =================
  const handleOpenInviteList = useCallback((postId) => {
    setTargetPostId(postId);
    setSelectedFriends([]); 
    fetchFollowingList();
    setOpenInviteDialog(true);
  }, [fetchFollowingList]);

  const toggleFriendSelection = useCallback((friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  }, []);

  const confirmGroupWatch = useCallback(() => {
    if (selectedFriends.length === 0 || !user) return;
    const sharedRoomId = `group_${user._id}_${Date.now()}`;
    selectedFriends.forEach((targetId) => {
      socket.emit("sendGroupWatchInvite", {
        senderId: user._id,
        senderName: user.name,
        receiverId: targetId,
        postId: activePostId,
        roomId: sharedRoomId
      });
    });
    setOpenInviteDialog(false);
    navigate(`/group-watch/${activePostId}?roomId=${sharedRoomId}`);
  }, [selectedFriends, user, activePostId, navigate]);

  const handleStoryReply = useCallback(async (content) => {
    const currentStory = selectedUserStoriesRef.current[currentStoryIndexRef.current];
    if (!content.trim() || !currentStory) return;
    try {
      await axiosClient.post("/messages/story-reply", {
        receiverId: currentStory.userId?._id,
        storyId: currentStory._id,
        storySnapshot: currentStory.imageUrl,
        text: content,
        type: "story_reply",
      });
      setReplyText("");
      setOpenViewer(false);
    } catch (err) { console.error(err); }
  }, []);

  const handleNextStory = useCallback(() => {
    if (isPausedRef.current) return; 
    if (currentStoryIndexRef.current < selectedUserStoriesRef.current.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else { setOpenViewer(false); }
  }, []);

  const handlePrevStory = useCallback(() => {
    if (currentStoryIndexRef.current > 0) setCurrentStoryIndex(prev => prev - 1);
  }, []);

  const handleAcceptInvite = useCallback(() => {
    if (watchInvite && user) {
      const { postId, roomId, senderId } = watchInvite;
      socket.emit("acceptGroupWatchInvite", { senderId, receiverId: user._id, postId, roomId });
      navigate(`/group-watch/${postId}?roomId=${roomId}`);
      setWatchInvite(null);
    }
  }, [watchInvite, user, navigate]);

  const confirmDeleteStory = useCallback(async () => {
    if (!storyIdToDelete) return;
    try {
      await axiosClient.delete(`/stories/${storyIdToDelete}`);
      setStories(prev => prev.filter(s => s._id !== storyIdToDelete));
      const updated = selectedUserStoriesRef.current.filter(s => s._id !== storyIdToDelete);
      if (updated.length > 0) {
        setSelectedUserStories([...updated]);
        setCurrentStoryIndex(0);
      } else { setOpenViewer(false); }
      setOpenDeleteConfirm(false);
    } catch (err) { console.error(err); }
  }, [storyIdToDelete]);

  // ================= EFFECTS =================

  useEffect(() => {
    console.log("%c 🔍 System Health Check Connected ", "background: #333; color: #fff; font-size: 14px; padding: 3px");
  }, []);

  useEffect(() => {
    const markAsSeen = async () => {
      if (openViewer && selectedUserStories[currentStoryIndex]) {
        const story = selectedUserStories[currentStoryIndex];
        if (story.userId?._id !== user?._id) {
          try {
            const res = await axiosClient.post(`/stories/seen/${story._id}`);
            updateStoryInState(res.data);
          } catch (err) { console.error(err); }
        }
      }
    };
    markAsSeen();
  }, [currentStoryIndex, openViewer, user?._id, selectedUserStories, updateStoryInState]);

  useEffect(() => {
    if (!user && !authLoading) {
      dispatch(fetchMe());
    }
    fetchFirstPage();
    fetchFollowingList();
  }, [dispatch, fetchFirstPage, fetchFollowingList, user, authLoading]);

  useEffect(() => {
    if (user?._id) {
      loadStories();
      fetchTotalBadge();
    }
  }, [user?._id, loadStories, fetchTotalBadge]);

  useEffect(() => {
    const handleStorySeenSocket = (updatedStory) => updateStoryInState(updatedStory);
    const handleGroupWatchInviteSocket = (data) => setWatchInvite(data);
    const handleNewMessageSocket = () => fetchTotalBadge();
    const handleNewStorySocket = () => loadStories();

    socket.on("storySeen", handleStorySeenSocket);
    socket.on("receiveGroupWatchInvite", handleGroupWatchInviteSocket);
    socket.on("newMessage", handleNewMessageSocket);
    socket.on("newStory", handleNewStorySocket); 

    return () => {
      socket.off("storySeen", handleStorySeenSocket);
      socket.off("receiveGroupWatchInvite", handleGroupWatchInviteSocket);
      socket.off("newMessage", handleNewMessageSocket);
      socket.off("newStory", handleNewStorySocket);
    };
  }, [loadStories, updateStoryInState, fetchTotalBadge]);

  if (authLoading || (postsLoading && posts.length === 0)) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AppBar position="sticky" sx={{ bgcolor: "primary.main", color: "#fff" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton color="inherit" onClick={() => navigate("/profile")}><PersonIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}>{t("mygram")}</Typography>
          <IconButton color="inherit" onClick={() => navigate("/inbox")}>
            <Badge badgeContent={inboxBadge} color="error"><ChatBubbleOutlineIcon /></Badge>
          </IconButton>
          <LanguageSwitcher />
          <IconButton color="inherit" onClick={() => navigate("/search")}><SearchIcon /></IconButton>
          <IconButton color="inherit" onClick={() => { setOpenUpload(true); setIsStoryUpload(false); }}><CloudUploadIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, mx: "auto", mt: 2, px: 1, direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
        <StoriesBar
          stories={stories}
          currentUser={user}
          onlineUsers={onlineUsers}
          onAddStory={() => { setIsStoryUpload(true); setOpenUpload(true); }}
          onOpenStory={(story) => {
            const userStories = stories.filter(s => s.userId?._id === story.userId?._id);
            setSelectedUserStories([...userStories]);
            setCurrentStoryIndex(0);
            setIsPaused(false);
            setOpenViewer(true);
          }}
        />

        <Box sx={{ mt: 3 }}>
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchHomePosts}
            hasMore={hasMore}
            loader={<Box sx={{ textAlign: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
          >
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isOnline={onlineUsers?.includes(post.userId?._id)}
                currentUserId={user?._id}
                currentUser={user}
                toggleLike={(id) => dispatch(toggleLike(id))}
                openLikesList={(users) => { setLikesUsersPopup(users); setShowLikesPopup(true); }}
                onGroupWatch={() => handleOpenInviteList(post._id)}
              />
            ))}
          </InfiniteScroll>
        </Box>
      </Box>

      <Dialog 
        fullScreen 
        open={openViewer} 
        onClose={() => { setOpenViewer(false); setIsPaused(false); }} 
        PaperProps={{ sx: { bgcolor: "#000", color: "#fff" } }}
      >
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", justifyContent: "center" }}>
          <Box sx={{ position: "absolute", top: 10, left: "2%", width: "96%", display: "flex", gap: 0.5, zIndex: 10 }}>
            {selectedUserStories.map((_, index) => (
              <Box key={index} sx={{ flex: 1, height: 3, bgcolor: "rgba(255,255,255,0.2)", borderRadius: 1 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: index < currentStoryIndex ? "100%" : (currentStoryIndex === index && !isPaused) ? "100%" : "0%" 
                  }}
                  transition={{ 
                    duration: (currentStoryIndex === index && !isPaused) ? 5 : 0, 
                    ease: "linear" 
                  }}
                  onAnimationComplete={() => { if (currentStoryIndex === index && !isPaused) handleNextStory(); }}
                  style={{ height: "100%", backgroundColor: "#fff", borderRadius: 1 }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ position: "absolute", top: 30, left: 20, display: "flex", alignItems: "center", gap: 1.5, zIndex: 10 }}>
            <Avatar src={selectedUserStories[currentStoryIndex]?.userId?.profilePic} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{selectedUserStories[currentStoryIndex]?.userId?.name}</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {formatStoryTime(selectedUserStories[currentStoryIndex]?.createdAt, i18n.language)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ position: "absolute", top: 25, right: 15, display: "flex", gap: 1, zIndex: 11 }}>
            {selectedUserStories[currentStoryIndex]?.userId?._id === user?._id && (
              <IconButton onClick={() => { setStoryIdToDelete(selectedUserStories[currentStoryIndex]._id); setOpenDeleteConfirm(true); }} sx={{ color: "#ff4d4d" }}>
                <DeleteIcon />
              </IconButton>
            )}
            <IconButton onClick={() => { setOpenViewer(false); setIsPaused(false); }} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "75%", display: "flex", zIndex: 5 }}>
            <Box onClick={handlePrevStory} sx={{ flex: 1, cursor: "pointer" }} />
            <Box onClick={handleNextStory} sx={{ flex: 2, cursor: "pointer" }} />
          </Box>

          <img src={selectedUserStories[currentStoryIndex]?.imageUrl} alt="Story" style={{ width: "100%", maxHeight: "100vh", objectFit: "contain" }} />

          {selectedUserStories[currentStoryIndex]?.userId?._id !== user?._id ? (
             <Box sx={{ position: "absolute", bottom: 20, width: "100%", px: 2, textAlign: 'center', zIndex: 20 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                    {["❤️", "😂", "🔥"].map(e => <Typography key={e} onClick={() => handleStoryReply(e)} sx={{ cursor: 'pointer', fontSize: '1.5rem' }}>{e}</Typography>)}
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', px: 2 }}>
                    <input 
                      placeholder="Send message..." 
                      style={{ background: 'none', border: 'none', color: '#fff', flex: 1, padding: '10px', outline: 'none' }} 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStoryReply(replyText)}
                    />
                    <IconButton onClick={() => handleStoryReply(replyText)} sx={{ color: '#fff' }}><SendIcon /></IconButton>
                </Box>
             </Box>
          ) : (
            <Box 
              onClick={(e) => { e.stopPropagation(); setIsPaused(true); setOpenViewersDrawer(true); }} 
              sx={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', textAlign: 'center', zIndex: 30 }}
            >
              <VisibilityIcon sx={{ color: '#fff' }} />
              <Typography variant="caption" display="block" color="#fff">{selectedUserStories[currentStoryIndex]?.seenBy?.length || 0} {t("views")}</Typography>
            </Box>
          )}
        </Box>
      </Dialog>

      <Drawer 
        anchor="bottom" 
        open={openViewersDrawer} 
        onClose={() => { setOpenViewersDrawer(false); setIsPaused(false); }} 
        sx={{ zIndex: 2000 }}
        PaperProps={{ sx: { bgcolor: "#1c1c1c", color: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}
      >
         <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t("Viewers")}</Typography>
            <List>
              {selectedUserStories[currentStoryIndex]?.seenBy?.map((v) => (
                <ListItem key={v.userId?._id} disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      setOpenViewersDrawer(false);
                      setIsPaused(false);
                      setTimeout(() => {
                        setOpenViewer(false);
                        navigate(`/user/${v.userId?._id}`);
                      }, 300);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemAvatar><Avatar src={v.userId?.profilePic} /></ListItemAvatar>
                    <ListItemText 
                      primary={v.userId?.name} 
                      secondary={`x${v.count || 1}`} 
                      secondaryTypographyProps={{ color: "gray" }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
         </Box>
      </Drawer>

      <Dialog 
        open={openInviteDialog} 
        onClose={() => setOpenInviteDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '380px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #eee' }}>
          {t("Invite Friends")} 📺
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '400px', p: 0 }}>
          <List>
            {myFollowing
              .filter(friend => onlineUsers?.includes(friend._id)) 
              .map((friend) => (
                <ListItem key={friend._id} disablePadding>
                  <ListItemButton onClick={() => toggleFriendSelection(friend._id)} sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar src={friend.profilePic} sx={{ border: '2px solid #4caf50' }}>
                        {friend.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.name} 
                      secondary="Online Now" 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <Checkbox checked={selectedFriends.includes(friend._id)} color="primary" />
                  </ListItemButton>
                </ListItem>
              ))
            }

            {myFollowing.filter(friend => onlineUsers?.includes(friend._id)).length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {t("No following friends are online right now")}
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
          <Button onClick={() => setOpenInviteDialog(false)} color="inherit">{t("cancel")}</Button>
          <Button 
            onClick={confirmGroupWatch} 
            variant="contained" 
            disabled={selectedFriends.length === 0}
            sx={{ borderRadius: 5, px: 4, fontWeight: 'bold' }}
          >
            {t("Confirm")} ({selectedFriends.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" fontWeight="bold">{t("Delete Story?")}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 3, gap: 1 }}>
            <Button onClick={confirmDeleteStory} variant="contained" color="error" fullWidth>{t("Delete")}</Button>
            <Button onClick={() => setOpenDeleteConfirm(false)} fullWidth>{t("Cancel")}</Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={Boolean(watchInvite)} onClose={() => setWatchInvite(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupWorkIcon color="primary" /> {t("Group Watch Invite")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {i18n.language === 'ar' 
              ? `صديقك ${watchInvite?.senderName} يريد مشاهدة منشور معك. هل تود الانضمام؟`
              : `Your friend ${watchInvite?.senderName} wants to watch a post with you. Join now?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWatchInvite(null)}>{t("cancel")}</Button>
          <Button onClick={handleAcceptInvite} variant="contained" autoFocus>{t("accept")}</Button>
        </DialogActions>
      </Dialog>

      <UploadDialog open={openUpload} isStory={isStoryUpload} onClose={() => { setOpenUpload(false); loadStories(); fetchFirstPage(); }} />
      <LikesPopup open={showLikesPopup} users={likesUsersPopup} onClose={() => setShowLikesPopup(false)} />
      
    </motion.div>
  );
}