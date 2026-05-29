import { Search } from "lucide-react";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shifts = ["Shift 1", "Shift 2", "Shift 3"];
const years = Array.from({ length: 16 }, (_, index) => new Date().getFullYear() - index);

export function SearchFilters({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value, page: 1 });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          value={filters.examName || ""}
          onChange={(e) => update("examName", e.target.value)}
          placeholder="Search by exam name"
          className="focus-ring w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <select className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.year || ""} onChange={(e) => update("year", e.target.value)}>
          <option value="">Year</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <select className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.month || ""} onChange={(e) => update("month", e.target.value)}>
          <option value="">Month</option>
          {months.map((month) => <option key={month}>{month}</option>)}
        </select>
        <select className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.week || ""} onChange={(e) => update("week", e.target.value)}>
          <option value="">Week</option>
          {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => <option key={week}>{week}</option>)}
        </select>
        <select className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={filters.shift || ""} onChange={(e) => update("shift", e.target.value)}>
          <option value="">Shift</option>
          {shifts.map((shift) => <option key={shift}>{shift}</option>)}
        </select>
        <input className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Subject" value={filters.subject || ""} onChange={(e) => update("subject", e.target.value)} />
        <input className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Branch (optional)" value={filters.branch || ""} onChange={(e) => update("branch", e.target.value)} />
      </div>
    </div>
  );
}
