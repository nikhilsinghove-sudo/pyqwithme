import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Admin } from "../models/Admin.js";

dotenv.config();

await connectDB();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
}

const existing = await Admin.findOne({ email });
if (existing) {
  console.log("Admin already exists");
  process.exit(0);
}

await Admin.create({ email, password, name: "PYQwithMe Admin" });
console.log(`Admin created: ${email}`);
process.exit(0);
