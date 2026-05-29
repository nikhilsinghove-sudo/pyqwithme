import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats } from "../../store/slices/adminSlice.js";
import {
  Users,
  UserCheck,
  Eye,
  Download,
  Share2,
  Globe,
  Activity,
  Copy,
  Check,
  Search,
  ExternalLink
} from "lucide-react";

export function AdminAnalytics() {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.admin.stats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchAdminStats())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm font-medium text-slate-500">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate return rate percentage
  const returnRate = stats?.totalVisitors > 0
    ? ((stats.returningVisitors / stats.totalVisitors) * 100).toFixed(1)
    : "0.0";

  return (
    <section className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time traffic details, user engagement, and paper statistics.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Live Monitoring
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalVisitors || 0}
          subtitle="Unique browser footprints"
          icon={Users}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          title="Returning Users"
          value={stats?.returningVisitors || 0}
          subtitle={`${returnRate}% total return rate`}
          icon={UserCheck}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Active Users Today"
          value={stats?.activeUsersToday || 0}
          subtitle="Visited in last 24 hours"
          icon={Activity}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          title="Total Approved Papers"
          value={stats?.totalApproved || 0}
          subtitle={`${stats?.totalPending || 0} pending review`}
          icon={Globe}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Visual Comparative Panels */}
      <div className="grid gap-6 md:grid-cols-3">
        <AnalyticsList
          title="Popular Papers (Most Viewed)"
          icon={Eye}
          items={(stats?.mostViewed || []).map((item) => ({
            label: `${item.examName} - ${item.subject}`,
            value: item.views || 0,
            id: item._id
          }))}
          metricLabel="views"
        />
        <AnalyticsList
          title="Most Downloaded Papers"
          icon={Download}
          items={(stats?.mostDownloaded || []).map((item) => ({
            label: `${item.examName} - ${item.subject}`,
            value: item.downloads || 0,
            id: item._id
          }))}
          metricLabel="downloads"
        />
        <AnalyticsList
          title="Most Shared Papers"
          icon={Share2}
          items={(stats?.mostShared || []).map((item) => ({
            label: `${item.examName} - ${item.subject}`,
            value: item.shares || 0,
            id: item._id
          }))}
          metricLabel="shares"
        />
      </div>

      {/* Searched Exams & Keywords Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsList
          title="Most Searched Exam Queries"
          icon={Search}
          items={(stats?.mostSearched || []).map((item) => ({
            label: item._id || "Generic Search",
            value: item.count || 0
          }))}
          metricLabel="searches"
        />
        
        {/* Quick Insights summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Globe className="h-5 w-5 text-brand-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Analytics Summary & Insights</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Loyalty Analysis</span>
              {stats?.returningVisitors > 0 ? (
                <p>
                  About <strong className="text-brand-600 dark:text-brand-400">{returnRate}%</strong> of your user base has returned for subsequent sessions. This demonstrates highly positive user stickiness and useful, recurring content.
                </p>
              ) : (
                <p>Not enough session telemetry to gauge loyalty metrics yet. Data will enrich as users browse additional papers.</p>
              )}
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">Content Strategy</span>
              <p>
                To drive downloads, prioritize gathering additional branches or shifts for subjects matching your **Popular Papers** list above. Highly shared papers indicate viral peer-to-peer distribution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed IP Address Traffic Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Traffic Logs by Hashed IP Address</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unique visits, pages browsed, device agents, and active time recorded securely.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Showing up to {stats?.visitorIPList?.length || 0} active nodes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">IP Hash (Anonymized)</th>
                <th className="px-6 py-4 text-center">Visits</th>
                <th className="px-6 py-4">Visited Public Paths</th>
                <th className="px-6 py-4">Device / Client</th>
                <th className="px-6 py-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(!stats?.visitorIPList || stats.visitorIPList.length === 0) ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No individual IP telemetry recorded yet.
                  </td>
                </tr>
              ) : (
                stats.visitorIPList.map((visitor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <IPHashRow hash={visitor._id || "anonymous-node-id"} />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
                        {visitor.visits}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                        {(visitor.paths || []).slice(0, 3).map((path, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono truncate"
                            title={path}
                          >
                            {path}
                          </span>
                        ))}
                        {visitor.paths?.length > 3 && (
                          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-400 dark:bg-slate-800">
                            +{visitor.paths.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate block max-w-[200px]"
                        title={visitor.userAgents?.join(" | ")}
                      >
                        {getReadableUA(visitor.userAgents?.[0])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(visitor.lastActive)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:scale-[1.01] hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-soft`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function AnalyticsList({ title, icon: Icon, items, metricLabel }) {
  const maxVal = items.length > 0 ? Math.max(...items.map((i) => i.value), 1) : 1;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md flex flex-col justify-between min-h-[280px]">
      <div>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          {Icon && <Icon className="h-5 w-5 text-brand-500" />}
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">{title}</h2>
        </div>
        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No telemetry recorded yet</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="group">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[70%]" title={item.label}>
                    {item.label}
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {item.value} <span className="text-[10px] font-normal text-slate-400">{metricLabel}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                    style={{ width: `${(item.value / maxVal) * 100}%` }}
                  />
                </div>
                {item.id && (
                  <a
                    href={`/papers/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    View details <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function IPHashRow({ hash }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
      <span className="truncate max-w-[120px] font-bold" title={hash}>
        {hash.slice(0, 14)}...
      </span>
      <button onClick={copy} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" title="Copy Hash">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 animate-scale-up" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

const getReadableUA = (uaString) => {
  if (!uaString) return "Unknown Browser";
  const str = String(uaString);
  if (str.includes("Firefox/")) return "Mozilla Firefox";
  if (str.includes("Edg/")) return "Microsoft Edge";
  if (str.includes("Chrome/")) return "Google Chrome";
  if (str.includes("Safari/")) return "Apple Safari";
  if (str.includes("Postman")) return "Postman Client";
  if (str.includes("Mobile")) return "Mobile Browser";
  return str.split(" ")[0] || "Standard Web Browser";
};

const formatTime = (dateStr) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";
  
  // Format beautifully: Time + Date
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${time}, ${day}`;
};
