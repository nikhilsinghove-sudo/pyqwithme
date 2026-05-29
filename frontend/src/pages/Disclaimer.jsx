import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle } from "lucide-react";
import { api } from "../api/axiosClient.js";

export function Disclaimer() {
  const [content, setContent] = useState("");

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        setContent(data.settings?.disclaimerText || "");
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container-page py-12 max-w-3xl">
      <Helmet><title>Disclaimer | PYQwithMe</title></Helmet>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="rounded-md bg-brand-50 p-2.5 text-brand-600 dark:bg-slate-800"><AlertCircle className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1>
            <p className="text-sm text-slate-500 mt-0.5">Important content disclaimer statement</p>
          </div>
        </div>
        <div className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{content || "Loading disclaimer details..."}</p>
        </div>
      </div>
    </section>
  );
}
export default Disclaimer;
