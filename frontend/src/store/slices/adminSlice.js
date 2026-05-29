import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axiosClient.js";

export const loginAdmin = createAsyncThunk("admin/login", async (payload) => {
  try {
    const { data } = await api.post("/auth/admin/login", payload);
    localStorage.setItem("pyq_admin_token", data.token);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
});

export const fetchAdminStats = createAsyncThunk("admin/stats", async () => {
  const { data } = await api.get("/admin/stats");
  return data;
});

export const fetchCloudinaryStats = createAsyncThunk("admin/cloudinaryStats", async () => {
  const { data } = await api.get("/admin/stats/cloudinary");
  return data;
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    token: localStorage.getItem("pyq_admin_token"),
    admin: null,
    stats: null,
    cloudinaryStats: null,
    status: "idle",
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem("pyq_admin_token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.admin = action.payload.admin;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchCloudinaryStats.fulfilled, (state, action) => {
        state.cloudinaryStats = action.payload;
      });
  }
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
