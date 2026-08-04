import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";

const STATUS_OPTIONS = [
  { value: "present", label: "Present", classes: "bg-green-600 text-white" },
  { value: "absent", label: "Absent", classes: "bg-red-500 text-white" },
  { value: "half_day", label: "Half day", classes: "bg-amber-500 text-white" },
  { value: "leave", label: "Leave", classes: "bg-gray-500 text-white" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function AttendanceContent() {
  const router = useRouter();
  const { id } = router.query;

  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]); // [{ laborer_id, full_name, trade, status }]
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  async function loadAttendance(forDate) {
    setLoading(true);
    setLoadError("");
    setSaveMessage("");
    try {
      const { data } = await api.get(`/attendance/project/${id}`, { params: { date: forDate } });
      setProjectName(data.project.name);
      setRows(
        data.attendance.map((a) => ({
          laborer_id: a.laborer_id,
          full_name: a.full_name,
          trade: a.trade,
          status: a.status, // may be null if unmarked
        }))
      );
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id && date) loadAttendance(date);
  }, [id, date]);

  function setStatus(laborerId, status) {
    setRows((prev) => prev.map((r) => (r.laborer_id === laborerId ? { ...r, status } : r)));
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, status: "present" })));
  }

  async function handleSave() {
    setSaveError("");
    setSaveMessage("");

    const records = rows
      .filter((r) => r.status) // only send laborers that have a status set
      .map((r) => ({ laborer_id: r.laborer_id, status: r.status }));

    if (records.length === 0) {
      setSaveError("Mark at least one laborer before saving.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/attendance", {
        project_id: id,
        attendance_date: date,
        records,
      });
      setSaveMessage("Attendance saved.");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not save attendance.");
    } finally {
      setSaving(false);
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={markAllPresent}
                className="text-sm text-navy hover:underline"
              >
                Mark all present
              </button>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading laborers...</p>}
        {loadError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {loadError}
          </div>
        )}
        {!loading && !loadError && rows.length === 0 && (
          <div className="text-sm text-gray-500 bg-white rounded-lg border border-gray-100 p-5">
            No laborers on this project yet.{" "}
            <Link href={`/projects/${id}/laborers`} className="text-navy hover:underline">
              Add some first
            </Link>
            .
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="space-y-2 mb-6">
              {rows.map((r) => (
                <div
                  key={r.laborer_id}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-3"
                >
                  <div>

                    <p className="font-medium text-gray-800">{r.full_name}</p>
                    {r.trade && <p className="text-xs text-gray-500">{r.trade}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(r.laborer_id, opt.value)}
                        className={`text-xs rounded-md px-2.5 py-1.5 border transition ${
                          r.status === opt.value
                            ? opt.classes + " border-transparent"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {saveError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                {saveError}
              </div>
            )}
            {saveMessage && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
                {saveMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-navy text-white rounded-md py-2.5 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save attendance"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default function Attendance() {
  return (
    <ProtectedRoute>
      <AttendanceContent />
    </ProtectedRoute>
  );
}