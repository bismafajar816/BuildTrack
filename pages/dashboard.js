// pages/dashboard.js
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { AnalyticsOverview } from "./analytics";

const ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
};

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header – full width */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-navy via-[#183f73] to-[#1b4c86] shadow-lg shadow-slate-200">
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">Workspace</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back, {user.full_name.split(" ")[0]}
              </h1>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                {ROLE_LABELS[user.role]}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content – full width, two columns with swapped sizes */}
      <main className="px-4 pb-12 sm:px-6 lg:px-8">
        {/* Intro text – full width */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            This is your BuildTrack workspace. Project tracking and reporting tools are organized here for smooth day-to-day operations.
          </p>
        </div>

        {/* Two‑column grid: left column (1/3) for Projects & Reports, right (2/3) for Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column – spans 1 column on large screens */}
          <div className="lg:col-span-1 space-y-4">
            {/* Projects card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Projects</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Project overview</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-lg text-navy">📁</div>
              </div>
              <p className="mb-5 text-sm leading-6 text-slate-600">Create and manage your construction sites with a clearer view of active work and progress.</p>
              <Link
                href="/projects"
                className="inline-flex items-center rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                View projects
              </Link>
            </div>

            {/* Reports card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reports</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Daily reporting</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-lg text-navy">📝</div>
              </div>
              <p className="mb-5 text-sm leading-6 text-slate-600">Review project updates and submit daily reports without losing context across teams.</p>
              <Link
                href="/projects"
                className="inline-flex items-center rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Select project
              </Link>
            </div>
          </div>

          {/* Right column – spans 2 columns, contains Analytics */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Insights</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Analytics overview</h3>
                </div>
              </div>
              <AnalyticsOverview />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}