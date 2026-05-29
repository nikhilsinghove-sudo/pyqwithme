import crypto from "crypto";

export function generateUploadPassword() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function hashFingerprint(parts) {
  return crypto
    .createHash("sha256")
    .update(parts.filter(Boolean).join("|").toLowerCase().trim())
    .digest("hex");
}
