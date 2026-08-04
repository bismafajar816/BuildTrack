import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";

function LaborersContent() {
  const router = useRouter();
  const { id } = router.query;

  const [projectName, setProjectName] = useState("");
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ full_name: "", phone: "", trade: "", daily_wage: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  async function loadLaborers() {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get(`/laborers/project/${id}`);
      setProjectName(data.project.name);
      setLaborers(data.laborers);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load laborers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadLaborers();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/laborers", {
        project_id: id,
        full_name: form.full_name,
        phone: form.phone || undefined,
        trade: form.trade || undefined,
        daily_wage: form.daily_wage ? Number(form.daily_wage) : undefined,
      });
      setLaborers((prev) =>
        [...prev, data.laborer].sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      setForm({ full_name: "", phone: "", trade: "", daily_wage: "" });
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not add laborer.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(laborerId) {
    if (!window.confirm("Remove this laborer from the project?")) return;
    setRemovingId(laborerId);
    try {
      await api.patch(`/laborers/${laborerId}/deactivate`);
      setLaborers((prev) => prev.filter((l) => l.id !== laborerId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove laborer.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Laborers</h2>
            <p className="text-gray-500">
              {projectName ? `Working on ${projectName}` : "Loading project..."}
            </p>
          </div>
          <Link
            href={id ? `/projects/${id}` : "/projects"}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            &larr; Back to project
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Add a laborer</h3>

          {formError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="e.g. Imran Khan"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="trade"
                  value={form.trade}
                  onChange={handleChange}
                  placeholder="e.g. Mason"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily wage <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="daily_wage"
                  value={form.daily_wage}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 0300-1234567"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-navy text-white rounded-md px-5 py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add laborer"}
            </button>
          </form>
        </div>

        <h3 className="font-semibold text-gray-800 mb-3">
          On this project {laborers.length > 0 && `(${laborers.length})`}
        </h3>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {loadError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {loadError}
          </div>
        )}
        {!loading && !loadError && laborers.length === 0 && (
          <p className="text-sm text-gray-500">No laborers added yet.</p>
        )}

        <div className="space-y-2">
          {laborers.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{l.full_name}</p>
                <p className="text-xs text-gray-500">
                  {[l.trade, l.phone, l.daily_wage ? `Rs. ${l.daily_wage}/day` : null]
                    .filter(Boolean)
                    .join(" · ") || "No additional details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(l.id)}
                disabled={removingId === l.id}
                className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {removingId === l.id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Laborers() {
  return (
    <ProtectedRoute>
      <LaborersContent />
    </ProtectedRoute>
  );
}