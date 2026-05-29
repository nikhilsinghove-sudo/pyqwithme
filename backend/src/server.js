import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { Admin } from "./models/Admin.js";

const port = process.env.PORT || 5000;

connectDB().then(() => {
  // ensure an admin exists from env vars for convenience in development
  (async function ensureAdminFromEnv() {
    try {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      if (email && password) {
        const existing = await Admin.findOne({ email: String(email).toLowerCase() });
        if (!existing) {
          await Admin.create({ email: String(email).toLowerCase(), password, name: "PYQwithMe Admin" });
          console.log("Created admin from env");
        }
      }
    } catch (err) {
      console.error("Could not ensure admin from env:", err.message || err);
    }
  })();

  // ensure some default motivational poems exist
  (async function ensureDefaultPoems() {
    try {
      const { Poem } = await import("./models/Poem.js");
      const count = await Poem.countDocuments();
      if (count === 0) {
        await Poem.create([
          { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
          { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
          { content: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" }
        ]);
        console.log("Seeded default motivational poems");
      }
    } catch (err) {
      console.error("Could not seed default poems:", err.message || err);
    }
  })();

  app.listen(port, () => {
    console.log(`PYQwithMe API running on port ${port}`);
  });
});
