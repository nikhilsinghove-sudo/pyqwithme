import mongoose from "mongoose";

const searchAnalyticsSchema = new mongoose.Schema(
  {
    query: { type: String, default: "" },
    examName: String,
    filters: Object,
    resultCount: Number
  },
  { timestamps: true }
);

export const SearchAnalytics = mongoose.model("SearchAnalytics", searchAnalyticsSchema);
