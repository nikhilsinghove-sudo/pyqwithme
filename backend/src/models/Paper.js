import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true, trim: true, index: true },
    examLogo: { type: String, default: "" },
    year: { type: Number, required: true, index: true },
    month: { type: String, required: true, index: true },
    week: { type: String, required: true },
    shift: { type: String, required: true, index: true },
    subject: { type: String, default: "General", trim: true, index: true },
    branch: { type: String, default: "", trim: true, index: true },
    pdfUrl: { type: String, required: true },
    pdfPublicId: { type: String, required: true },
    uploadedEmail: { type: String, required: true, lowercase: true, trim: true },
    uploadPassword: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    rejectionReason: { type: String, default: "" },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    duplicateFingerprint: { type: String, index: true },
    storageType: { type: String, enum: ["cloudinary", "local"], default: "cloudinary", index: true },
    mediaType: { type: String, enum: ["pdf", "image"], default: "pdf", index: true },
    mimeType: { type: String, default: "application/pdf" }
  },
  { timestamps: true }
);

paperSchema.index({ examName: "text", subject: "text", branch: "text" });

export const Paper = mongoose.model("Paper", paperSchema);
