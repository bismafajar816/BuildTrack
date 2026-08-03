import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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
  const [showPassword, setShowPassword] = useState(false);

  const emailIsInvalid = form.email.length > 0 && !emailRegex.test(form.email);
  const passwordIsInvalid = form.password.length > 0 && !passwordRegex.test(form.password);
  const isFormValid =
    form.fullName.trim() &&
    emailRegex.test(form.email) &&
    passwordRegex.test(form.password);

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
        <div className="mb-6 flex justify-start">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span aria-hidden="true">←</span>
            Dashboard
          </Link>
        </div>
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
            <button
              type="submit"
              disabled={submitting || !isFormValid}
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
