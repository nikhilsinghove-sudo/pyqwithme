import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Info, HelpCircle } from "lucide-react";
import { api } from "../api/axiosClient.js";

export function AboutUs() {
  const [content, setContent] = useState("");

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        setContent(data.settings?.aboutUsText || "");
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container-page py-12 max-w-3xl">
      <Helmet><title>About Us | PYQwithMe</title></Helmet>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="rounded-md bg-brand-50 p-2.5 text-brand-600 dark:bg-slate-800"><Info className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
            <p className="text-sm text-slate-500 mt-0.5">Learn more about our platform mission</p>
          </div>
        </div>
        <div className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
            Simplifying exam prep, one paper at a time.
          </p>
          <p className="whitespace-pre-line">{content || "Loading about details..."}</p>
        </div>
      </div>
    </section>
  );
}
export default AboutUs;
