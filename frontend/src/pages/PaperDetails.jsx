import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Download, Eye, FileText, Share2, Flag } from "lucide-react";
import { fetchPaper } from "../store/slices/paperSlice.js";
import { Button } from "../components/ui/Button.jsx";
import { PDFViewer } from "../components/PDFViewer.jsx";
import AdSense from "../components/ads/AdSense.jsx";
import { paperDownloadUrl } from "../utils/paperUrls.js";
import { api } from "../api/axiosClient.js";

export function PaperDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const paper = useSelector((state) => state.papers.selected);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharesCount, setSharesCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  async function submitReport(e) {
    e.preventDefault();
    if (!reportComment.trim()) return;
    setSubmittingReport(true);
    try {
      await api.post(`/papers/${id}/report`, {
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

  useEffect(() => {
    setLoading(true);
    setError("");
    dispatch(fetchPaper(id))
      .unwrap()
      .catch((err) => setError(err?.message || "Paper not found"))
      .finally(() => setLoading(false));
  }, [dispatch, id]);

  useEffect(() => {
    if (paper) {
      setSharesCount(paper.shares || 0);
    }
  }, [paper]);

  async function download() {
    if (paper?.isSample) {
      alert("This is a sample preview card. Upload a real PDF to enable downloads.");
      return;
    }
    window.open(paperDownloadUrl(id), "_blank", "noopener,noreferrer");
  }

  async function share() {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (!paper?.isSample) {
        const { data } = await api.post(`/papers/${id}/share`);
        setSharesCount(data.shares || (sharesCount + 1));
      } else {
        setSharesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }

  if (loading) return <div className="container-page py-12">Loading paper...</div>;

  if (error || !paper) {
    return (
      <section className="container-page py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">Paper not available</h1>
          <p className="mt-2 text-slate-500">This paper may be pending admin approval, rejected, or deleted.</p>
          <Link to="/search" className="mt-5 inline-flex">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </section>
    );
  }

  const subject = paper.subject || "General";
  const pageTitle = `${paper.examName} ${paper.year} ${subject} | PYQwithMe`;

  return (
    <section className="container-page py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Download ${paper.examName} ${paper.year} ${subject} previous year question paper.`} />
      </Helmet>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{paper.examName}</h1>
              <p className="mt-1 text-slate-500">
                {subject} - {paper.year} - {paper.month} - {paper.shift}
                {paper.branch ? ` - ${paper.branch}` : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5"><Eye className="h-4 w-4" />Preview</Button>
            <Button variant="secondary" onClick={share} className="flex items-center gap-1.5 min-w-[90px]">{copied ? "Copied!" : <><Share2 className="h-4 w-4" />Share</>}</Button>
            <Button variant="secondary" onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/30 dark:text-red-400 dark:hover:bg-red-950/20"><Flag className="h-4 w-4" />Report Issue</Button>
            <Button onClick={download} className="flex items-center gap-1.5"><Download className="h-4 w-4" />Download file</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {["year", "month", "week", "shift"].map((field) => (
            <div key={field} className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs uppercase text-slate-500">{field}</p>
              <p className="font-semibold">{paper[field]}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {paper.views || 0} views</span>
          <span className="flex items-center gap-1.5"><Download className="h-4 w-4" /> {paper.downloads || 0} downloads</span>
          <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4" /> {sharesCount} shares</span>
        </div>
      </div>
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="max-h-[90vh] w-full max-w-4xl rounded-lg bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <h2 className="font-bold">PDF Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-slate-700" aria-label="Close preview">✕</button>
            </div>
            {paper.isSample ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <div className="text-sm text-slate-500">Sample preview cards do not include a PDF file.</div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <PDFViewer paperId={id} mediaType={paper.mediaType} mimeType={paper.mimeType} title={`${paper.examName} - ${paper.year}`} />
              </div>
            )}
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Report an Issue
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
                    className="focus-ring w-full rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
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
                    className="focus-ring w-full rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
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

      <div className="container-page py-6">
        <AdSense className="mx-auto max-w-2xl" />
      </div>
    </section>
  );
}
