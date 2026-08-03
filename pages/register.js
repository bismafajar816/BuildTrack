import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function Register() {
  const { registerCompany } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailIsInvalid = form.email.length > 0 && !emailRegex.test(form.email);
  const passwordIsInvalid = form.password.length > 0 && !passwordRegex.test(form.password);
  const isFormValid =
    form.companyName.trim() &&
    form.fullName.trim() &&
    emailRegex.test(form.email) &&
    passwordRegex.test(form.password);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fix the highlighted fields before creating your account.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await registerCompany(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 pt-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-navy mb-1">Create your BuildTrack account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Set up your company workspace as the admin.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder="e.g. xyz Constructions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your full name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
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
          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-navy font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
