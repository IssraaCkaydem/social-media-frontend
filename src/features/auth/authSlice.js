


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser, getMe, logoutUser } from "./authAPI";

// 🔥 REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      return await registerUser(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// 🔥 LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      return await loginUser(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// 🔥 AUTO LOGIN (getMe)
export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      return await getMe();
    } catch {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

// 🔥 LOGOUT
export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutUser();
});

const initialState = {
  user: null,
 // isLoading: false,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
      });
  },
});

export const { updateUser, resetError } = authSlice.actions;

export default authSlice.reducer;