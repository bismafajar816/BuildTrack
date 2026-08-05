// pages/projects/browse.js
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";

function BrowseProjectsContent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");

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

  // Filter projects based on search and city
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter
        ? p.location?.trim() === cityFilter
        : true;
      return matchesSearch && matchesCity;
    });
  }, [projects, searchTerm, cityFilter]);

  // Reset filters
  function clearFilters() {
    setSearchTerm("");
    setCityFilter("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header with back link */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Browse Projects</h2>
            <p className="text-gray-500">
              Search and filter all construction sites.
            </p>
          </div>

          
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
          {filteredProjects.map((project) => (
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

export default function BrowseProjects() {
  return (
    <ProtectedRoute>
      <BrowseProjectsContent />
    </ProtectedRoute>
  );
}