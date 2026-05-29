import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    homeCategories: {
      type: [String],
      default: ["JEE", "NEET", "UPSC", "SSC", "GATE", "CAT"]
    },
    showUploaderInfo: { type: Boolean, default: false },
    aboutUsText: {
      type: String,
      default: "Welcome to PYQwithMe! We are dedicated to providing the cleanest, easiest-to-search database of previous year question papers. Students can search, view, download, and upload papers freely without creating an account. All community uploads are reviewed manually to keep the quality high."
    },
    contactEmail: {
      type: String,
      default: "support@pyqwithme.com"
    },
    contactLocation: {
      type: String,
      default: "New Delhi, India"
    },
    privacyPolicyText: {
      type: String,
      default: "Your privacy is highly important to us. PYQwithMe does not track personal identifying information of our visitors. Uploaders can submit PDF/image files anonymously. Diagnostic usage metrics are parsed with respect to your security."
    },
    termsText: {
      type: String,
      default: "By uploading files or searching question papers on PYQwithMe, you agree to submit only clean PDF/image papers without advertisements, watermarks, or unrelated spam. Uploaded files undergo manual admin review before going public."
    },
    disclaimerText: {
      type: String,
      default: "Disclaimer: All question papers uploaded on PYQwithMe belong to their respective educational boards and exam authorities. We do not hold copyrights to official exam files. Files are uploaded by the student community for educational purposes."
    },
    copyrightText: {
      type: String,
      default: "© 2026 PYQwithMe. All rights reserved."
    }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
