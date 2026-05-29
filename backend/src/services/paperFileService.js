import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";

function ensureCloudinaryConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export function isLocalPaper(paper) {
  return (
    paper.storageType === "local" ||
    paper.pdfPublicId?.startsWith("local/") ||
    (paper.pdfUrl && /\/uploads\//i.test(paper.pdfUrl))
  );
}

export function getPaperMediaType(paper) {
  if (paper.mediaType) return paper.mediaType;
  const mime = paper.mimeType || "";
  if (mime.startsWith("image/")) return "image";
  const url = paper.pdfUrl || "";
  if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return "image";
  return "pdf";
}

function localFilename(paper) {
  if (paper.pdfPublicId?.startsWith("local/")) {
    return paper.pdfPublicId.replace(/^local\//, "");
  }
  const match = paper.pdfUrl?.match(/\/uploads\/([^/?#]+)/i);
  return match?.[1] || "";
}

function fileExtensionFromPaper(paper) {
  const name = localFilename(paper) || paper.pdfPublicId || "";
  const ext = path.extname(name).replace(".", "").toLowerCase();
  if (ext) return ext;
  if (getPaperMediaType(paper) === "image") return "jpg";
  return "pdf";
}

function cloudinaryDownloadPublicId(paper) {
  let publicId = paper.pdfPublicId || "";
  if (publicId.startsWith("local/")) {
    throw Object.assign(new Error("Invalid Cloudinary public id"), { statusCode: 400 });
  }
  const mediaType = getPaperMediaType(paper);
  const ext = fileExtensionFromPaper(paper);
  if (mediaType === "pdf" && !publicId.toLowerCase().endsWith(".pdf")) {
    publicId = `${publicId}.pdf`;
  }
  return { publicId, format: ext, resourceType: mediaType === "image" ? "image" : "raw" };
}

function downloadFilename(paper) {
  const base = `${paper.examName || "paper"}-${paper.year || "pyq"}`
    .replace(/[^a-z0-9.-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const ext = fileExtensionFromPaper(paper);
  return `${base || "paper"}.${ext}`;
}

function contentTypeForPaper(paper) {
  if (paper.mimeType) return paper.mimeType;
  const mediaType = getPaperMediaType(paper);
  if (mediaType === "image") {
    const ext = fileExtensionFromPaper(paper);
    const map = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
    return map[ext] || "image/jpeg";
  }
  return "application/pdf";
}

async function getCloudinaryDownloadUrl(paper) {
  ensureCloudinaryConfig();
  const { publicId, format, resourceType } = cloudinaryDownloadPublicId(paper);
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + 3600
  });
}

export async function streamPaperFile(paper, res, { disposition = "inline" } = {}) {
  const filename = downloadFilename(paper);
  const contentType = contentTypeForPaper(paper);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);

  if (isLocalPaper(paper)) {
    const name = localFilename(paper);
    if (!name) {
      const error = new Error("Local file path is missing");
      error.statusCode = 404;
      throw error;
    }
    const filePath = path.join(process.cwd(), "uploads", name);
    try {
      await fsPromises.access(filePath);
    } catch {
      const error = new Error("File not found on server. Please re-upload this paper.");
      error.statusCode = 404;
      throw error;
    }
    return fs.createReadStream(filePath).pipe(res);
  }

  const downloadUrl = await getCloudinaryDownloadUrl(paper);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    const error = new Error("Unable to fetch file from storage");
    error.statusCode = response.status === 404 ? 404 : 502;
    throw error;
  }
  return Readable.fromWeb(response.body).pipe(res);
}

/** @deprecated use streamPaperFile */
export const streamPaperPdf = streamPaperFile;
