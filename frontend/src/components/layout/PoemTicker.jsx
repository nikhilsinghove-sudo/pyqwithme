import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "../../api/axiosClient.js";

const fallbackPoems = [
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { content: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" }
];

export function PoemTicker() {
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    api.get("/poems")
      .then(({ data }) => {
        if (data?.poems?.length) {
          setPoems(data.poems);
        } else {
          setPoems(fallbackPoems);
        }
      })
      .catch(() => {
        setPoems(fallbackPoems);
      });
  }, []);

  if (poems.length === 0) return null;

  // Duplicate items to ensure a seamless infinite scrolling width
  const tickerItems = [...poems, ...poems, ...poems, ...poems];

  return (
    <div className="relative flex overflow-hidden border-b border-slate-100 bg-brand-50/50 py-2 text-sm dark:border-slate-800/80 dark:bg-slate-900/40 select-none">
      <div className="z-10 bg-[#f4f7fe] dark:bg-[#0c1328] px-4 font-bold text-brand-600 dark:text-brand-400 border-r border-slate-200/50 dark:border-slate-800 flex items-center shrink-0 gap-1.5 shadow-md">
        <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" />
        <span className="text-xs uppercase tracking-wider">Inspiration</span>
      </div>
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-slate-600 dark:text-slate-300 font-medium">
          {tickerItems.map((p, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <span className="italic">"{p.content}"</span>
              {p.author && (
                <span className="text-[11px] font-bold text-brand-500/80 dark:text-brand-400/80">
                  — {p.author}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
