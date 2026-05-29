import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchPapers } from "../store/slices/paperSlice.js";
import { PaperCard } from "../components/papers/PaperCard.jsx";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { Button } from "../components/ui/Button.jsx";
import { SkeletonCard } from "../components/ui/SkeletonCard.jsx";
import AdSense from "../components/ads/AdSense.jsx";

export function SearchResults() {
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, status, page, pages, usingSamples } = useSelector((state) => state.papers);
  const [filters, setFilters] = useState(Object.fromEntries(params.entries()));

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
      dispatch(fetchPapers(filters));
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, dispatch, setParams]);

  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <section className="container-page py-8">
      <Helmet><title>Search Papers | PYQwithMe</title></Helmet>
      <h1 className="text-3xl font-bold">Search Papers</h1>
      <p className="mt-2 text-slate-500">Use live filters to find the exact exam paper you need.</p>
      <div className="mt-6"><SearchFilters filters={filters} onChange={setFilters} /></div>
      {usingSamples && <p className="mt-4 rounded-md bg-brand-50 p-3 text-sm text-brand-700">Preview mode: showing sample PYQ cards until real approved papers are available.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {status === "loading" ? skeletons.map((_, index) => <SkeletonCard key={index} />) : items.map((paper) => <PaperCard key={paper._id} paper={paper} />)}
      </div>
      <div className="mt-8">
        <AdSense className="mx-auto max-w-3xl" />
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setFilters({ ...filters, page: page - 1 })}>Previous</Button>
        <span className="rounded-md px-4 py-2 text-sm text-slate-500">Page {page} of {pages || 1}</span>
        <Button variant="secondary" disabled={page >= pages} onClick={() => setFilters({ ...filters, page: page + 1 })}>Next</Button>
      </div>
    </section>
  );
}
