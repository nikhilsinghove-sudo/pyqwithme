import crypto from "crypto";
import mongoose from "mongoose";
import { Paper } from "../models/Paper.js";
import { SearchAnalytics } from "../models/SearchAnalytics.js";
import { UploadAnalytics } from "../models/UploadAnalytics.js";
import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateUploadPassword } from "../utils/password.js";
import { uploadPaperFile, deleteCloudinaryAsset } from "../services/cloudinaryService.js";
import { streamPaperFile } from "../services/paperFileService.js";
import {
  assertPendingSlotAvailable,
  buildQueueFingerprint,
  queueFingerprintFromPaper
} from "../services/duplicateQueueService.js";

function buildPaperQuery(query, approvedOnly = true) {
  const filter = approvedOnly ? { status: "approved" } : {};
  if (query.examName) filter.examName = new RegExp(query.examName, "i");
  if (query.year) filter.year = Number(query.year);
  if (query.month) filter.month = query.month;
  if (query.week) filter.week = query.week;
  if (query.shift) filter.shift = query.shift;
  if (query.subject) filter.subject = new RegExp(query.subject, "i");
  if (query.branch) filter.branch = new RegExp(query.branch, "i");
  if (query.status && !approvedOnly) filter.status = query.status;
  return filter;
}

async function findOwnerPaper(email, uploadPassword) {
  return Paper.findOne({
    uploadedEmail: String(email || "").toLowerCase(),
    uploadPassword: String(uploadPassword || "").trim()
  }).sort({ createdAt: -1 });
}

function normalizeOwnerCredentials(email, uploadPassword) {
  return {
    emailLower: String(email || "").toLowerCase(),
    password: String(uploadPassword || "").trim()
  };
}

function assertPaperOwner(paper, email, uploadPassword) {
  const { emailLower, password } = normalizeOwnerCredentials(email, uploadPassword);
  if (!paper || paper.uploadedEmail !== emailLower || paper.uploadPassword !== password) {
    const error = new Error("Invalid email or upload password");
    error.statusCode = 403;
    throw error;
  }
}

async function removePaperAsset(paperOrPublicId, mediaType = "pdf") {
  const publicId = typeof paperOrPublicId === "string" ? paperOrPublicId : paperOrPublicId?.pdfPublicId;
  const type = typeof paperOrPublicId === "string" ? mediaType : (paperOrPublicId?.mediaType || mediaType);
  try {
    await deleteCloudinaryAsset(publicId, type);
  } catch (err) {
    console.warn(`Could not remove stored file (${publicId}):`, err?.message || err);
  }
}

export const listPapers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const filter = buildPaperQuery(req.query);
  const [papers, total] = await Promise.all([
    Paper.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Paper.countDocuments(filter)
  ]);

  await SearchAnalytics.create({
    query: req.query.examName || "",
    examName: req.query.examName,
    filters: req.query,
    resultCount: total
  });

  res.json({ papers, total, page, pages: Math.ceil(total / limit) });
});

export const getPaperById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  const paper = await Paper.findOne({ _id: req.params.id, status: "approved" });
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  paper.views += 1;
  await paper.save();
  res.json({ paper });
});

export const uploadPaper = asyncHandler(async (req, res) => {
  const duplicateFingerprint = buildQueueFingerprint({
    examName: req.body.examName,
    year: req.body.year,
    month: req.body.month,
    shift: req.body.shift
  });

  await assertPendingSlotAvailable(duplicateFingerprint);

  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadPaperFile(req.file.buffer, req.file.originalname, req.file.mimetype);
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.toLowerCase().includes('must supply api_key') || msg.toLowerCase().includes('cloudinary')) {
      const error = new Error('Cloudinary is not configured correctly on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or enable local storage for development (USE_LOCAL_FILE_STORAGE=true).');
      error.statusCode = 500;
      throw error;
    }
    throw err;
  }
  const uploadPassword = String(req.body.uploadPassword || "").trim() || generateUploadPassword();

  const paper = await Paper.create({
    ...req.body,
    subject: String(req.body.subject || "General").trim() || "General",
    branch: String(req.body.branch || "").trim(),
    year: Number(req.body.year),
    pdfUrl: cloudinaryResult.secure_url,
    pdfPublicId: cloudinaryResult.public_id,
    uploadPassword,
    duplicateFingerprint,
    storageType: cloudinaryResult.storageType || "local",
    mediaType: cloudinaryResult.mediaType || (req.file.mimetype?.startsWith("image/") ? "image" : "pdf"),
    mimeType: cloudinaryResult.mimeType || req.file.mimetype
  });

  await UploadAnalytics.create({
    paper: paper._id,
    examName: paper.examName,
    uploadedEmail: paper.uploadedEmail,
    status: paper.status
  });

  const pendingInQueue = await Paper.countDocuments({ duplicateFingerprint, status: "pending" });

  res.status(201).json({
    message: "Upload received for admin approval.",
    paperId: paper._id,
    uploadPassword,
    pendingInQueue,
    maxPendingPerQueue: 5,
    storageType: cloudinaryResult.storageType,
    storageInfo: cloudinaryResult.storageInfo,
    pdfUrl: cloudinaryResult.secure_url
  });
});

