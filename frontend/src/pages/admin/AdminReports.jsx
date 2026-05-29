import { useEffect, useState } from "react";
import { AlertTriangle, Eye, Trash2, Check, ShieldAlert, Calendar, Mail } from "lucide-react";
import { api } from "../../api/axiosClient.js";
import { Button } from "../../components/ui/Button.jsx";
import { AdminMediaPreview } from "../../components/admin/AdminMediaPreview.jsx";

export function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/reports");
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function dismissReport(id) {
    if (!confirm("Dismiss this user report?")) return;
    try {
      await api.delete(`/admin/reports/${id}`);
      load();
    } catch (err) {
      alert("Failed to dismiss report");
    }
  }

  async function deletePaper(paperId) {
    if (!confirm("Are you absolutely sure you want to delete this reported paper from the site? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/papers/${paperId}`);
      alert("Paper deleted successfully.");
      load();
    } catch (err) {
      alert("Failed to delete paper");
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm font-medium text-slate-500">Loading user reports...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          User Reports & Feedback
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review and moderate quality issues submitted by users regarding question papers.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-3">
            ✓
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clean Slate!</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no outstanding user reports to review.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {reports.map((report) => {
            const paper = report.paper;
            return (
              <div
                key={report._id}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Red warning border on left of reported cards */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                
                <div className="pl-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {report.examName} - {report.subject} ({report.year})
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatTime(report.createdAt)}
                        </span>
                        {report.userEmail && (
                          <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                            <Mail className="h-3.5 w-3.5" />
                            {report.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {!paper ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                          Paper Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                          Active PYQ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      User Comment & Details
                    </p>
                    <div className="rounded-lg bg-red-50/50 p-4 border border-red-100/50 text-slate-700 dark:bg-red-950/10 dark:border-red-950/30 dark:text-slate-350 text-sm italic font-medium">
                      "{report.comment}"
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-end">
                    <Button variant="secondary" onClick={() => dismissReport(report._id)} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Dismiss Report
                    </Button>
                    
                    {paper && (
                      <>
                        <Button variant="secondary" onClick={() => setPreviewPaper(paper)} className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          Preview PYQ
                        </Button>
                        <Button variant="danger" onClick={() => deletePaper(paper._id)} className="flex items-center gap-1.5">
                          <Trash2 className="h-4 w-4" />
                          Delete PYQ
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewPaper && <AdminMediaPreview paper={previewPaper} onClose={() => setPreviewPaper(null)} />}
    </section>
  );
}
