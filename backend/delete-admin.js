import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { Admin } from "./src/models/Admin.js";

dotenv.config();

await connectDB();
await Admin.deleteMany({});
console.log("All admin accounts deleted");
process.exit(0);
