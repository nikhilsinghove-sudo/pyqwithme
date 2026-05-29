import { BarChart3, FileCheck, FileClock, LayoutDashboard, LogOut, Settings, BookOpen, Sparkles, ShieldAlert, Menu, X } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/adminSlice.js";
import { useState } from "react";

export function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;

  function handleLogout() {
    dispatch(logout());
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold text-brand-600">PYQ Admin</span>
        </div>
      </header>

      {/* Sidebar Backdrop Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-brand-600">PYQ Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setSidebarOpen(false)}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
          <NavLink to="/admin/pending" className={linkClass} onClick={() => setSidebarOpen(false)}><FileClock className="h-4 w-4" />Pending Uploads</NavLink>
          <NavLink to="/admin/approved" className={linkClass} onClick={() => setSidebarOpen(false)}><FileCheck className="h-4 w-4" />Approved Papers</NavLink>
          <NavLink to="/admin/branding" className={linkClass} onClick={() => setSidebarOpen(false)}><BookOpen className="h-4 w-4" />Pages & Branding</NavLink>
          <NavLink to="/admin/poems" className={linkClass} onClick={() => setSidebarOpen(false)}><Sparkles className="h-4 w-4" />Motivational Poems</NavLink>
          <NavLink to="/admin/analytics" className={linkClass} onClick={() => setSidebarOpen(false)}><BarChart3 className="h-4 w-4" />Analytics</NavLink>
          <NavLink to="/admin/reports" className={linkClass} onClick={() => setSidebarOpen(false)}><ShieldAlert className="h-4 w-4" />User Reports</NavLink>
          <NavLink to="/admin/settings" className={linkClass} onClick={() => setSidebarOpen(false)}><Settings className="h-4 w-4" />Settings</NavLink>
        </nav>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <LogOut className="h-4 w-4" />Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:pl-64">
        <div className="container-page py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
