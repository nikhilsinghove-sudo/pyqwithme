import { SiteSettings } from "../models/SiteSettings.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fallbackSettings = {
  homeCategories: ["JEE", "NEET", "UPSC", "SSC", "GATE", "CAT"],
  showUploaderInfo: false,
  aboutUsText: "Welcome to PYQwithMe! We are dedicated to providing the cleanest, easiest-to-search database of previous year question papers. Students can search, view, download, and upload papers freely without creating an account. All community uploads are reviewed manually to keep the quality high.",
  contactEmail: "support@pyqwithme.com",
  contactLocation: "New Delhi, India",
  privacyPolicyText: "Your privacy is highly important to us. PYQwithMe does not track personal identifying information of our visitors. Uploaders can submit PDF/image files anonymously. Diagnostic usage metrics are parsed with respect to your security.",
  termsText: "By uploading files or searching question papers on PYQwithMe, you agree to submit only clean PDF/image papers without advertisements, watermarks, or unrelated spam. Uploaded files undergo manual admin review before going public.",
  disclaimerText: "Disclaimer: All question papers uploaded on PYQwithMe belong to their respective educational boards and exam authorities. We do not hold copyrights to official exam files. Files are uploaded by the student community for educational purposes.",
  copyrightText: "© 2026 PYQwithMe. All rights reserved."
};

async function getOrCreateSettings() {
  return SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", ...fallbackSettings } },
    { new: true, upsert: true }
  );
}

export const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const homeCategories = Array.isArray(req.body.homeCategories)
    ? req.body.homeCategories.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
    : fallbackSettings.homeCategories;

  const showUploaderInfo = typeof req.body.showUploaderInfo === "boolean" ? req.body.showUploaderInfo : fallbackSettings.showUploaderInfo;
  
  // Extract custom page content
  const aboutUsText = req.body.aboutUsText !== undefined ? String(req.body.aboutUsText).trim() : undefined;
  const contactEmail = req.body.contactEmail !== undefined ? String(req.body.contactEmail).trim() : undefined;
  const contactLocation = req.body.contactLocation !== undefined ? String(req.body.contactLocation).trim() : undefined;
  const privacyPolicyText = req.body.privacyPolicyText !== undefined ? String(req.body.privacyPolicyText).trim() : undefined;
  const termsText = req.body.termsText !== undefined ? String(req.body.termsText).trim() : undefined;
  const disclaimerText = req.body.disclaimerText !== undefined ? String(req.body.disclaimerText).trim() : undefined;
  const copyrightText = req.body.copyrightText !== undefined ? String(req.body.copyrightText).trim() : undefined;

  const updateFields = { homeCategories, showUploaderInfo };
  if (aboutUsText !== undefined) updateFields.aboutUsText = aboutUsText;
  if (contactEmail !== undefined) updateFields.contactEmail = contactEmail;
  if (contactLocation !== undefined) updateFields.contactLocation = contactLocation;
  if (privacyPolicyText !== undefined) updateFields.privacyPolicyText = privacyPolicyText;
  if (termsText !== undefined) updateFields.termsText = termsText;
  if (disclaimerText !== undefined) updateFields.disclaimerText = disclaimerText;
  if (copyrightText !== undefined) updateFields.copyrightText = copyrightText;

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    updateFields,
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ message: "Settings updated", settings });
});
