import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/Admin.js";

export const protectAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    const error = new Error("Admin token required");
    error.statusCode = 401;
    throw error;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findById(decoded.id).select("-password");
  if (!admin) {
    const error = new Error("Invalid admin token");
    error.statusCode = 401;
    throw error;
  }

  req.admin = admin;
  next();
});
