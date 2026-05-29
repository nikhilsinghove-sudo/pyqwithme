import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart3, CheckCircle2, Clock, Cloud, Eye, FileText, Server } from "lucide-react";
import { fetchAdminStats, fetchCloudinaryStats } from "../../store/slices/adminSlice.js";

export function AdminDashboard() {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.admin.stats);
  const cloudinaryStats = useSelector((state) => state.admin.cloudinaryStats);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchCloudinaryStats());
  }, [dispatch]);

  return (
    <section>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={FileText} label="Total uploads" value={stats?.totalUploads || 0} />
        <Metric icon={CheckCircle2} label="Approved" value={stats?.totalApproved || 0} />
        <Metric icon={Clock} label="Pending" value={stats?.totalPending || 0} />
        <Metric icon={Eye} label="Visitors" value={stats?.totalVisitors || 0} />
        <Metric icon={BarChart3} label="Active today" value={stats?.activeUsersToday || 0} />
      </div>

      {/* Cloudinary Storage Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Storage & CDN Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StorageMetric 
            icon={Cloud} 
            label="Cloudinary" 
            value={cloudinaryStats?.cloudinaryCount || 0}
            color="blue"
          />
          <StorageMetric 
            icon={Server} 
            label="Local Server" 
            value={cloudinaryStats?.localCount || 0}
            color="gray"
          />
          <StorageMetric 
            icon={CheckCircle2} 
            label="Cloudinary Approved" 
            value={cloudinaryStats?.cloudinaryApproved || 0}
            color="green"
          />
          <StorageMetric 
            icon={BarChart3} 
            label="Cloudinary Downloads" 
            value={cloudinaryStats?.cloudinaryDownloads || 0}
            color="purple"
          />
        </div>
      </div>

      {/* Storage Distribution Pie Chart */}
      {cloudinaryStats?.storageDistribution && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Storage Distribution">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-blue-600" />
                  <span>Cloudinary</span>
                </div>
                <span className="font-bold">{cloudinaryStats.storageDistribution.cloudinary}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-600" />
                  <span>Local Server</span>
                </div>
                <span className="font-bold">{cloudinaryStats.storageDistribution.local}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-bold">{cloudinaryStats.storageDistribution.total}</span>
                </div>
              </div>
              {cloudinaryStats.storageDistribution.total > 0 && (
                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Cloudinary Usage</span>
                    <span>{Math.round((cloudinaryStats.storageDistribution.cloudinary / cloudinaryStats.storageDistribution.total) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div 
                      className="h-full bg-blue-600"
                      style={{width: `${(cloudinaryStats.storageDistribution.cloudinary / cloudinaryStats.storageDistribution.total) * 100}%`}}
                    />
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* Recent Cloudinary Uploads */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Most downloaded">
          {(stats?.mostDownloaded || []).map((paper) => (
            <Row key={paper._id} title={`${paper.examName} - ${paper.subject}`} value={`${paper.downloads} downloads`} />
          ))}
        </Panel>
        <Panel title="Recent Cloudinary Uploads">
          {(cloudinaryStats?.recentCloudinary || []).map((paper) => (
            <div key={paper._id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800">
              <div className="flex-1">
                <p className="font-medium">{paper.examName}</p>
                <p className="text-xs text-slate-500">{paper.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  paper.status === "approved" ? "bg-green-100 text-green-800" : 
                  paper.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                  "bg-red-100 text-red-800"
                }`}>
                  {paper.status}
                </span>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <Icon className="h-5 w-5 text-brand-600" />
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function StorageMetric({ icon: Icon, label, value, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    gray: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className={`inline-flex rounded-lg p-3 ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </div>
  );
}

function Row({ title, value }) {
  return <div className="flex justify-between gap-3 py-3 text-sm"><span>{title}</span><span className="text-slate-500">{value}</span></div>;
}
