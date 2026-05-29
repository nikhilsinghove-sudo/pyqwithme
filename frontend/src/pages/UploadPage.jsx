import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { UploadCloud } from "lucide-react";
import { uploadPaper, clearUploadResult } from "../store/slices/paperSlice.js";
import { Button } from "../components/ui/Button.jsx";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 16 }, (_, index) => new Date().getFullYear() - index);
const commonSubjects = [
  "Physics", "Chemistry", "Biology", "Mathematics",
  "English", "Hindi", "Social Studies", "Computer Science",
  "Quantitative Aptitude", "Reasoning", "General Knowledge",
  "General Studies", "Organic Chemistry", "Inorganic Chemistry",
  "Physical Chemistry", "Botany", "Zoology", "Economics",
  "History", "Geography", "Political Science", "Philosophy"
];

export function UploadPage() {
  const dispatch = useDispatch();
  const { uploadResult } = useSelector((state) => state.papers);
  const [uploader, setUploader] = useState({ uploadedEmail: "", uploadPassword: "" });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [form, setForm] = useState({ examName: "", year: years[0], month: "", week: "", shift: "", subject: "", branch: "", file: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function unlockUpload(event) {
    event.preventDefault();
    setError("");
    if (uploader.uploadPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsUnlocked(true);
  }

  function handleUploadAnother() {
    dispatch(clearUploadResult());
    setForm({ examName: "", year: years[0], month: "", week: "", shift: "", subject: "", branch: "", file: null });
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    
    // Frontend validation
    if (!form.examName.trim()) {
      setError("Please enter exam name");
      return;
    }
    if (!form.month) {
      setError("Please select month");
      return;
    }
    if (!form.week) {
      setError("Please select week");
      return;
    }
    if (!form.shift) {
      setError("Please select shift");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!form.file) {
      setError("Please upload a PDF or image file");
      return;
    }
    if (!allowedTypes.includes(form.file.type)) {
      setError("Only PDF and image files (JPG, PNG, WEBP, GIF) are allowed");
      return;
    }
    if (form.file.size > 15 * 1024 * 1024) {
      setError("File must be smaller than 15MB");
      return;
    }
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append("uploadedEmail", uploader.uploadedEmail);
    formData.append("uploadPassword", uploader.uploadPassword);
    Object.entries(form).forEach(([key, value]) => {
      if (key === "file") formData.append("file", value);
      else if (value !== null && value !== undefined) formData.append(key, value);
    });
    const result = await dispatch(uploadPaper(formData));
    if (result.meta.requestStatus === "rejected") {
      setError(result.payload || result.error.message || "Upload failed. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <section className="container-page py-8">
      <Helmet><title>Upload Paper | PYQwithMe</title></Helmet>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Upload a Paper</h1>
        <p className="mt-2 text-slate-500">Enter your email and upload password first. Use the same password later to edit or delete your upload.</p>
        <p className="mt-1 text-sm text-slate-500">For the same exam, year, month, and shift, only 5 pending uploads are kept. When admin approves one, the other pending duplicates are removed automatically.</p>
        
        {uploadResult ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 text-green-800 shadow-soft dark:border-green-900/30 dark:bg-green-950/20">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-300">✓ Upload Successful!</h2>
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">{uploadResult.message}</p>
            
            <div className="mt-4 grid gap-3 rounded-md bg-white p-4 border border-green-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm">
                <strong>Paper ID:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 dark:bg-slate-800 dark:text-slate-200">{uploadResult.paperId}</code>
              </p>
              <p className="text-sm">
                <strong>Upload Password:</strong> <code className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold dark:bg-slate-800 dark:text-brand-300">{uploadResult.uploadPassword}</code>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ⚠️ Write this password down! You will need it and your email to edit or delete your upload.
              </p>
            </div>

            {uploadResult.storageInfo && (
              <div className="mt-4 rounded border border-green-200 bg-white p-3 text-green-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <span>✓</span> {uploadResult.storageInfo}
                </p>
                <p className="mt-1 text-xs text-slate-500">Storage: {uploadResult.storageType === "cloudinary" ? "Cloudinary CDN (Secure & Fast)" : "Local Server"}</p>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={handleUploadAnother}><UploadCloud className="h-4 w-4" />Upload Another Paper</Button>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

            {!isUnlocked ? (
              <form onSubmit={unlockUpload} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h2 className="text-lg font-bold">Uploader Login</h2>
                  <p className="mt-1 text-sm text-slate-500">This is only for managing your upload. It does not create a public account.</p>
                </div>
                <Input label="Email" type="email" value={uploader.uploadedEmail} onChange={(v) => setUploader({ ...uploader, uploadedEmail: v })} />
                <Input label="Upload password" type="password" value={uploader.uploadPassword} onChange={(v) => setUploader({ ...uploader, uploadPassword: v })} />
                <Button className="w-full sm:w-auto">Continue to Upload</Button>
              </form>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-md bg-brand-50 p-3 text-sm text-brand-700 dark:bg-slate-800 dark:text-brand-100">
                  Uploading as <strong>{uploader.uploadedEmail}</strong>
                </div>
                <Input label="Exam name" value={form.examName} onChange={(v) => setForm({ ...form, examName: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Year" value={form.year} options={years} onChange={(v) => setForm({ ...form, year: v })} />
                  <Select label="Month" value={form.month} options={months} onChange={(v) => setForm({ ...form, month: v })} />
                  <Select label="Week" value={form.week} options={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]} onChange={(v) => setForm({ ...form, week: v })} />
                  <Select label="Shift" value={form.shift} options={["Shift 1", "Shift 2", "Shift 3"]} onChange={(v) => setForm({ ...form, shift: v })} />
                </div>
                <label className="text-sm font-semibold">
                  Subject <span className="font-normal text-slate-400">(optional)</span>
                  <input type="text" list="subjects" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                  <datalist id="subjects">
                    {commonSubjects.map((subject) => <option key={subject} value={subject} />)}
                  </datalist>
                </label>

                <label className="text-sm font-semibold">
                  Branch name <span className="font-normal text-slate-400">(optional)</span>
                  <input type="text" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Computer Science" className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
                </label>
                <label className="text-sm font-semibold">
                  Paper file (PDF or image)
                  <input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" className="focus-ring mt-2 w-full rounded-md border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-950" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
                </label>
                <p className="text-xs text-slate-500">Accepted: PDF, JPG, PNG, WEBP, GIF (max 15MB)</p>
                <Button disabled={submitting} className="w-full sm:w-auto"><UploadCloud className="h-4 w-4" />{submitting ? "Uploading..." : "Submit for Review"}</Button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select required value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
