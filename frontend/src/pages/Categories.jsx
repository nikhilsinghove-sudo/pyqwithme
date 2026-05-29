import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/axiosClient.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data.settings?.homeCategories?.length) setCategories(data.settings.homeCategories);
      else setCategories(["JEE","NEET","UPSC","SSC","GATE","CAT"]);
    }).catch(() => setCategories(["JEE","NEET","UPSC","SSC","GATE","CAT"]));
  }, []);

  return (
    <section className="container-page py-10">
      <Helmet><title>Exam Categories | PYQwithMe</title></Helmet>
      <h1 className="text-2xl font-bold mb-4">Exam Categories</h1>
      <div className="grid gap-3">
        {categories.map((c) => (
          <Link to={`/search?examName=${c}`} key={c} className="flex items-center gap-3 rounded-md border border-slate-100 p-3 text-lg font-semibold hover:bg-brand-50 dark:border-slate-800">
            <FileText className="h-5 w-5 text-brand-600" />
            <span>{c}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
