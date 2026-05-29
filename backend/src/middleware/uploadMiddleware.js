import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

function paperFileOnly(_req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error("Only PDF and image files (JPG, PNG, WEBP, GIF) are allowed"));
    return;
  }
  cb(null, true);
}

export const uploadPaper = multer({
  storage,
  fileFilter: paperFileOnly,
  limits: { fileSize: 15 * 1024 * 1024 }
});

/** @deprecated use uploadPaper */
export const uploadPdf = uploadPaper;
