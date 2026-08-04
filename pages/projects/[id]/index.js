import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import api, { API_ORIGIN } from "../../../lib/api";

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

// Language selector component
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

function ProjectDetailContent() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  
  // Summary states
  const [summary, setSummary] = useState(""); // Backward compatible
  const [summaryData, setSummaryData] = useState(null); // { english, urdu }
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLanguage, setSummaryLanguage] = useState("english"); // 'english' | 'urdu' | 'bilingual'

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
      
      // Add language parameter for bilingual or urdu
      if (lang === "bilingual") {
        endpoint += "?lang=bilingual";
      } else if (lang === "urdu") {
        endpoint += "?lang=urdu";
      }
      
      const { data } = await api.get(endpoint);
      
      // Handle different response formats
      if (data.summaries) {
        // Bilingual response
        setSummaryData({
          english: data.summaries.english,
          urdu: data.summaries.urdu
        });
        setSummary(data.summaries.english); // Backward compatible
      } else if (data.summary) {
        // Single language response
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
    
    // If we already have summary data for the selected language, just switch display
    if (lang === "bilingual" && summaryData?.english && summaryData?.urdu) {
      return;
    }
    if (lang === "urdu" && summaryData?.urdu) {
      return;
    }
    if (lang === "english" && summaryData?.english) {
      return;
    }
    
    // Otherwise regenerate with new language
    if (summary || summaryData) {
      handleGenerateSummary(lang);
    }
  }

  // Render summary content based on selected language
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

    // Display summary based on selected language
    return (
      <div className="space-y-4">
        {/* English Summary */}
        {(summaryLanguage === "english" || summaryLanguage === "bilingual") && (
          <div>
            {summaryLanguage === "bilingual" && (
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                English
              </h4>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {summaryData?.english || summary}
            </p>
          </div>
        )}

        {/* Urdu Summary */}
        {(summaryLanguage === "urdu" || summaryLanguage === "bilingual") && (
          <div>
            {summaryLanguage === "bilingual" && (
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-4">
                اردو
              </h4>
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
              <p className="text-sm text-gray-400 italic">
                Urdu translation not available
              </p>
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
            <div className="mb-8">
              <Link
                href="/projects"
                className="inline-flex items-center text-sm text-gray-600 hover:text-navy transition-colors mb-3"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All projects
              </Link>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                  {project.location && <p className="text-gray-500">{project.location}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
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
            </div>

            {/* AI Summary Section */}
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

            <h3 className="font-semibold text-gray-800 mb-3">Daily updates</h3>

            {reports.length === 0 && (
              <p className="text-sm text-gray-500">No updates yet. Add the first one above.</p>
            )}

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