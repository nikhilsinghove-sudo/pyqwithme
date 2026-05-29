import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/adminSlice.js";
import paperReducer from "./slices/paperSlice.js";
import uiReducer from "./slices/uiSlice.js";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    papers: paperReducer,
    ui: uiReducer
  }
});
