// pages/team.js
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
};

function TeamContent() {
  const { user } = useAuth();

  // ─── Role check: if not admin, show message ──────────────────────────
  if (user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access restricted</h2>
          <p className="text-gray-600">
            Only administrators can access the team management page.
          </p>
        </div>
      </div>
    );
  }

  // ─── Admin only: full team management ────────────────────────────────
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "site_engineer",
    project_id: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsError, setProjectsError] = useState("");

  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState("");

  const emailIsInvalid = form.email.length > 0 && !emailRegex.test(form.email);
  const passwordIsInvalid = form.password.length > 0 && !passwordRegex.test(form.password);
  const isFormValid =
    form.fullName.trim() &&
    emailRegex.test(form.email) &&
    passwordRegex.test(form.password) &&
    !!form.project_id;

  async function loadProjects() {
    setProjectsError("");
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects);
    } catch (err) {
      setProjectsError(err.response?.data?.message || "Could not load your projects.");
    }
  }

  async function loadTeam() {
    setTeamLoading(true);
    setTeamError("");
    try {
      const { data } = await api.get("/auth/team");
      setTeam(data.team);
    } catch (err) {
      setTeamError(err.response?.data?.message || "Could not load the team.");
    } finally {
      setTeamLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
    loadTeam();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fix the highlighted fields before adding a team member.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await api.post("/auth/invite", form);
      setMessage(`${form.fullName} was added successfully.`);
      setForm({ fullName: "", email: "", password: "", role: "site_engineer", project_id: "" });
      loadTeam();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add team member.");
    } finally {
      setSubmitting(false);
    }
  }

  // Take only the first 3 members for the short list
  const displayedTeam = team.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Team management</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {message}
            </div>
          )}
          {projectsError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {projectsError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  emailIsInvalid
                    ? "border-red-500 focus:ring-red-200 bg-red-50"
                    : "border-gray-300 focus:ring-navy"
                }`}
                aria-invalid={emailIsInvalid}
              />
              {emailIsInvalid && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid email address.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                    passwordIsInvalid
                      ? "border-red-500 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:ring-navy"
                  }`}
                  aria-invalid={passwordIsInvalid}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🔓" : "🔒"}
                </button>
              </div>
              {passwordIsInvalid && (
                <p className="mt-1 text-xs text-red-600">
                  Minimum 8 characters with at least 1 number and 1 special character.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="site_engineer">Site Engineer</option>
                <option value="project_manager">Project Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="" disabled>
                  {projects.length === 0 ? "No projects yet — create one first" : "Select a project"}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Only projects in your own company are shown.
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add team member"}
            </button>
          </form>
        </div>

        {/* Current team heading with View whole team button */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Current team</h2>
          <Link
            href="/team/browse"
            className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            View whole team
          </Link>
        </div>

        {teamLoading && <p className="text-sm text-gray-500">Loading team...</p>}
        {teamError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {teamError}
          </div>
        )}
        {!teamLoading && !teamError && team.length === 0 && (
          <p className="text-sm text-gray-500">No team members yet.</p>
        )}

        <div className="space-y-2">
          {displayedTeam.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{member.full_name}</p>
                <p className="text-xs text-gray-500">
                  {member.email}
                  {member.project_name ? ` · ${member.project_name}` : ""}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-navy bg-navy/5 rounded px-2 py-0.5">
                {ROLE_LABELS[member.role] || member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <ProtectedRoute>
      <TeamContent />
    </ProtectedRoute>
  );
}