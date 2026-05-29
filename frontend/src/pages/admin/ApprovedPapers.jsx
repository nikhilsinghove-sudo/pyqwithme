import { useEffect, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { api } from "../../api/axiosClient.js";
import { Button } from "../../components/ui/Button.jsx";
import { AdminMediaPreview } from "../../components/admin/AdminMediaPreview.jsx";

export function ApprovedPapers() {
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");
  const [previewPaper, setPreviewPaper] = useState(null);
  const [showUploaderEmail, setShowUploaderEmail] = useState(false);

  async function load() {
    const { data } = await api.get("/admin/papers", { params: { status: "approved", search, limit: 50 } });
    setPapers(data.papers || []);
  }

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setShowUploaderEmail(Boolean(data.settings?.showUploaderInfo));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  async function remove(id) {
    if (!confirm("Delete this approved paper from the site? This cannot be undone.")) return;
    await api.delete(`/admin/papers/${id}`);
    load();
  }

  // Group papers by examName and year
  const groupedPapers = papers.reduce((acc, paper) => {
    const key = `${paper.examName} - ${paper.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(paper);
    return acc;
  }, {});

  // Sort grouped keys: alphabetically by examName, then chronologically descending by year
  const sortedGroupKeys = Object.keys(groupedPapers).sort((a, b) => {
    const [examA, yearA] = a.split(" - ");
    const [examB, yearB] = b.split(" - ");
    if (examA !== examB) {
      return examA.localeCompare(examB);
    }
    return Number(yearB) - Number(yearA);
  });

  return (
    <section className="animate-fade-in">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Approved Papers</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View and delete papers that are already live on the site.</p>
      <div className="relative mt-5 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by exam, subject, or email"
          className="focus-ring w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      {sortedGroupKeys.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No approved papers found.
        </div>
      ) : (
        sortedGroupKeys.map((key) => {
          const groupPapers = groupedPapers[key];
          return (
            <div key={key} className="mt-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{key}</h2>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
                  {groupPapers.length} paper{groupPapers.length > 1 ? "s" : ""} live
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        {["Subject", "Shift/Month", "Type", ...(showUploaderEmail ? ["Uploader email"] : []), "Downloads", "Actions"].map((head) => (
                          <th key={head} className="px-4 py-3 text-left font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {groupPapers.map((paper) => {
                        const isImage = paper.mediaType === "image" || paper.mimeType?.startsWith("image/");
                        return (
                          <tr key={paper._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20">
                            <td className="px-4 py-3 font-semibold">{paper.subject || "General"}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {paper.shift || "N/A"} - {paper.month || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
                                {isImage ? "Image" : "PDF"}
                              </span>
                            </td>
                            {showUploaderEmail && <td className="px-4 py-3 text-slate-600">{paper.uploadedEmail}</td>}
                            <td className="px-4 py-3 text-slate-655 text-slate-500 dark:text-slate-400">{paper.downloads || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" onClick={() => setPreviewPaper(paper)} className="flex items-center gap-1"><Eye className="h-4 w-4" />View</Button>
                                <Button variant="danger" onClick={() => remove(paper._id)} className="flex items-center gap-1"><Trash2 className="h-4 w-4" />Delete</Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}
      {previewPaper && <AdminMediaPreview paper={previewPaper} showUploaderEmail={showUploaderEmail} onClose={() => setPreviewPaper(null)} />}
    </section>
  );
}
