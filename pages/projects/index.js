import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

function ProjectsContent() {
  const { user } = useAuth();
  const canCreate = user.role === "admin" || user.role === "project_manager";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ name: "", location: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/projects", form);
      setProjects([data.project, ...projects]);
      setForm({ name: "", location: "" });
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not create project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Projects</h2>
            <p className="text-gray-500">
              {canCreate
                ? "Add a new construction site or view existing projects."
                : "Construction sites for your company."}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>

        <p className="text-gray-500 mb-8 hidden">
          {canCreate
            ? "Add a new construction site or view existing projects."
            : "Construction sites for your company."}
        </p>

        {canCreate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Add a project</h3>

            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Model Town Residency"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Sahiwal, Punjab"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-navy text-white rounded-md px-5 py-2 font-medium hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add project"}
              </button>
            </form>
          </div>
        )}

        <h3 className="font-semibold text-gray-800 mb-3">All projects</h3>

        {loading && <p className="text-sm text-gray-500">Loading projects...</p>}
        {loadError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {loadError}
          </div>
        )}
        {!loading && !loadError && projects.length === 0 && (
          <p className="text-sm text-gray-500">No projects yet.</p>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between hover:border-navy/30 transition"
            >
              <div>
                <p className="font-medium text-gray-800">{project.name}</p>
                {project.location && (
                  <p className="text-sm text-gray-500">{project.location}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Projects() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}