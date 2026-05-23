



import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress } from "@mui/material";

import theme from "./theme";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchPage from "./pages/SearchPage";
import UserProfile from "./pages/UserProfile";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage"; 
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import GroupWatchScreen from "./pages/GroupWatchScreen"; 

import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./features/auth/authSlice";

import { ToastProvider } from "./toast/ToastContext";
import { Toaster } from "react-hot-toast";
import { OnlineProvider, useOnline } from "./Context/OnlineContext"; 

function WatchInviteListener({ user }) {
  const { socket } = useOnline(); 
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    
    socket.on("receiveGroupWatchInvite", (data) => {
      console.log("📥 [WatchInvite] Received Invite:", data);
      setInvite(data);
    });

    socket.on("inviteAccepted", ({ roomId, postId }) => {
      console.log("✅ [WatchInvite] Invite Accepted, moving to room:", roomId);
      navigate(`/group-watch/${postId}?roomId=${roomId}`);
    });

    return () => {
      socket.off("receiveGroupWatchInvite");
      socket.off("inviteAccepted");
    };
  }, [socket, navigate]);

  const handleAccept = () => {
    if (socket && invite) {
      socket.emit("acceptGroupWatchInvite", {
        senderId: invite.senderId,
        receiverId: user._id,
        postId: invite.postId,
        roomId: invite.roomId
      });
      navigate(`/group-watch/${invite.postId}?roomId=${invite.roomId}`);
      setInvite(null);
    }
  };

  const handleReject = () => setInvite(null);

  return (
    <Dialog open={Boolean(invite)} onClose={handleReject}>
      <DialogTitle sx={{ fontWeight: "bold" }}>🔔 دعوة مشاهدة مشتركة</DialogTitle>
      <DialogContent>
        <Typography>قام <strong>{invite?.senderName}</strong> بدعوتك لمشاهدة منشور معه!</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReject} color="inherit">رفض</Button>
        <Button onClick={handleAccept} variant="contained" color="primary">قبول ودخول</Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      console.log("📡 [App] Booting: Checking Authentication...");
      await dispatch(fetchMe());
      setIsInitialized(true);
      console.log("✅ [App] Authentication Check Finished.");
    };

    initializeApp();
  }, [dispatch]);

  if (!isInitialized || isLoading) {
    console.log("⏳ [App Guard] Loading State Active...");
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f0f2f5' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("🔍 [CHECK] User State:", user, " | Loading:", isLoading, " | Initialized:", isInitialized);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Toaster position="top-right" />
        <OnlineProvider user={user}>
          {console.log("🌐 [App] Rendering Router with User:", user?._id)}
          <Router>
            {user && <WatchInviteListener user={user} />}
            
            <Routes>
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
              
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/profile/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
              <Route path="/user/:id" element={user ? <UserProfile /> : <Navigate to="/login" />} />
              <Route path="/followers/:id" element={user ? <FollowersPage /> : <Navigate to="/login" />} />
              <Route path="/following/:id" element={user ? <FollowingPage /> : <Navigate to="/login" />} />
              
              <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/login" />} />
              <Route path="/inbox" element={user ? <Inbox /> : <Navigate to="/login" />} />
              <Route path="/messages/:id" element={user ? <Chat /> : <Navigate to="/login" />} />
              
              <Route path="/group-watch/:postId" element={user ? <GroupWatchScreen /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
            </Routes>
          </Router>
        </OnlineProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;