import validator from "validator";

const requiredPaperFields = ["uploadedEmail", "uploadPassword", "examName", "year", "month", "week", "shift"];

export function validatePaperUpload(req, _res, next) {
  for (const field of requiredPaperFields) {
    if (!String(req.body[field] || "").trim()) {
      const error = new Error(`${field} is required`);
      error.statusCode = 400;
      return next(error);
    }
  }

  if (!validator.isEmail(req.body.uploadedEmail)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    return next(error);
  }

  if (String(req.body.uploadPassword || "").trim().length < 6) {
    const error = new Error("Upload password must be at least 6 characters");
    error.statusCode = 400;
    return next(error);
  }

  if (!req.file) {
    const error = new Error("A PDF or image file is required");
    error.statusCode = 400;
    return next(error);
  }

  next();
}
