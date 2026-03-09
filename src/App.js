<<<<<<< HEAD

// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material"; 
import axiosClient from "./api/axiosClient";

import theme from "./theme"; 
=======
/*
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "./api/axiosClient";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchPage from "./pages/SearchPage"
import UserProfile from "./pages/UserProfile"
import FollowersPage  from "./pages/FollowersPage"
import FollowingPage from "./pages/FollowingPage"
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/auth/check")
      .then(res => setUser(res.data.authenticated))
      .catch(() => setUser(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />

        <Route path="/profile" element={user ? <Profile setUser={setUser} /> : <Navigate to="/login" />} />
<Route path="/profile/edit" element={user ? <EditProfile setUser={setUser} /> : <Navigate to="/login" />} />
<Route path="/search" element={<SearchPage />} />
<Route path="/user/:id" element={<UserProfile />} />
<Route path="/followers/:id" element={<FollowersPage />} />
<Route path="/following/:id" element={<FollowingPage />} />

      </Routes>
    </Router>
  );
}

export default App;
*/
// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material"; // استيراد ThemeProvider
import axiosClient from "./api/axiosClient";

import theme from "./theme"; // استيراد theme.js
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchPage from "./pages/SearchPage";
import UserProfile from "./pages/UserProfile";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
<<<<<<< HEAD
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    const checkAuth = async () => {
      try {
        // أولاً: تحقق من accessToken
        let res = await axiosClient.get("/auth/check");

        if (res.data.authenticated) {
          setUser(true);
        } else if (res.data.needRefresh) {
          // إذا انتهت صلاحية accessToken → نجددها
          await axiosClient.post("/auth/refresh");

          // نتحقق مرة ثانية بعد التجديد
          res = await axiosClient.get("/auth/check");
          if (res.data.authenticated) {
            setUser(true);
          } else {
            setUser(false);
          }
        } else {
          setUser(false);
        }
      } catch (err) {
        setUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
=======
    axiosClient.get("/auth/check")
      .then(res => setUser(res.data.authenticated))
      .catch(() => setUser(false))
      .finally(() => setLoading(false));
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
<<<<<<< HEAD
    <ThemeProvider theme={theme}> 
      <CssBaseline /> 
=======
    <ThemeProvider theme={theme}> {/* غلف المشروع بالThemeProvider */}
      <CssBaseline /> {/* يضيف reset للـ CSS ويطبق الـ theme */}
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
      <Router>
        <Routes>
          <Route path="/" element={user ? <Home setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/profile/edit" element={user ? <EditProfile setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/followers/:id" element={<FollowersPage />} />
          <Route path="/following/:id" element={<FollowingPage />} />
<<<<<<< HEAD
           <Route path="/messages/:id" element={<Chat />} />


  <Route path="/inbox" element={<Inbox />} /> 


=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
<<<<<<< HEAD

=======
>>>>>>> 487d287d610ecf32cf17e5481b47ab57ccc35bde
