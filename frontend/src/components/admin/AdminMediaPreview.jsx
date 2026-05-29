import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { api } from "../../api/axiosClient.js";

export function AdminMediaPreview({ paper, onClose, showUploaderEmail = false }) {
  const [blobUrl, setBlobUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isImage = paper?.mediaType === "image" || paper?.mimeType?.startsWith("image/");

  useEffect(() => {
    if (!paper?._id) return undefined;

    let active = true;
    let objectUrl = "";

    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/admin/papers/${paper._id}/preview`, { responseType: "blob" });
        objectUrl = URL.createObjectURL(data);
        if (active) setBlobUrl(objectUrl);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Could not load preview.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [paper?._id]);

  if (!paper) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="font-bold">{paper.examName} — {paper.subject || "General"}</h2>
            <p className="text-xs text-slate-500">
              {isImage ? "Image" : "PDF"}
              {showUploaderEmail && paper.uploadedEmail ? ` • ${paper.uploadedEmail}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700" aria-label="Close preview">
            ✕
          </button>
        </div>
        <div className="relative flex min-h-[60vh] flex-1 items-center justify-center overflow-auto bg-slate-100 p-2">
          {loading && (
            <div className="text-center">
              <Loader className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p className="text-sm text-slate-600">Loading preview...</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && blobUrl && (
            isImage ? (
              <img src={blobUrl} alt={`${paper.examName} preview`} className="max-h-[75vh] max-w-full object-contain" />
            ) : (
              <iframe title="Admin preview" src={`${blobUrl}#toolbar=1`} className="h-[75vh] w-full border-0" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
