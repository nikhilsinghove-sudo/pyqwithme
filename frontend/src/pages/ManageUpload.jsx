import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Trash2, Edit, Eye } from "lucide-react";
import { api } from "../api/axiosClient.js";
import { Button } from "../components/ui/Button.jsx";

export function ManageUpload() {
  const [credentials, setCredentials] = useState({ email: "", uploadPassword: "" });
  const [papers, setPapers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  async function verify(event) {
    event.preventDefault();
    try {
      setError("");
      const payload = { email: String(credentials.email || "").trim().toLowerCase(), uploadPassword: String(credentials.uploadPassword || "").trim() };
      const { data } = await api.post("/papers/owner/list", payload);
      const list = data.papers || [];
      setPapers(list);
      if (list.length > 0) {
        setIsVerified(true);
      } else {
        setError("No uploads found with these credentials.");
      }
      setMessage("");
    } catch (err) {
      if (err.response?.status === 403) setError("Invalid email or upload password");
      else setError(err.response?.data?.message || "Could not verify uploads.");
    }
  }

  function handleSignOut() {
    setIsVerified(false);
    setPapers([]);
    setCredentials({ email: "", uploadPassword: "" });
    setMessage("");
    setError("");
  }

  function startEdit(paper) {
    setEditingId(paper._id);
    setEditingData({ examName: paper.examName, year: paper.year, month: paper.month, week: paper.week, shift: paper.shift, subject: paper.subject, branch: paper.branch || "" });
  }

  async function saveEdit(event) {
    event.preventDefault();
    try {
      setError("");
      const payload = { ...editingData, email: String(credentials.email || "").trim().toLowerCase(), uploadPassword: String(credentials.uploadPassword || "").trim() };
      const { data } = await api.patch(`/papers/${editingId}/owner`, payload);
      setMessage(data.message || "Saved.");
      // refresh list
      const list = await api.post("/papers/owner/list", { email: String(credentials.email || "").trim().toLowerCase(), uploadPassword: String(credentials.uploadPassword || "").trim() });
      setPapers(list.data.papers || []);
      setEditingId(null);
    } catch (err) {
      if (err.response?.status === 403) setError("Invalid email or upload password");
      else setError(err.response?.data?.message || "Could not save changes.");
    }
  }

  async function remove(id) {
    if (!confirm('Delete this upload? This action cannot be undone.')) return;
    const emailTrim = String(credentials.email || '').trim();
    const pwTrim = String(credentials.uploadPassword || '').trim();
    if (!emailTrim || !pwTrim) {
      setError('Enter your email and upload password at the top before deleting.');
      return;
    }
    try {
      setError("");
      const payload = { email: emailTrim.toLowerCase(), uploadPassword: pwTrim };
      await api.post(`/papers/${id}/owner/delete`, payload);
      const list = await api.post("/papers/owner/list", payload);
      const updated = list.data.papers || [];
      setPapers(updated);
      setMessage("Upload deleted.");
      if (updated.length === 0) {
        setIsVerified(false);
      }
    } catch (err) {
      if (err.response?.status === 403) setError("Invalid email or upload password for this paper.");
      else if (err.response?.status === 404) setError("Paper not found. Refresh your list and try again.");
      else setError(err.response?.data?.message || "Could not delete upload.");
    }
  }

  return (
    <section className="container-page py-8">
      <Helmet><title>Manage Upload | PYQwithMe</title></Helmet>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Your Uploads</h1>
            {isVerified ? (
              <p className="mt-2 text-slate-500">
                Showing uploads for <span className="font-semibold text-slate-700 dark:text-slate-300">{credentials.email}</span>
              </p>
            ) : (
              <p className="mt-2 text-slate-500">
                Enter the same email and upload password shown after you uploaded a paper. Each upload has its own password.
              </p>
            )}
          </div>
          {isVerified && (
            <Button variant="secondary" onClick={handleSignOut}>
              Manage different uploads
            </Button>
          )}
        </div>

        {!isVerified ? (
          <form onSubmit={verify} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold">Find Your Uploads</h2>
              <p className="mt-1 text-sm text-slate-500">Use the password from that upload&apos;s confirmation screen.</p>
            </div>
            {["email", "uploadPassword"].map((field) => (
              <label key={field} className="text-sm font-semibold capitalize">
                {field.replace(/([A-Z])/g, " $1")}
                <input required value={credentials[field]} onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              </label>
            ))}
            <Button>Verify Uploads</Button>
          </form>
        ) : null}

        {message && <div className="mt-4 rounded-md bg-brand-50 p-3 text-brand-700">{message}</div>}
        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>}

        {isVerified && (
          <div className="mt-6 grid gap-4">
            {papers.map((p) => (
              <div key={p._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{p.examName} — {p.subject || 'General'}</h3>
                    <p className="text-sm text-slate-500">{p.year} • {p.month} • {p.shift}</p>
                    <p className="mt-2 text-sm">Status: <span className="font-medium">{p.status}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => window.open(p.pdfUrl, "_blank") }><Eye className="h-4 w-4" />Preview</Button>
                    <Button variant="secondary" onClick={() => startEdit(p)}><Edit className="h-4 w-4" />Edit</Button>
                    <Button type="button" variant="danger" onClick={() => remove(p._id)}><Trash2 className="h-4 w-4" />Delete</Button>
                  </div>
                </div>

                {editingId === p._id && (
                  <form onSubmit={saveEdit} className="mt-4 grid gap-3">
                    {['examName','year','month','week','shift','subject','branch'].map((field) => (
                      <label key={field} className="text-sm font-semibold capitalize">
                        {field}{(field === 'subject' || field === 'branch') ? <span className="font-normal text-slate-400"> (optional)</span> : null}
                        <input value={editingData[field] || ''} onChange={(e) => setEditingData({ ...editingData, [field]: e.target.value })} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                      </label>
                    ))}
                    <div className="flex gap-3">
                      <Button>Save</Button>
                      <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
