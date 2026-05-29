import mongoose from "mongoose";

const uploadAnalyticsSchema = new mongoose.Schema(
  {
    paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper" },
    examName: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    uploadedEmail: String
  },
  { timestamps: true }
);

export const UploadAnalytics = mongoose.model("UploadAnalytics", uploadAnalyticsSchema);
