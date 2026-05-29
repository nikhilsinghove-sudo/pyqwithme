import { Paper } from "../models/Paper.js";
import { UploadAnalytics } from "../models/UploadAnalytics.js";
import { hashFingerprint } from "../utils/password.js";
import { deleteCloudinaryAsset } from "./cloudinaryService.js";

/** Max pending uploads sharing exam + year + month + shift */
export const MAX_PENDING_PER_QUEUE = 5;

export function buildQueueFingerprint({ examName, year, month, shift }) {
  return hashFingerprint([
    String(examName || "").trim(),
    String(year || ""),
    String(month || "").trim(),
    String(shift || "").trim()
  ]);
}

export function queueFingerprintFromPaper(paper) {
  return buildQueueFingerprint({
    examName: paper.examName,
    year: paper.year,
    month: paper.month,
    shift: paper.shift
  });
}

export async function countPendingInQueue(fingerprint, excludePaperId = null) {
  if (!fingerprint) return 0;
  const filter = { duplicateFingerprint: fingerprint, status: "pending" };
  if (excludePaperId) filter._id = { $ne: excludePaperId };
  return Paper.countDocuments(filter);
}

export async function assertPendingSlotAvailable(fingerprint, excludePaperId = null) {
  const count = await countPendingInQueue(fingerprint, excludePaperId);
  if (count >= MAX_PENDING_PER_QUEUE) {
    const error = new Error(
      `Only ${MAX_PENDING_PER_QUEUE} pending uploads are allowed for the same exam, year, month, and shift. Please wait until admin reviews existing uploads.`
    );
    error.statusCode = 429;
    throw error;
  }
}

async function deletePaperAndAssets(paper) {
  try {
    await deleteCloudinaryAsset(paper.pdfPublicId, paper.mediaType || "pdf");
  } catch (err) {
    console.warn(`Could not remove file for paper ${paper._id}:`, err?.message || err);
  }
  await UploadAnalytics.deleteMany({ paper: paper._id });
  await paper.deleteOne();
}

/**
 * After one paper is approved, remove other pending uploads in the same queue.
 */
export async function purgePendingDuplicates(approvedPaper) {
  if (!approvedPaper?.duplicateFingerprint) return 0;

  const others = await Paper.find({
    duplicateFingerprint: approvedPaper.duplicateFingerprint,
    status: "pending",
    _id: { $ne: approvedPaper._id }
  });

  for (const paper of others) {
    await deletePaperAndAssets(paper);
  }

  return others.length;
}
