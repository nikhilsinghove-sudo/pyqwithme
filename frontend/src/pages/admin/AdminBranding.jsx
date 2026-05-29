import { useEffect, useState } from "react";
import { Save, BookOpen } from "lucide-react";
import { api } from "../../api/axiosClient.js";
import { Button } from "../../components/ui/Button.jsx";

export function AdminBranding() {
  const [aboutUsText, setAboutUsText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [privacyPolicyText, setPrivacyPolicyText] = useState("");
  const [termsText, setTermsText] = useState("");
  const [disclaimerText, setDisclaimerText] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setAboutUsText(data.settings?.aboutUsText || "");
      setContactEmail(data.settings?.contactEmail || "");
      setContactLocation(data.settings?.contactLocation || "");
      setPrivacyPolicyText(data.settings?.privacyPolicyText || "");
      setTermsText(data.settings?.termsText || "");
      setDisclaimerText(data.settings?.disclaimerText || "");
      setCopyrightText(data.settings?.copyrightText || "");
    }).catch(() => {});
  }, []);

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const { data } = await api.patch("/settings", { 
        aboutUsText,
        contactEmail,
        contactLocation,
        privacyPolicyText,
        termsText,
        disclaimerText,
        copyrightText
      });
      setAboutUsText(data.settings.aboutUsText || "");
      setContactEmail(data.settings.contactEmail || "");
      setContactLocation(data.settings.contactLocation || "");
      setPrivacyPolicyText(data.settings.privacyPolicyText || "");
      setTermsText(data.settings.termsText || "");
      setDisclaimerText(data.settings.disclaimerText || "");
      setCopyrightText(data.settings.copyrightText || "");
      setMessage("Branding and page content saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save content settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-brand-600 animate-pulse" />
        <h1 className="text-3xl font-bold">Pages & Branding</h1>
      </div>

      <form onSubmit={save} className="max-w-4xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Footer Branding</h2>
          <p className="mt-1 text-sm text-slate-500">Edit the copyright branding text shown globally in your site footer.</p>
          <label className="mt-4 block text-sm font-semibold">
            Footer Copyright Text
            <input
              type="text"
              required
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
              placeholder="e.g. © 2026 PYQwithMe. All rights reserved."
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Public Header Pages</h2>
          <p className="mt-1 text-sm text-slate-500">Customize the rich text loaded dynamically on your header information pages.</p>
          
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              About Us Page Content
              <textarea
                value={aboutUsText}
                onChange={(e) => setAboutUsText(e.target.value)}
                rows={4}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                placeholder="Enter details about your platform purpose and mission..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Contact Email
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                  placeholder="e.g. support@pyqwithme.com"
                />
              </label>

              <label className="block text-sm font-semibold">
                Contact Location
                <input
                  type="text"
                  required
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                  className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                  placeholder="e.g. New Delhi, India"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Public Footer Pages</h2>
          <p className="mt-1 text-sm text-slate-500">Customize the compliance, legal, and informative pages linked in the footer.</p>
          
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold">
              Privacy Policy Page Content
              <textarea
                value={privacyPolicyText}
                onChange={(e) => setPrivacyPolicyText(e.target.value)}
                rows={4}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                placeholder="Describe your user privacy, anonymous upload diagnostic handling, etc..."
              />
            </label>

            <label className="block text-sm font-semibold">
              Terms & Conditions Page Content
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                rows={4}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                placeholder="Outline rules of usage, upload regulations, and content review terms..."
              />
            </label>

            <label className="block text-sm font-semibold">
              Disclaimer Page Content
              <textarea
                value={disclaimerText}
                onChange={(e) => setDisclaimerText(e.target.value)}
                rows={4}
                className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 font-normal"
                placeholder="Explain the source and copyrights of community-uploaded question papers..."
              />
            </label>
          </div>
        </div>

        {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <Button disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Branding & Pages"}
        </Button>
      </form>
    </section>
  );
}
export default AdminBranding;
