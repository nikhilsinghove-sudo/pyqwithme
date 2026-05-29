import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper", required: true, index: true },
    examName: { type: String, required: true },
    subject: { type: String, required: true },
    year: { type: Number, required: true },
    comment: { type: String, required: true },
    userEmail: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
