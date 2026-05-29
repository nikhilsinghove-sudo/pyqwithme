import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    ipHash: String,
    userAgent: String,
    path: String,
    lastSeenAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const Visitor = mongoose.model("Visitor", visitorSchema);
