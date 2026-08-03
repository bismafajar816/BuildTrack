import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../lib/api";

function TeamContent() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "site_engineer",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await api.post("/auth/invite", form);
      setMessage(`${form.fullName} was added successfully.`);
      setForm({ fullName: "", email: "", password: "", role: "site_engineer" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not add team member.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="text-sm text-navy hover:underline">
          &larr; Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Add a team member</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add team member"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <TeamContent />
    </ProtectedRoute>
  );
}
