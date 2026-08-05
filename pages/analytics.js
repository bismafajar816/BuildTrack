// pages/analytics.js
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../lib/api";

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// ─── Reusable component (no page wrapper) ──────────────────────────────
export function AnalyticsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/analytics/overview");
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- Build chart data with a fixed 14‑day window (including today) ---
  function buildChartData(updatesTrend = [], attendanceTrend = []) {
    // Create maps for quick lookup
    const updatesMap = new Map(updatesTrend.map((u) => [u.date, u.count]));
    const attendanceMap = new Map(attendanceTrend.map((a) => [a.date, a.percent]));

    // Generate the last 14 days (including today)
    const today = new Date();
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      dates.push(iso);
    }

    return dates.map((isoDate) => ({
      date: isoDate,
      displayDate: formatShortDate(isoDate),
      updates: updatesMap.get(isoDate) || 0,
      attendance: attendanceMap.get(isoDate) || 0,
    }));
  }

  const chartData = data ? buildChartData(data.updatesTrend, data.attendanceTrend) : [];

  if (loading) return <p className="text-sm text-gray-500">Loading analytics…</p>;
  if (error)
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {error}
      </div>
    );
  if (!data) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Projects" value={data.summary.project_count} />
        <SummaryCard label="Active laborers" value={data.summary.laborer_count} />
        <SummaryCard label="Daily updates" value={data.summary.update_count} />
        <SummaryCard label="Team members" value={data.summary.team_count} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-1">Daily updates — last 14 days</h3>
        <p className="text-xs text-gray-500 mb-4">
          Text notes and photo updates submitted across all projects, per day.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
            <Tooltip />
            <Bar dataKey="updates" fill="#12122b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Attendance rate — last 14 days</h3>
        <p className="text-xs text-gray-500 mb-4">
          % of marked laborers recorded as present, per day, across all projects.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#12122b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

// ─── Full page (used at /analytics) ─────────────────────────────────────
function AnalyticsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">BuildTrack</h1>
        <Link href="/dashboard" className="text-sm bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5">
          &larr; Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Analytics</h2>
        <p className="text-gray-500 mb-8">Company‑wide activity across all your projects.</p>
        <AnalyticsOverview />
      </main>
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}