import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axiosClient.js";
import { filterSamplePapers, samplePapers } from "../../data/samplePapers.js";

export const fetchPapers = createAsyncThunk("papers/fetch", async (params = {}) => {
  try {
    const { data } = await api.get("/papers", { params });
    if (data.papers?.length) return data;
    const papers = filterSamplePapers(params);
    return { papers, total: papers.length, page: Number(params.page) || 1, pages: 1, usingSamples: true };
  } catch (_error) {
    const papers = filterSamplePapers(params);
    return { papers, total: papers.length, page: Number(params.page) || 1, pages: 1, usingSamples: true };
  }
});

export const fetchPaper = createAsyncThunk("papers/fetchOne", async (id) => {
  const sample = String(id).startsWith("sample-")
    ? samplePapers.find((paper) => paper._id === id)
    : null;
  if (sample) return sample;
  try {
    const { data } = await api.get(`/papers/${id}`);
    return data.paper;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
});

export const uploadPaper = createAsyncThunk("papers/upload", async (formData) => {
  try {
    const { data } = await api.post("/papers", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
});

const paperSlice = createSlice({
  name: "papers",
  initialState: {
    items: [],
    selected: null,
    total: 0,
    page: 1,
    pages: 1,
    uploadResult: null,
    status: "idle",
    error: null,
    usingSamples: false
  },
  reducers: {
    clearUploadResult(state) {
      state.uploadResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPapers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPapers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.papers;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.usingSamples = Boolean(action.payload.usingSamples);
      })
      .addCase(fetchPapers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchPaper.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchPaper.rejected, (state, action) => {
        state.selected = null;
        state.error = action.error.message;
      })
      .addCase(uploadPaper.fulfilled, (state, action) => {
        state.uploadResult = action.payload;
      });
  }
});

export const { clearUploadResult } = paperSlice.actions;
export default paperSlice.reducer;
