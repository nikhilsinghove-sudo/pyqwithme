import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { cloudinary } from "./config/cloudinary.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paperRoutes from "./routes/paperRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import poemRoutes from "./routes/poemRoutes.js";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    crossOriginResourcePolicy: false
  })
);
app.use(compression());
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, or direct server calls)
      if (!origin) return callback(null, true);
      
      const isAllowed = 
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
        
      if (isAllowed || allowedOrigins.includes("*") || allowedOrigins.length === 0) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 250, standardHeaders: true }));

// Serve local uploads only when local storage is enabled (development or explicit env)
if (process.env.USE_LOCAL_FILE_STORAGE === "true" || process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "PYQwithMe API" });
});

// Development debug endpoint to inspect Cloudinary env presence
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/cloudinary", (_req, res) => {
    res.json({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "MISSING",
      api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
      use_local: process.env.USE_LOCAL_FILE_STORAGE === "true"
    });
  });

  app.get("/api/debug/cloudinary-check", async (_req, res) => {
    try {
      const data = await cloudinary.api.resources({ max_results: 1 });
      res.json({ ok: true, resources: data.resources.length });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err.message || err) });
    }
  });

  app.get('/api/debug/cloudinary-signed', (req, res) => {
    const publicId = req.query.publicId;
    if (!publicId) return res.status(400).json({ error: 'missing publicId query param' });
    try {
      // Ensure runtime config picks up env vars
      try { cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET }); } catch (e) {}
      const opts = { resource_type: 'raw', sign_url: true };
      if (!publicId.toLowerCase().endsWith('.pdf')) opts.format = 'pdf';
      const signed = cloudinary.url(publicId, opts);
      res.json({ signedUrl: signed });
    } catch (err) {
      res.status(500).json({ error: String(err.message || err) });
    }
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/poems", poemRoutes);

app.use(notFound);
app.use(errorHandler);
