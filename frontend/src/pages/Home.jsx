import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Download, FileText, Search, TrendingUp, UploadCloud, Users } from "lucide-react";
import { fetchPapers } from "../store/slices/paperSlice.js";
import { PaperCard } from "../components/papers/PaperCard.jsx";
import AdSense from "../components/ads/AdSense.jsx";
import { SkeletonCard } from "../components/ui/SkeletonCard.jsx";
import { Button } from "../components/ui/Button.jsx";
import { api } from "../api/axiosClient.js";
import { useState } from "react";

const categories = ["JEE", "NEET", "UPSC", "SSC", "GATE", "CAT"];

export function Home() {
  const dispatch = useDispatch();
  const { items, status, usingSamples } = useSelector((state) => state.papers);
  const [stats, setStats] = useState({ papers: 0, downloads: 0, exams: 0 });
  const [homeCategories, setHomeCategories] = useState(categories);

  useEffect(() => {
    dispatch(fetchPapers({ limit: 8 }));
    api.get("/analytics/public-stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/settings").then(({ data }) => {
      if (data.settings?.homeCategories?.length) setHomeCategories(data.settings.homeCategories);
    }).catch(() => {});
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>PYQwithMe | Previous Year Question Papers</title>
        <meta name="description" content="Search, view, download, and upload previous year question papers with admin-reviewed quality." />
      </Helmet>
      <section className="border-b border-slate-100 bg-gradient-to-b from-brand-50 to-white py-16 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-md bg-white px-3 py-1 text-sm font-semibold text-brand-600 shadow-sm dark:bg-slate-900">Admin-reviewed PYQ library</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-5xl">Find previous year papers faster, upload yours without login.</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">PYQwithMe keeps question papers searchable, clean, and moderated while making community uploads frictionless.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search"><Button><Search className="h-4 w-4" />Search Papers</Button></Link>
              <Link to="/upload"><Button variant="secondary"><UploadCloud className="h-4 w-4" />Upload Paper</Button></Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3">
              {homeCategories.slice(0, 4).map((exam) => (
                <Link key={exam} to={`/search?examName=${exam}`} className="flex items-center justify-between rounded-md border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-3 font-semibold"><FileText className="h-5 w-5 text-brand-600" />{exam}</span>
                  <span className="text-sm text-slate-500">Explore</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Exam Categories</h2>
          <Link to="/categories" className="text-sm font-semibold text-brand-600">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {homeCategories.map((category) => (
            <Link key={category} to={`/search?examName=${category}`} className="rounded-lg border border-slate-200 p-4 text-center font-semibold shadow-sm transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-800">
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <AdSense className="mx-auto max-w-3xl" />
      </section>

      <section className="container-page py-10">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-600" />
          <h2 className="text-2xl font-bold">Trending & Recent Uploads</h2>
        </div>
        {usingSamples && <p className="mb-4 text-sm text-slate-500">Showing sample PYQ cards for preview. Real uploads will appear here after backend data is available.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {status === "loading" ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />) : items.map((paper) => <PaperCard key={paper._id} paper={paper} />)}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          <Stat icon={BookOpen} label="Approved papers" value={stats.papers} />
          <Stat icon={Download} label="Downloads" value={stats.downloads} />
          <Stat icon={Users} label="Exam categories" value={stats.exams} />
        </div>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-soft dark:bg-slate-950">
      <Icon className="h-6 w-6 text-brand-600" />
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
