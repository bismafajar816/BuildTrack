// pages/team/browse.js
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
};

const ROLE_OPTIONS = [
  { value: "project_manager", label: "Project Manager" },
  { value: "site_engineer", label: "Site Engineer" },
];

function BrowseTeamContent() {
  const { user } = useAuth();

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "",
    project_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Projects for dropdown
  const [projects, setProjects] = useState([]);

  // Fetch team and projects
  async function loadTeam() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/auth/team");
      setTeam(data.team);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load team.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }

  useEffect(() => {
    loadTeam();
    loadProjects();
  }, []);

  // Project options for filter
  const projectOptions = useMemo(() => {
    const projs = new Set();
    team.forEach((member) => {
      if (member.project_name?.trim()) {
        projs.add(member.project_name);
      }
    });
    return Array.from(projs).sort();
  }, [team]);

  // Filtered team
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter
        ? member.project_name === projectFilter
        : true;
      return matchesSearch && matchesProject;
    });
  }, [team, searchTerm, projectFilter]);

  function clearFilters() {
    setSearchTerm("");
    setProjectFilter("");
  }

  // ─── Edit handlers ──────────────────────────────────────────────────────
  function handleEditClick(member) {
    setEditMember(member);
    setEditForm({
      full_name: member.full_name,
      role: member.role,
      project_id: member.project_id || "",
    });
    setEditError("");
    setShowEditModal(true);
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.full_name.trim()) {
      setEditError("Full name is required.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await api.patch(`/auth/team/${editMember.id}`, {
        full_name: editForm.full_name,
        role: editForm.role,
        project_id: editForm.project_id || null,
      });
      setShowEditModal(false);
      loadTeam(); // refresh list
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update member.");
    } finally {
      setEditLoading(false);
    }
  }

  // ─── Delete / Reactivate ──────────────────────────────────────────────
  async function handleDeleteClick(member) {
    if (!confirm(`Are you sure you want to deactivate ${member.full_name}?`)) return;
    try {
      await api.delete(`/auth/team/${member.id}`);
      loadTeam();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate member.");
    }
  }

  async function handleReactivateClick(member) {
    if (!confirm(`Reactivate ${member.full_name}?`)) return;
    try {
      await api.patch(`/auth/team/${member.id}/reactivate`);
      loadTeam();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reactivate member.");
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">All team members</h2>
            <p className="text-gray-500">
              Search, filter, and manage everyone in your company.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
          >
            ← Back to manage
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by name or email
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. John or john@..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div className="w-48">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              id="project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-white"
            >
              <option value="">All projects</option>
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>

        {/* Team list */}
        <h3 className="font-semibold text-gray-800 mb-3">
          {filteredTeam.length} member{filteredTeam.length !== 1 ? "s" : ""}
        </h3>

        {loading && <p className="text-sm text-gray-500">Loading team...</p>}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}
        {!loading && !error && filteredTeam.length === 0 && (
          <p className="text-sm text-gray-500">
            {team.length === 0
              ? "No team members have been added yet."
              : "No members match your filters."}
          </p>
        )}

        <div className="space-y-3">
          {filteredTeam.map((member) => {
            const isSelf = user && user.id === member.id;
            const isAdmin = member.role === "admin";
            const showActions = !isAdmin && !isSelf;

            return (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{member.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {member.email}
                    {member.project_name && ` · ${member.project_name}`}
                    {!member.is_active && " · (inactive)"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs uppercase tracking-wide text-navy bg-navy/5 rounded px-2 py-0.5 whitespace-nowrap">
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                  {showActions && (
                    <>
                      {member.is_active ? (
                        <>
                          <button
                            onClick={() => handleEditClick(member)}
                            className="bg-navy text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="bg-red-600 text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 transition"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivateClick(member)}
                          className="bg-green-600 text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 transition"
                        >
                          Reactivate
                        </button>
                      )}
                    </>
                  )}
                  {isSelf && (
                    <span className="text-xs text-gray-400 italic">(you)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ─── Edit Modal ─────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit team member</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-white"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="project_id"
                  value={editForm.project_id}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-white"
                >
                  <option value="">No project assigned</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  {editLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowseTeam() {
  return (
    <ProtectedRoute>
      <BrowseTeamContent />
    </ProtectedRoute>
  );
}