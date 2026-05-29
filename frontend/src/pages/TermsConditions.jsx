import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Scale } from "lucide-react";
import { api } from "../api/axiosClient.js";

export function TermsConditions() {
  const [content, setContent] = useState("");

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        setContent(data.settings?.termsText || "");
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container-page py-12 max-w-3xl">
      <Helmet><title>Terms & Conditions | PYQwithMe</title></Helmet>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="rounded-md bg-brand-50 p-2.5 text-brand-600 dark:bg-slate-800"><Scale className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="text-sm text-slate-500 mt-0.5">Rules and terms of usage</p>
          </div>
        </div>
        <div className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{content || "Loading terms and conditions..."}</p>
        </div>
      </div>
    </section>
  );
}
export default TermsConditions;
