import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: localStorage.getItem("pyq_dark") === "true"
  },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem("pyq_dark", String(state.darkMode));
      document.documentElement.classList.toggle("dark", state.darkMode);
    }
  }
});

if (localStorage.getItem("pyq_dark") === "true") {
  document.documentElement.classList.add("dark");
}

export const { toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
