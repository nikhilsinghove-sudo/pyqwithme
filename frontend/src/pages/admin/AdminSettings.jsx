import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { api } from "../../api/axiosClient.js";
import { Button } from "../../components/ui/Button.jsx";

const defaultCategories = ["JEE", "NEET", "UPSC", "SSC", "GATE", "CAT"];

export function AdminSettings() {
  const [categoriesText, setCategoriesText] = useState(defaultCategories.join(", "));
  const [showUploaderInfo, setShowUploaderInfo] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setCategoriesText((data.settings?.homeCategories || defaultCategories).join(", "));
      setShowUploaderInfo(Boolean(data.settings?.showUploaderInfo));
    }).catch(() => {});
  }, []);

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const homeCategories = categoriesText.split(",").map((item) => item.trim()).filter(Boolean);

    if (!homeCategories.length) {
      setError("Add at least one exam name.");
      return;
    }

    try {
      const { data } = await api.patch("/settings", { homeCategories, showUploaderInfo });
      setCategoriesText(data.settings.homeCategories.join(", "));
      setShowUploaderInfo(Boolean(data.settings.showUploaderInfo));
      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save settings.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-brand-600 animate-spin-slow" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Home page</h2>
          <label className="mt-4 block text-sm font-semibold">
            Exam categories
            <textarea
              value={categoriesText}
              onChange={(event) => setCategoriesText(event.target.value)}
              rows={3}
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
            />
          </label>
          <p className="mt-2 text-sm text-slate-500">Separate exam names with commas, for example: NEET, JEE, UPSC.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Admin moderation</h2>
          <p className="mt-1 text-sm text-slate-500">Control what you see when reviewing and managing uploads.</p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showUploaderInfo}
              onChange={(e) => setShowUploaderInfo(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              Show uploader email
              <span className="mt-1 block font-normal text-slate-500">
                When enabled, the uploader&apos;s email appears in Pending Uploads and Approved Papers tables.
              </span>
            </span>
          </label>
        </div>

        {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button className="w-full sm:w-auto"><Save className="h-4 w-4" />Save Settings</Button>
      </form>
    </section>
  );
}
export default AdminSettings;
