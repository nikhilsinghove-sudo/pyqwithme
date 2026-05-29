import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function signToken(admin) {
  return jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase() });

  if (!admin || !(await admin.matchPassword(password || ""))) {
    const error = new Error("Invalid admin credentials");
    error.statusCode = 401;
    throw error;
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  res.json({
    token: signToken(admin),
    admin: { id: admin._id, email: admin.email, name: admin.name }
  });
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});
