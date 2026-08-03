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
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">BuildTrack</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user.full_name} · {ROLE_LABELS[user.role]}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user.full_name.split(" ")[0]}
        </h2>
        <p className="text-gray-500 mb-8">
          This is your BuildTrack workspace. Project and reporting modules will appear here in the next phase.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-1">Projects</h3>
            <p className="text-sm text-gray-500">Coming in Phase 2: create and manage construction sites.</p>
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
