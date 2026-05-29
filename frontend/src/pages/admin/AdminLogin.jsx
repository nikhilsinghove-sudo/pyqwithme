import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { loginAdmin } from "../../store/slices/adminSlice.js";
import { Button } from "../../components/ui/Button.jsx";

export function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.admin.status);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const result = await dispatch(loginAdmin(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/admin/dashboard");
    if (result.meta.requestStatus === "rejected") setError(result.error.message || "Login failed");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Helmet><title>Admin Login | PYQwithMe</title></Helmet>
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-brand-50 p-3 text-brand-600 dark:bg-slate-800"><Lock className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-sm text-slate-500">One-person paper moderation</p>
          </div>
        </div>
        <label className="text-sm font-semibold">Email
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Password
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        </label>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button className="mt-6 w-full" disabled={status === "loading"}>{status === "loading" ? "Signing in..." : "Sign in"}</Button>
      </form>
    </main>
  );
}