export const verifyOwner = asyncHandler(async (req, res) => {
  const { email, uploadPassword } = req.body;
  const paper = await Paper.findById(req.params.id);
  assertPaperOwner(paper, email, uploadPassword);
  res.json({ paper });
});

export const verifyOwnerByCredentials = asyncHandler(async (req, res) => {
  const { email, uploadPassword } = req.body;
  const paper = await findOwnerPaper(email, uploadPassword);
  if (!paper) {
    const error = new Error("Invalid email or upload password");
    error.statusCode = 403;
    throw error;
  }
  res.json({ paper });
});

export const verifyOwnerList = asyncHandler(async (req, res) => {
  const { emailLower, password } = normalizeOwnerCredentials(req.body.email, req.body.uploadPassword);
  const papers = await Paper.find({ uploadedEmail: emailLower, uploadPassword: password }).sort({ createdAt: -1 });
  if (!papers.length) {
    const error = new Error("Invalid email or upload password");
    error.statusCode = 403;
    throw error;
  }
  res.json({ papers });
});

export const updateOwnPaper = asyncHandler(async (req, res) => {
  const { email, uploadPassword, ...updates } = req.body;
  const paper = await Paper.findById(req.params.id);
  assertPaperOwner(paper, email, uploadPassword);

  ["examName", "examLogo", "year", "month", "week", "shift", "subject", "branch"].forEach((field) => {
    if (updates[field] !== undefined) {
      paper[field] = field === "branch" ? String(updates[field] || "").trim() : updates[field];
    }
  });
  paper.duplicateFingerprint = queueFingerprintFromPaper(paper);
  paper.status = "pending";
  await assertPendingSlotAvailable(paper.duplicateFingerprint, paper._id);
  await paper.save();
  res.json({ message: "Paper updated and moved to pending review", paper });
});

export const updateOwnPaperByCredentials = asyncHandler(async (req, res) => {
  const { email, uploadPassword, ...updates } = req.body;
  const paper = await findOwnerPaper(email, uploadPassword);
  if (!paper) {
    const error = new Error("Invalid email or upload password");
    error.statusCode = 403;
    throw error;
  }

  ["examName", "examLogo", "year", "month", "week", "shift", "subject", "branch"].forEach((field) => {
    if (updates[field] !== undefined) {
      paper[field] = field === "branch" ? String(updates[field] || "").trim() : updates[field];
    }
  });
  paper.duplicateFingerprint = queueFingerprintFromPaper(paper);
  paper.status = "pending";
  await assertPendingSlotAvailable(paper.duplicateFingerprint, paper._id);
  await paper.save();
  res.json({ message: "Paper updated and moved to pending review", paper });
});

export const deleteOwnPaper = asyncHandler(async (req, res) => {
  const { email, uploadPassword } = req.body;
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  assertPaperOwner(paper, email, uploadPassword);
  await removePaperAsset(paper);
  await paper.deleteOne();
  res.json({ message: "Paper deleted" });
});

export const deleteOwnPaperByCredentials = asyncHandler(async (req, res) => {
  const { email, uploadPassword } = req.body;
  const paper = await findOwnerPaper(email, uploadPassword);
  if (!paper) {
    const error = new Error("Invalid email or upload password");
    error.statusCode = 403;
    throw error;
  }
  await removePaperAsset(paper);
  await paper.deleteOne();
  res.json({ message: "Paper deleted" });
});

export const viewPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findOne({ _id: req.params.id, status: "approved" });
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  await streamPaperFile(paper, res, { disposition: "inline" });
});

export const downloadPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findOne({ _id: req.params.id, status: "approved" });
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  paper.downloads += 1;
  await paper.save();

  if (req.method === "POST" || req.headers.accept?.includes("application/json")) {
    const base = `${req.protocol}://${req.get("host")}`;
    return res.json({ downloadUrl: `${base}/api/papers/${paper._id}/download` });
  }

  await streamPaperFile(paper, res, { disposition: "attachment" });
});

export const trackVisitor = asyncHandler(async (req, res) => {
  res.json({ visitorId: req.body.visitorId || crypto.randomUUID() });
});

export const sharePaper = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  const paper = await Paper.findOne({ _id: req.params.id, status: "approved" });
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  paper.shares = (paper.shares || 0) + 1;
  await paper.save();

  res.json({ message: "Share count incremented", shares: paper.shares });
});

export const reportPaper = asyncHandler(async (req, res) => {
  const { comment, userEmail } = req.body;
  if (!comment) {
    const error = new Error("Comment is required");
    error.statusCode = 400;
    throw error;
  }

  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  const report = await Report.create({
    paper: paper._id,
    examName: paper.examName,
    subject: paper.subject || "General",
    year: paper.year,
    comment,
    userEmail: userEmail || ""
  });

  res.status(201).json({ message: "Report submitted successfully", report });
});

