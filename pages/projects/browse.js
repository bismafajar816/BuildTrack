// pages/projects/browse.js
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  deactivated: "bg-gray-200 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS = {
  active: "Active",
  deactivated: "Deactivated",
  completed: "Completed",
};

function BrowseProjectsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", location: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Per-row action state (disables buttons on the row being updated)
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch all projects
  async function loadProjects() {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // Derive unique cities from projects (ignore empty/null)
  const cityOptions = useMemo(() => {
    const cities = new Set();
    projects.forEach((p) => {
      if (p.location?.trim()) cities.add(p.location.trim());
    });
    return Array.from(cities).sort();
  }, [projects]);

  // Filter projects based on search, city, and status
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter ? p.location?.trim() === cityFilter : true;
      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [projects, searchTerm, cityFilter, statusFilter]);

  // Reset filters
  function clearFilters() {
    setSearchTerm("");
    setCityFilter("");
    setStatusFilter("");
  }

  // ─── Edit handlers ──────────────────────────────────────────────────────
  function handleEditClick(project) {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      location: project.location || "",
    });
    setEditError("");
    setShowEditModal(true);
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setEditError("Project name is required.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await api.patch(`/projects/${editingProject.id}`, {
        name: editForm.name.trim(),
        location: editForm.location.trim() || null,
      });
      setShowEditModal(false);
      loadProjects(); // refresh list
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update project.");
    } finally {
      setEditLoading(false);
    }
  }

  // ─── Status transitions: active / deactivated / completed ──────────────
  async function handleDeactivate(project) {
    if (!confirm(`Deactivate "${project.name}"?`)) return;
    setActionLoadingId(project.id);
    try {
      await api.patch(`/projects/${project.id}/deactivate`);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate project.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleFinish(project) {
    if (!confirm(`Mark "${project.name}" as finished?`)) return;
    setActionLoadingId(project.id);
    try {
      await api.patch(`/projects/${project.id}/finish`);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark project as finished.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReactivate(project) {
    if (!confirm(`Reactivate "${project.name}"?`)) return;
    setActionLoadingId(project.id);
    try {
      await api.patch(`/projects/${project.id}/reactivate`);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reactivate project.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // ─── Card click: navigate to project detail ──────────────────────────
  function handleCardClick(projectId) {
    router.push(`/projects/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header with back link */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Browse Projects</h2>
            <p className="text-gray-500">Search and filter all construction sites.</p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
          >
            ← Back to projects
          </Link>
        </div>

        {/* Filters row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by name
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Model Town"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div className="w-48">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-white"
            >
              <option value="">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy bg-white"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>

        {/* Project list */}
        <h3 className="font-semibold text-gray-800 mb-3">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
        </h3>

        {loading && <p className="text-sm text-gray-500">Loading projects...</p>}
        {loadError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {loadError}
          </div>
        )}
        {!loading && !loadError && filteredProjects.length === 0 && (
          <p className="text-sm text-gray-500">
            {projects.length === 0
              ? "No projects have been created yet."
              : "No projects match your filters."}
          </p>
        )}

        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const status = project.status || "active";
            const isActive = status === "active";
            const isDeactivated = status === "deactivated";
            const isCompleted = status === "completed";
            const isBusy = actionLoadingId === project.id;

            return (
              <div
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-navy/50"
              >
                <div className="flex-1 min-w-0 pointer-events-none">
                  <p className="font-medium text-gray-800">{project.name}</p>
                  {project.location && (
                    <p className="text-sm text-gray-500">{project.location}</p>
                  )}
                </div>
                <div
                  className="flex items-center gap-2 ml-4 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className={`text-xs uppercase tracking-wide rounded px-2 py-0.5 ${
                      STATUS_STYLES[status] || STATUS_STYLES.active
                    }`}
                  >
                    {STATUS_LABELS[status] || status}
                  </span>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditClick(project)}
                        disabled={isBusy}
                        className="bg-navy text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition"
                      >
                        Edit
                      </button>

                      {isActive && (
                        <>
                          <button
                            onClick={() => handleFinish(project)}
                            disabled={isBusy}
                            className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition"
                          >
                            Finish
                          </button>
                          <button
                            onClick={() => handleDeactivate(project)}
                            disabled={isBusy}
                            className="bg-red-600 text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition"
                          >
                            Deactivate
                          </button>
                        </>
                      )}

                      {(isDeactivated || isCompleted) && (
                        <button
                          onClick={() => handleReactivate(project)}
                          disabled={isBusy}
                          className="bg-green-600 text-white rounded px-2 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition"
                        >
                          Reactivate
                        </button>
                      )}
                    </>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit project</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project name
                </label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  placeholder="e.g. Sahiwal, Punjab"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
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

export default function BrowseProjects() {
  return (
    <ProtectedRoute>
      <BrowseProjectsContent />
    </ProtectedRoute>
  );
}