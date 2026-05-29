import fs from "fs/promises";
import path from "path";
import streamifier from "streamifier";
import { cloudinary } from "../config/cloudinary.js";

function ensureCloudinaryRuntimeConfig() {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  } catch {
    // ignore
  }
}

function cloudinaryConfigured() {
  ensureCloudinaryRuntimeConfig();
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    !process.env.CLOUDINARY_CLOUD_NAME.startsWith("replace-with") &&
    process.env.CLOUDINARY_API_KEY &&
    !process.env.CLOUDINARY_API_KEY.startsWith("replace-with") &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_API_SECRET.startsWith("replace-with")
  );
}

function isImageMime(mimetype) {
  return String(mimetype || "").startsWith("image/");
}

function fileExtension(filename, mimetype) {
  const ext = path.extname(filename || "").replace(".", "").toLowerCase();
  if (ext) return ext;
  if (mimetype === "image/jpeg") return "jpg";
  if (mimetype === "image/png") return "png";
  if (mimetype === "image/webp") return "webp";
  if (mimetype === "image/gif") return "gif";
  return "pdf";
}

async function uploadFileLocally(fileBuffer, filename, mimetype) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = fileExtension(filename, mimetype);
  const safeName = `${Date.now()}-${filename.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}`;
  const hasExt = /\.[a-z0-9]+$/i.test(safeName);
  const finalName = hasExt ? safeName : `${safeName}.${ext}`;
  const filePath = path.join(uploadsDir, finalName);
  await fs.writeFile(filePath, fileBuffer);

  return {
    secure_url: `/uploads/${finalName}`,
    public_id: `local/${finalName}`,
    storageType: "local",
    mediaType: isImageMime(mimetype) ? "image" : "pdf",
    mimeType: mimetype,
    storageInfo: isImageMime(mimetype) ? "Image stored locally on server" : "PDF stored locally on server"
  };
}

export function uploadPaperFile(fileBuffer, filename, mimetype = "application/pdf") {
  const useLocal =
    process.env.USE_LOCAL_FILE_STORAGE === "true" || process.env.NODE_ENV !== "production";

  if (useLocal) {
    return uploadFileLocally(fileBuffer, filename, mimetype);
  }

  if (cloudinaryConfigured()) {
    const isImage = isImageMime(mimetype);
    return new Promise((resolve, reject) => {
      const options = {
        folder: "pyqwithme/papers",
        public_id: `${Date.now()}-${filename.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`
      };

      if (isImage) {
        options.resource_type = "image";
      } else {
        options.resource_type = "raw";
        options.format = "pdf";
      }

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve({
          ...result,
          storageType: "cloudinary",
          mediaType: isImage ? "image" : "pdf",
          mimeType: mimetype,
          storageInfo: isImage
            ? "Image successfully uploaded to Cloudinary CDN"
            : "PDF successfully uploaded to Cloudinary CDN"
        });
      });

      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  }

  if (useLocal) {
    return uploadFileLocally(fileBuffer, filename, mimetype);
  }

  const error = new Error(
    "Cloudinary credentials are required before uploading files. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or enable local storage."
  );
  error.statusCode = 500;
  throw error;
}

/** @deprecated use uploadPaperFile */
export function uploadPdfToCloudinary(fileBuffer, filename, mimetype) {
  return uploadPaperFile(fileBuffer, filename, mimetype);
}

export function deleteCloudinaryAsset(publicId, mediaType = "pdf") {
  if (!publicId) return Promise.resolve();
  if (publicId.startsWith("local/")) {
    return fs.rm(path.join(process.cwd(), "uploads", publicId.replace("local/", "")), { force: true });
  }
  const resourceType = mediaType === "image" ? "image" : "raw";
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
