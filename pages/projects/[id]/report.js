import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function AddReportContent() {
  const router = useRouter();
  const { id } = router.query;

  const [projectName, setProjectName] = useState("");
  const [entryType, setEntryType] = useState(null); // null | 'text' | 'image'
  const [entryDate, setEntryDate] = useState(todayISO());
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/projects/${id}`)
      .then(({ data }) => setProjectName(data.project.name))
      .catch(() => {});
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setEntryType(null);
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setEntryDate(todayISO());
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (entryType === "text" && !content.trim()) {
      setError("Please enter some text.");
      return;
    }
    if (entryType === "image" && !imageFile) {
      setError("Please select an image.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      // project_id and project_name must be appended before the image file
      // so the backend can resolve the storage folder before saving the file.
      formData.append("project_id", id);
      formData.append("project_name", projectName);
      formData.append("entry_type", entryType);
      formData.append("entry_date", entryDate);
      formData.append("content", content);
      if (entryType === "image" && imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-lg mx-auto px-6 py-10">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add daily update</h2>
            <p className="text-gray-500">
              {projectName ? `For ${projectName}` : "Loading project..."}
            </p>
          </div>
          <Link
            href={id ? `/projects/${id}` : "/projects"}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            &larr; Back to project
          </Link>
        </div>

        {/* Step 1: ask what type of information */}
        {entryType === null && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="font-medium text-gray-800 mb-4">
              What kind of information would you like to enter?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setEntryType("text")}
                className="border-2 border-gray-200 rounded-lg py-6 text-center hover:border-navy hover:bg-navy/5 transition"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-800">Text update</div>
                <div className="text-xs text-gray-500 mt-1">Progress notes, remarks</div>
              </button>
              <button
                onClick={() => setEntryType("image")}
                className="border-2 border-gray-200 rounded-lg py-6 text-center hover:border-navy hover:bg-navy/5 transition"
              >
                <div className="text-2xl mb-2">📷</div>
                <div className="font-medium text-gray-800">Photo update</div>
                <div className="text-xs text-gray-500 mt-1">Site photo + caption</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: the matching form */}
        {entryType !== null && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800">
                {entryType === "text" ? "Text update" : "Photo update"}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-navy hover:underline"
              >
                Change type
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              {entryType === "image" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-navy file:text-white file:text-sm hover:file:opacity-90"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 rounded-md max-h-56 object-cover w-full"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {entryType === "image" ? "Caption " : "Update text"}
                  {entryType === "image" && (
                    <span className="text-gray-400 font-normal">(optional)</span>
                  )}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder={
                    entryType === "image"
                      ? "e.g. Foundation pour completed on the east wing"
                      : "e.g. Completed excavation for block B, started rebar placement"
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save update"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AddReport() {
  return (
    <ProtectedRoute>
      <AddReportContent />
    </ProtectedRoute>
  );
}