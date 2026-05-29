import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Award } from "lucide-react";
import { api } from "../../api/axiosClient.js";

export function Footer() {
  const [categories, setCategories] = useState(["JEE", "NEET", "UPSC", "SSC", "GATE", "CAT"]);
  const [copyright, setCopyright] = useState("© 2026 PYQwithMe. All rights reserved.");

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        if (data.settings?.copyrightText) setCopyright(data.settings.copyrightText);
        if (data.settings?.homeCategories) setCategories(data.settings.homeCategories.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-50 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800/80 transition-colors pt-12 pb-8">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-500">
        
        {/* Column 1: Brand Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <div className="rounded bg-brand-50 p-1.5 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PYQwithMe</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
            A dynamic, student-first platform designed to organize and distribute clean, moderated previous year question papers. Upload papers easily and prepare smarter.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200/50 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200/50 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 transition-all duration-300"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Explore Library */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Explore Library</h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home Page</Link></li>
            <li><Link to="/search" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Search Past Papers</Link></li>
            <li><Link to="/upload" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Upload a Paper</Link></li>
            <li><Link to="/manage-upload" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Manage Your Uploads</Link></li>
          </ul>
        </div>

        {/* Column 3: Dynamic Popular Exams */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Popular Exams</h3>
          <ul className="space-y-2.5 text-xs font-medium">
            {categories.map((exam) => (
              <li key={exam}>
                <Link to={`/search?examName=${exam}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  {exam} Question Papers
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Compliance & Portal */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Compliance & Portal</h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Our Mission</Link></li>
            <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/disclaimer" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Disclaimer Statement</Link></li>
            <li className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex">
              <Link to="/admin/login" className="hover:text-brand-600 dark:hover:text-brand-400 font-bold transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span>🔐</span> Admin Portal
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Separator & Copyright Branding */}
      <div className="container-page mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400/80">
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
