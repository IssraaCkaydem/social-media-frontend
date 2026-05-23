
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";


// ================= FETCH ALL POSTS =================
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkAPI) => {
    try {
      const res = await axiosClient.get("/posts/all");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Fetch posts failed");
    }
  }
);


// ================= FETCH USER POSTS =================
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosClient.get(`/posts/profile/${userId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Fetch user posts failed");
    }
  }
);


// ================= CREATE POST =================
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (data, thunkAPI) => {
    try {
      const res = await axiosClient.post("/posts", data);
      return res.data.post; // 🔥 IMPORTANT FIX
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Create post failed");
    }
  }
);


// ================= TOGGLE LIKE =================

export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, thunkAPI) => {
    try {
      const res = await axiosClient.put(`/posts/${postId}/like`);
      return {
        postId,
        likesUsers: res.data.likesUsers || [],
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Like failed");
    }
  }
);


export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, thunkAPI) => {
    try {
      console.log("🚀 ADD COMMENT REQUEST:", { postId, text });

      const res = await axiosClient.post(
        `/comments/${postId}/comments`,
        { text }
      );

      console.log("✅ ADD COMMENT SUCCESS:", res.data);

     return {
        postId,
        comments: res.data.comments || [],
      };
    } catch (err) {
      console.log("❌ ADD COMMENT ERROR STATUS:", err.response?.status);
      console.log("❌ ADD COMMENT ERROR DATA:", err.response?.data);
      console.log("❌ FULL ERROR:", err);

      return thunkAPI.rejectWithValue(
        err.response?.data || "Add comment failed"
      );
    }
  }
);

// ================= DELETE COMMENT =================
export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      await axiosClient.delete(`/comments/${postId}/comments/${commentId}`);

      return { postId, commentId };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Delete comment failed");
    }
  }
);


// ================= DELETE POST =================
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, thunkAPI) => {
    try {
      await axiosClient.delete(`/posts/${postId}`);
      return postId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Delete post failed");
    }
  }
);


// ================= UPDATE POST =================
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, text }, thunkAPI) => {
    try {
      const res = await axiosClient.put(`/posts/${postId}`, { text });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Update failed");
    }
  }
);


// ================= INITIAL STATE =================
const initialState = {
  posts: [],
  userPosts: [],
  isLoading: false,
  error: null,
};


// ================= SLICE =================
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ===== FETCH POSTS =====
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload || [];
      })

      // ===== FETCH USER POSTS =====
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload || [];
      })

      // ===== CREATE POST =====
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })

      // ===== LIKE =====
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likesUsers } = action.payload;

        const update = (list) => {
          const post = list.find(p => p._id === postId);
          if (post) post.likesUsers = likesUsers;
        };

        update(state.posts);
        update(state.userPosts);
      })

      // ===== ADD COMMENT (FIXED) =====
   .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;

        const update = (list) => {
          const post = list.find(p => p._id === postId);
          if (post) post.comments = comments;
        };

        update(state.posts);
        update(state.userPosts);
})

      // ===== DELETE COMMENT (FIXED SAFE) =====
     .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;

        const update = (list) => {
          const post = list.find(p => p._id === postId);
          if (post && post.comments) {
            post.comments = post.comments.filter(c => c._id !== commentId);
          }
        };

        update(state.posts);
        update(state.userPosts);
      })

      // ===== DELETE POST =====
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
        state.userPosts = state.userPosts.filter(p => p._id !== action.payload);
      })

      // ===== UPDATE POST =====
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload;

        const update = (list) => {
          const i = list.findIndex(p => p._id === updated._id);
          if (i !== -1) list[i] = updated;
        };

        update(state.posts);
        update(state.userPosts);
      });
  },
});

export default postsSlice.reducer;