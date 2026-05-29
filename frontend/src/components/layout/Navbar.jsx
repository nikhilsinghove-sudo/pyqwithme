import { Moon, Search, Sun, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../store/slices/uiSlice.js";

export function Navbar() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui.darkMode);
  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-brand-600 dark:text-slate-300"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-brand-600">PYQwithMe</Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navClass} end>Home</NavLink>
          <NavLink to="/search" className={navClass}><Search className="mr-1 inline h-4 w-4" />Search</NavLink>
          <NavLink to="/about" className={navClass}>About Us</NavLink>
          <NavLink to="/contact" className={navClass}>Contact Us</NavLink>
          <div className="relative">
            {/* Single symbol that toggles upload/manage menu on click */}
            <UploadButton />
          </div>
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function UploadButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        title="Uploader"
      >
        <Upload className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-900" role="menu" aria-orientation="vertical">
          <div className="py-1">
            <NavLink to="/upload" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200" onClick={() => setOpen(false)}>Upload</NavLink>
            <NavLink to="/manage-upload" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200" onClick={() => setOpen(false)}>Manage Upload</NavLink>
          </div>
        </div>
      )}
    </div>
  );
}
