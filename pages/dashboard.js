import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
};

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Welcome back, {user.full_name.split(" ")[0]}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {ROLE_LABELS[user.role]}
            </span>
            <span className="hidden text-sm text-slate-500 sm:inline">{user.full_name}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-2 pb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user.full_name.split(" ")[0]}
        </h2>
        <p className="text-gray-500 mb-8">
          This is your BuildTrack workspace. Project and reporting modules will appear here in the next phase.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-1">Projects</h3>
            <p className="text-sm text-gray-500 mb-3">Create and manage your construction sites.</p>
            <Link
              href="/projects"
              className="inline-block text-sm bg-navy text-white rounded-md px-4 py-2 hover:opacity-90"
            >
              View projects
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-1">Daily Reports</h3>
            <p className="text-sm text-gray-500">Coming in Phase 2: submit and review daily site reports.</p>
          </div>

          {user.role === "admin" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 sm:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-1">Team Management</h3>
              <p className="text-sm text-gray-500 mb-3">
                Add project managers and site engineers to your company workspace.
              </p>
              <Link
                href="/team"
                className="inline-block text-sm bg-navy text-white rounded-md px-4 py-2 hover:opacity-90"
              >
                Manage team
              </Link>
            </div>
          )}
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