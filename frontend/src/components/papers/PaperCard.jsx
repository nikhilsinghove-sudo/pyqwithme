import { Download, Eye, FileText, Share2, Mail, Twitter, Facebook, MessageSquare, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button.jsx";
import { paperDownloadUrl } from "../../utils/paperUrls.js";
import { useEffect, useRef, useState } from "react";
import { api } from "../../api/axiosClient.js";

export function PaperCard({ paper }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function handleDownload() {
    if (paper.isSample) {
      alert("This is a sample preview card. Upload a real PDF to enable downloads.");
      return;
    }
    window.open(paperDownloadUrl(paper._id), "_blank", "noopener,noreferrer");
  }

  function paperUrl() {
    return `${window.location.origin}/papers/${paper._id}`;
  }

  async function doNativeShare() {
    const url = paperUrl();
    if (!navigator.share) return doCopyLink();
    try {
      await navigator.share({ title: paper.examName, text: paper.subject || paper.examName, url });
    } catch (e) {
      console.error("native share failed", e);
      alert("Unable to use native share");
    }
    setShareOpen(false);
  }

  async function doCopyLink() {
    const url = paperUrl();
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(url);
      else {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      alert("Link copied to clipboard");
    } catch (e) {
      console.error("copy failed", e);
      alert("Unable to copy link");
    }
    setShareOpen(false);
  }

  function openSocial(platform) {
    const url = encodeURIComponent(paperUrl());
    const text = encodeURIComponent((paper.subject || paper.examName) + " — " + paper.examName);
    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(paper.examName)}&body=${text}%0A%0A${url}`;
        break;
      default:
        shareUrl = paperUrl();
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!reportComment.trim()) return;
    setSubmittingReport(true);
    try {
      await api.post(`/papers/${paper._id}/report`, {
        comment: reportComment,
        userEmail: reportEmail
      });
      setReportSuccess(true);
      setReportComment("");
      setReportEmail("");
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  }

  const isImage = paper.mediaType === "image" || paper.mimeType?.startsWith("image/");

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between min-h-[290px]">
      {/* Decorative premium border overlay on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

      <div>
        {/* Header content */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 dark:from-slate-800 dark:to-slate-800 dark:text-brand-400 group-hover:scale-105 transition-transform duration-300">
              {paper.examLogo ? (
                <img src={paper.examLogo} alt="" className="h-8 w-8 object-contain" loading="lazy" />
              ) : (
                <FileText className="h-6 w-6 text-brand-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {paper.examName}
              </h3>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {paper.subject || "General"}
              </p>
            </div>
          </div>

          {/* Share & Report Action Icons at the Top Right */}
          <div className="relative flex items-center gap-1" ref={shareRef}>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-all"
              onClick={() => setShareOpen((s) => !s)}
              title="Share options"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 rounded-lg transition-all"
              onClick={() => setShowReportModal(true)}
              title="Report issue"
            >
              <Flag className="h-4 w-4" />
            </button>

            {shareOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-40 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-0.5">
                  {typeof navigator !== "undefined" && navigator.share && (
                    <button
                      onClick={doNativeShare}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Share Options...
                    </button>
                  )}
                  <button
                    onClick={doCopyLink}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => openSocial("whatsapp")}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => openSocial("telegram")}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Telegram
                  </button>
                  <button
                    onClick={() => openSocial("email")}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Colorful Badges Row */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/20 dark:text-brand-400">
            {paper.year}
          </span>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
            {paper.month}
          </span>
          {paper.shift && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
              {paper.shift}
            </span>
          )}
          {paper.branch && (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/20 dark:text-purple-400">
              {paper.branch}
            </span>
          )}
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            {isImage ? "Image" : "PDF"}
          </span>
        </div>

        {/* Views & Telemetry Row */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-[11px] text-slate-400 dark:border-slate-850 dark:text-slate-500">
          <span className="flex items-center gap-1" title="Views count">
            <Eye className="h-3.5 w-3.5" />
            {paper.views || 0} views
          </span>
          <span className="flex items-center gap-1" title="Downloads count">
            <Download className="h-3.5 w-3.5" />
            {paper.downloads || 0} DLs
          </span>
          <span className="flex items-center gap-1" title="Shares count">
            <Share2 className="h-3.5 w-3.5" />
            {paper.shares || 0} shares
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-5 flex gap-2">
        <Link to={`/papers/${paper._id}`} className="flex-1">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </Link>
        <Button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 text-left">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Report this PYQ
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-3 animate-scale-up">
                  ✓
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Report Submitted</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Our moderators have been notified.</p>
              </div>
            ) : (
              <form onSubmit={submitReport} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Your Email (Optional)</label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="Enter email for updates"
                    className="focus-ring w-full rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Issue Details (Required)</label>
                  <textarea
                    required
                    rows="4"
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Tell us what is wrong with this paper (e.g. poor quality, wrong shift, bad answers...)"
                    className="focus-ring w-full rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submittingReport || !reportComment.trim()} className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1">
                    {submittingReport ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
