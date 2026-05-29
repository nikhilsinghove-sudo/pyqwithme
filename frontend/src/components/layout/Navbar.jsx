import { Moon, Search, Sun, Upload, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../store/slices/uiSlice.js";

export function Navbar() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui.darkMode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function onDoc() {
      setMobileMenuOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-brand-600 dark:text-slate-300"}`;

  const mobileNavClass = ({ isActive }) =>
    `block rounded-md px-4 py-2.5 text-base font-semibold transition ${isActive ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-brand-600">PYQwithMe</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navClass} end>Home</NavLink>
          <NavLink to="/search" className={navClass}><Search className="mr-1 inline h-4 w-4" />Search</NavLink>
          <NavLink to="/about" className={navClass}>About Us</NavLink>
          <NavLink to="/contact" className={navClass}>Contact Us</NavLink>
          <div className="relative">
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

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen((o) => !o);
            }}
            className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="border-t border-slate-100 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <NavLink to="/" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)} end>Home</NavLink>
            <NavLink to="/search" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)}><Search className="mr-2 inline h-4 w-4" />Search</NavLink>
            <NavLink to="/about" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
            <NavLink to="/contact" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)}>Contact Us</NavLink>
            <hr className="my-1 border-slate-100 dark:border-slate-800" />
            <NavLink to="/upload" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)}><Upload className="mr-2 inline h-4 w-4" />Upload Paper</NavLink>
            <NavLink to="/manage-upload" className={mobileNavClass} onClick={() => setMobileMenuOpen(false)}>Manage Upload</NavLink>
          </nav>
        </div>
      )}
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
