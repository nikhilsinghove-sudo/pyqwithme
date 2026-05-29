import crypto from "crypto";
import { Paper } from "../models/Paper.js";
import { SearchAnalytics } from "../models/SearchAnalytics.js";
import { Visitor } from "../models/Visitor.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recordVisitor = asyncHandler(async (req, res) => {
  const visitorId = req.body.visitorId || crypto.randomUUID();
  const ipHash = crypto.createHash("sha256").update(req.ip || "").digest("hex");

  await Visitor.findOneAndUpdate(
    { visitorId, path: req.body.path || "/" },
    { visitorId, ipHash, userAgent: req.headers["user-agent"], path: req.body.path || "/", lastSeenAt: new Date() },
    { upsert: true, new: true }
  );

  res.json({ visitorId });
});

export const getPublicStats = asyncHandler(async (_req, res) => {
  const [papers, downloads, exams] = await Promise.all([
    Paper.countDocuments({ status: "approved" }),
    Paper.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, total: { $sum: "$downloads" } } }]),
    Paper.distinct("examName", { status: "approved" })
  ]);
  res.json({ papers, downloads: downloads[0]?.total || 0, exams: exams.length });
});

export const getPopularExams = asyncHandler(async (_req, res) => {
  const exams = await SearchAnalytics.aggregate([
    { $group: { _id: "$examName", searches: { $sum: 1 } } },
    { $match: { _id: { $ne: null } } },
    { $sort: { searches: -1 } },
    { $limit: 8 }
  ]);
  res.json({ exams });
});
