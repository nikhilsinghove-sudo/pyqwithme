import { BarChart3, FileCheck, FileClock, LayoutDashboard, LogOut, Settings, BookOpen, Sparkles, ShieldAlert } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/adminSlice.js";

export function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;

  function handleLogout() {
    dispatch(logout());
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
        <h1 className="mb-6 text-xl font-bold text-brand-600">PYQ Admin</h1>
        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
          <NavLink to="/admin/pending" className={linkClass}><FileClock className="h-4 w-4" />Pending Uploads</NavLink>
          <NavLink to="/admin/approved" className={linkClass}><FileCheck className="h-4 w-4" />Approved Papers</NavLink>
          <NavLink to="/admin/branding" className={linkClass}><BookOpen className="h-4 w-4" />Pages & Branding</NavLink>
          <NavLink to="/admin/poems" className={linkClass}><Sparkles className="h-4 w-4" />Motivational Poems</NavLink>
          <NavLink to="/admin/analytics" className={linkClass}><BarChart3 className="h-4 w-4" />Analytics</NavLink>
          <NavLink to="/admin/reports" className={linkClass}><ShieldAlert className="h-4 w-4" />User Reports</NavLink>
          <NavLink to="/admin/settings" className={linkClass}><Settings className="h-4 w-4" />Settings</NavLink>
        </nav>
        <button onClick={handleLogout} className="mt-8 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </aside>
      <main className="md:pl-64">
        <div className="container-page py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
