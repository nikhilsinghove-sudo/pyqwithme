import { Paper } from "../models/Paper.js";
import { SearchAnalytics } from "../models/SearchAnalytics.js";
import { UploadAnalytics } from "../models/UploadAnalytics.js";
import { Visitor } from "../models/Visitor.js";
import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteCloudinaryAsset } from "../services/cloudinaryService.js";
import { streamPaperFile } from "../services/paperFileService.js";
import { purgePendingDuplicates, queueFingerprintFromPaper } from "../services/duplicateQueueService.js";

export const listAdminPapers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = [
    { examName: new RegExp(req.query.search, "i") },
    { subject: new RegExp(req.query.search, "i") },
    { branch: new RegExp(req.query.search, "i") },
    { uploadedEmail: new RegExp(req.query.search, "i") }
  ];

  const [papers, total] = await Promise.all([
    Paper.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Paper.countDocuments(filter)
  ]);

  res.json({ papers, total, page, pages: Math.ceil(total / limit) });
});

export const approvePaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  paper.status = "approved";
  paper.rejectionReason = "";
  paper.duplicateFingerprint = queueFingerprintFromPaper(paper);
  await paper.save();

  await UploadAnalytics.findOneAndUpdate({ paper: paper._id }, { status: "approved" });

  const removedDuplicates = await purgePendingDuplicates(paper);

  res.json({
    message:
      removedDuplicates > 0
        ? `Paper approved. Removed ${removedDuplicates} other pending duplicate upload(s) for the same exam, year, month, and shift.`
        : "Paper approved",
    paper,
    removedDuplicates
  });
});

export const rejectPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: req.body.reason || "Rejected by admin" },
    { new: true }
  );
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  await UploadAnalytics.findOneAndUpdate({ paper: paper._id }, { status: "rejected" });
  res.json({ message: "Paper rejected", paper });
});

export const updatePaperByAdmin = asyncHandler(async (req, res) => {
  const allowed = ["examName", "examLogo", "year", "month", "week", "shift", "subject", "branch", "status"];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(paper, updates);
  if (updates.examName !== undefined || updates.year !== undefined || updates.month !== undefined || updates.shift !== undefined) {
    paper.duplicateFingerprint = queueFingerprintFromPaper(paper);
  }
  await paper.save();

  res.json({ message: "Paper updated", paper });
});

export const deletePaperByAdmin = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  try {
    await deleteCloudinaryAsset(paper.pdfPublicId, paper.mediaType || "pdf");
  } catch (err) {
    console.warn(`Admin delete: could not remove file (${paper.pdfPublicId}):`, err?.message || err);
  }
  await paper.deleteOne();
  res.json({ message: "Paper deleted" });
});

export const previewPaperByAdmin = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    const error = new Error("Paper not found");
    error.statusCode = 404;
    throw error;
  }
  await streamPaperFile(paper, res, { disposition: "inline" });
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUploads,
    totalApproved,
    totalPending,
    totalVisitors,
    activeUsersToday,
    mostDownloaded,
    mostSearched,
    returningVisitorsGroup,
    mostViewed,
    mostShared,
    visitorIPList
  ] = await Promise.all([
    Paper.countDocuments(),
    Paper.countDocuments({ status: "approved" }),
    Paper.countDocuments({ status: "pending" }),
    Visitor.distinct("visitorId").then((ids) => ids.length),
    Visitor.distinct("visitorId", { lastSeenAt: { $gte: today } }).then((ids) => ids.length),
    Paper.find({ status: "approved" }).sort({ downloads: -1 }).limit(5).select("examName subject downloads"),
    SearchAnalytics.aggregate([
      { $match: { query: { $ne: "" } } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Visitor.aggregate([
      { $group: { _id: "$visitorId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "count" }
    ]),
    Paper.find({ status: "approved" }).sort({ views: -1 }).limit(5).select("examName subject views"),
    Paper.find({ status: "approved" }).sort({ shares: -1 }).limit(5).select("examName subject shares"),
    Visitor.aggregate([
      {
        $group: {
          _id: "$ipHash",
          visits: { $sum: 1 },
          paths: { $addToSet: "$path" },
          userAgents: { $addToSet: "$userAgent" },
          lastActive: { $max: "$lastSeenAt" }
        }
      },
      { $sort: { lastActive: -1 } },
      { $limit: 50 }
    ])
  ]);

  const returningVisitors = returningVisitorsGroup[0]?.count || 0;

  res.json({
    totalUploads,
    totalApproved,
    totalPending,
    totalVisitors,
    activeUsersToday,
    mostDownloaded,
    mostSearched,
    returningVisitors,
    mostViewed,
    mostShared,
    visitorIPList
  });
});

export const getCloudinaryStats = asyncHandler(async (_req, res) => {
  const [
    cloudinaryCount,
    localCount,
    cloudinaryApproved,
    localApproved,
    cloudinaryDownloads,
    localDownloads,
    recentCloudinary
  ] = await Promise.all([
    Paper.countDocuments({ storageType: "cloudinary" }),
    Paper.countDocuments({ storageType: "local" }),
    Paper.countDocuments({ storageType: "cloudinary", status: "approved" }),
    Paper.countDocuments({ storageType: "local", status: "approved" }),
    Paper.aggregate([
      { $match: { storageType: "cloudinary" } },
      { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
    ]),
    Paper.aggregate([
      { $match: { storageType: "local" } },
      { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
    ]),
    Paper.find({ storageType: "cloudinary" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("examName subject status downloads createdAt")
  ]);

  res.json({
    cloudinaryCount,
    localCount,
    cloudinaryApproved,
    localApproved,
    cloudinaryDownloads: cloudinaryDownloads[0]?.totalDownloads || 0,
    localDownloads: localDownloads[0]?.totalDownloads || 0,
    recentCloudinary,
    storageDistribution: {
      cloudinary: cloudinaryCount,
      local: localCount,
      total: cloudinaryCount + localCount
    }
  });
});

export const listReports = asyncHandler(async (_req, res) => {
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate("paper", "examName subject year status");
  res.json({ reports });
});

export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: "Report dismissed successfully" });
});

