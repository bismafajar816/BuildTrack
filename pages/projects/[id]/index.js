// pages/projects/[id]/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import api, { API_ORIGIN } from "../../../lib/api";
// 👇 Import the reusable analytics component
import { ProjectAnalyticsOverview } from "./analytics";

function imageUrlFor(imagePath) {
  return encodeURI(`${API_ORIGIN}/${imagePath}`);
}

async function handleDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert("Could not download the image. Try 'View full size' and save it manually.");
  }
}

function ReportImage({ imagePath }) {
  const [failed, setFailed] = useState(false);
  const url = imageUrlFor(imagePath);
  const filename = imagePath.split("/").pop();

  if (failed) {
    return (
      <div className="mb-2 rounded-md border border-dashed border-red-200 bg-red-50 px-3 py-4 text-sm text-red-600">
        This image couldn&apos;t load. It may have been removed, or the backend server
        needs a restart to serve it.
        <div className="mt-1 break-all text-xs text-red-400">{url}</div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt="Site update"
          onError={() => setFailed(true)}
          className="rounded-md w-full max-h-96 object-cover"
        />
      </a>
      <div className="flex gap-4 mt-1.5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-navy hover:underline"
        >
          View full size
        </a>
        <button
          type="button"
          onClick={() => handleDownload(url, filename)}
          className="text-xs text-navy hover:underline"
        >
          Download
        </button>
      </div>
    </div>
  );
}

// ─── Language selector (as before) ──────────────────────────────────────
function LanguageSelector({ selectedLang, onLanguageChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Language:</span>
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        <button
          onClick={() => onLanguageChange("english")}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            selectedLang === "english"
              ? "bg-navy text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          English
        </button>
        <button
          onClick={() => onLanguageChange("urdu")}
          className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 ${
            selectedLang === "urdu"
              ? "bg-navy text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          اردو
        </button>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────
function ProjectDetailContent() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Summary states (bilingual)
  const [summary, setSummary] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLanguage, setSummaryLanguage] = useState("english");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/project/${id}`);
      setProject(data.project);
      setReports(data.reports);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function handleDelete(reportId) {
    if (!window.confirm("Delete this update? This can't be undone.")) return;
    setDeletingId(reportId);
    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete this update.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerateSummary(lang = summaryLanguage) {
    setSummaryLoading(true);
    setSummaryError("");
    setSummary("");
    setSummaryData(null);
    try {
      let endpoint = `/reports/project/${id}/summary`;
      if (lang === "bilingual") endpoint += "?lang=bilingual";
      else if (lang === "urdu") endpoint += "?lang=urdu";
      const { data } = await api.get(endpoint);

      if (data.summaries) {
        setSummaryData({
          english: data.summaries.english,
          urdu: data.summaries.urdu,
        });
        setSummary(data.summaries.english);
      } else if (data.summary) {
        setSummary(data.summary);
        if (data.language === "urdu") {
          setSummaryData({ urdu: data.summary });
        } else {
          setSummaryData({ english: data.summary });
        }
      }
    } catch (err) {
      setSummaryError(err.response?.data?.message || "Could not generate a summary.");
    } finally {
      setSummaryLoading(false);
    }
  }

  function handleLanguageChange(lang) {
    setSummaryLanguage(lang);
    if (
      (lang === "bilingual" && summaryData?.english && summaryData?.urdu) ||
      (lang === "urdu" && summaryData?.urdu) ||
      (lang === "english" && summaryData?.english)
    ) {
      return;
    }
    if (summary || summaryData) {
      handleGenerateSummary(lang);
    }
  }

  const renderSummaryContent = () => {
    if (summaryLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-navy border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-500">
            {summaryLanguage === "bilingual"
              ? "Reading updates and generating summaries in English and Urdu..."
              : summaryLanguage === "urdu"
              ? "اردو میں خلاصہ تیار کیا جا رہا ہے..."
              : "Reading updates and generating summary..."}
          </p>
        </div>
      );
    }
    if (summaryError) {
      return (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {summaryError}
        </div>
      );
    }
    if (!summary && !summaryData) {
      return (
        <p className="text-sm text-gray-500">
          Summarize all daily updates (text and photos) into a short progress report.
        </p>
      );
    }
    return (
      <div className="space-y-4">
        {(summaryLanguage === "english" || summaryLanguage === "bilingual") && (
          <div>
            {summaryLanguage === "bilingual" && (
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">English</h4>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {summaryData?.english || summary}
            </p>
          </div>
        )}
        {(summaryLanguage === "urdu" || summaryLanguage === "bilingual") && (
          <div>
            {summaryLanguage === "bilingual" && (
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-4">اردو</h4>
            )}
            {summaryData?.urdu ? (
              <p
                className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed text-right"
                dir="rtl"
                style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Segoe UI', sans-serif" }}
              >
                {summaryData.urdu}
              </p>
            ) : summaryLanguage === "urdu" && summary ? (
              <p
                className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed text-right"
                dir="rtl"
                style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Segoe UI', sans-serif" }}
              >
                {summary}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">Urdu translation not available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-3xl mx-auto px-6 py-10">
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {project && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                {project.location && <p className="text-gray-500">{project.location}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Analytics link still available if you want full-page view */}
                <Link
                  href={`/projects/${id}/analytics`}
                  className="bg-white border border-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:border-navy/30 whitespace-nowrap"
                >
                  Analytics
                </Link>
                <Link
                  href={`/projects/${id}/laborers`}
                  className="bg-white border border-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:border-navy/30 whitespace-nowrap"
                >
                  Laborers
                </Link>
                <Link
                  href={`/projects/${id}/attendance`}
                  className="bg-white border border-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:border-navy/30 whitespace-nowrap"
                >
                  Attendance
                </Link>
                <Link
                  href={`/projects/${id}/report`}
                  className="bg-navy text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 whitespace-nowrap"
                >
                  + Add daily update
                </Link>
              </div>
            </div>

            {/* AI Summary Section (bilingual) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">AI Summary</h3>
                <div className="flex items-center gap-3">
                  <LanguageSelector
                    selectedLang={summaryLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateSummary(summaryLanguage)}
                    disabled={summaryLoading}
                    className="text-sm bg-navy text-white rounded-md px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
                  >
                    {summaryLoading ? "Summarizing..." : summary || summaryData ? "Regenerate" : "Generate summary"}
                  </button>
                </div>
              </div>
              {renderSummaryContent()}
            </div>

            <div className="space-y-4">
              {reports.map((r) => {
                const canDelete = user.role === "admin" || r.created_by === user.id;
                return (
                  <div key={r.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(r.entry_date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {r.created_by_name ? ` · ${r.created_by_name}` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-navy bg-navy/5 rounded px-2 py-0.5">
                          {r.entry_type === "image" ? "Photo" : "Text"}
                        </span>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                          >
                            {deletingId === r.id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>

                    {r.entry_type === "image" && r.image_path && (
                      <ReportImage imagePath={r.image_path} />
                    )}

                    {r.content && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProjectDetail() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}