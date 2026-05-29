import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Sparkles } from "lucide-react";
import { api } from "../../api/axiosClient.js";
import { Button } from "../../components/ui/Button.jsx";

export function AdminPoems() {
  const [poems, setPoems] = useState([]);
  const [poemForm, setPoemForm] = useState({ content: "", author: "" });
  const [editingPoemId, setEditingPoemId] = useState(null);
  const [poemSuccess, setPoemSuccess] = useState("");
  const [poemError, setPoemError] = useState("");
  const [loading, setLoading] = useState(false);

  function loadPoems() {
    setLoading(true);
    api.get("/poems")
      .then(({ data }) => setPoems(data.poems || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPoems();
  }, []);

  async function handleSavePoem(e) {
    e.preventDefault();
    setPoemError("");
    setPoemSuccess("");

    if (!poemForm.content.trim()) {
      setPoemError("Poem/Quote content is required.");
      return;
    }

    try {
      if (editingPoemId) {
        await api.patch(`/poems/${editingPoemId}`, poemForm);
        setPoemSuccess("Poem updated successfully.");
      } else {
        await api.post("/poems", poemForm);
        setPoemSuccess("Poem added successfully.");
      }
      setPoemForm({ content: "", author: "" });
      setEditingPoemId(null);
      loadPoems();
    } catch (err) {
      setPoemError(err.response?.data?.message || "Could not save poem.");
    }
  }

  function startEditPoem(poem) {
    setEditingPoemId(poem._id);
    setPoemForm({ content: poem.content, author: poem.author });
    setPoemError("");
    setPoemSuccess("");
  }

  function cancelEditPoem() {
    setEditingPoemId(null);
    setPoemForm({ content: "", author: "" });
    setPoemError("");
    setPoemSuccess("");
  }

  async function handleDeletePoem(id) {
    if (!confirm("Are you sure you want to delete this poem?")) return;
    setPoemError("");
    setPoemSuccess("");

    try {
      await api.delete(`/poems/${id}`);
      setPoemSuccess("Poem deleted successfully.");
      loadPoems();
    } catch (err) {
      setPoemError(err.response?.data?.message || "Could not delete poem.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-brand-600 animate-pulse" />
        <h1 className="text-3xl font-bold">Motivational Poems</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] max-w-6xl">
        {/* Add / Edit Inline Box */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 h-fit">
          <h2 className="text-lg font-bold flex items-center gap-1.5">
            {editingPoemId ? <Edit className="h-5 w-5 text-brand-600" /> : <Plus className="h-5 w-5 text-brand-600" />}
            {editingPoemId ? "Edit Poem / Quote" : "Add New Poem / Quote"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Quotes are automatically scrolled on the public home banner ticker.</p>

          <form onSubmit={handleSavePoem} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Poem/Quote Content
              <textarea
                rows={4}
                required
                placeholder="Enter quote or poem details here..."
                value={poemForm.content}
                onChange={(e) => setPoemForm({ ...poemForm, content: e.target.value })}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              Author Name
              <input
                type="text"
                placeholder="Author (e.g. Winston Churchill, or Anonymous)"
                value={poemForm.author}
                onChange={(e) => setPoemForm({ ...poemForm, author: e.target.value })}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
              />
            </label>
            
            {poemError && <p className="text-xs text-red-600 font-semibold">{poemError}</p>}
            {poemSuccess && <p className="text-xs text-green-600 font-semibold">{poemSuccess}</p>}

            <div className="flex gap-2">
              <Button className="py-2 px-4">{editingPoemId ? "Update Poem" : "Add Poem"}</Button>
              {editingPoemId && (
                <Button type="button" variant="secondary" onClick={cancelEditPoem}>
                  <X className="h-4 w-4 mr-0.5" />Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Active Poems List */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[550px]">
          <h2 className="text-lg font-bold">Active Public Banner Quotes ({poems.length})</h2>
          <p className="text-xs text-slate-500 mt-1">These poems are currently displayed on the infinite marquee beneath the header.</p>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1">
            {loading ? (
              <p className="text-sm text-slate-400 italic py-8 text-center">Loading active poems...</p>
            ) : poems.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-8 text-center">No custom quotes added. Running on standard defaults.</p>
            ) : (
              poems.map((poem) => (
                <div key={poem._id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic break-words">"{poem.content}"</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-semibold">— {poem.author}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditPoem(poem)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePoem(poem._id)}
                      className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export default AdminPoems;
