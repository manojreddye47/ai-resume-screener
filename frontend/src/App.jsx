import { useState } from "react";
import axios from "axios";

export default function App() {
  const [jd, setJd] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScreen = async () => {
    if (!jd) return setError("Please upload a Job Description.");
    if (resumes.length === 0) return setError("Please upload at least one resume.");
    setError("");
    setLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append("jd", jd);
    resumes.forEach((r) => formData.append("resumes", r));

    try {
      const res = await axios.post("http://127.0.0.1:8000/screen", formData);
      setResults(res.data.ranked);
      setFlagged(res.data.flagged);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "24px 40px", borderBottom: "1px solid #334155" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#38bdf8" }}>
          🤖 AI Resume Screener
        </h1>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "14px" }}>
          Upload a Job Description and resumes — let AI rank the best candidates instantly
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Upload Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          
          {/* JD Upload */}
          <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#e2e8f0" }}>📄 Job Description</h2>
            <input
              type="file"
              accept="*"
              onChange={(e) => setJd(e.target.files[0])}
              style={{ width: "100%", color: "#94a3b8", fontSize: "13px" }}
            />
            {jd && (
              <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#22c55e" }}>
                ✅ {jd.name}
              </p>
            )}
          </div>

          {/* Resume Upload */}
          <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "16px", color: "#e2e8f0" }}>📂 Resumes</h2>
            <input
              type="file"
              accept="*"
              multiple
              onChange={(e) => setResumes(Array.from(e.target.files))}
              style={{ width: "100%", color: "#94a3b8", fontSize: "13px" }}
            />
            {resumes.length > 0 && (
              <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#22c55e" }}>
                ✅ {resumes.length} resume(s) selected
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", color: "#fca5a5", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Screen Button */}
        <button
          onClick={handleScreen}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "10px", border: "none",
            background: loading ? "#334155" : "#38bdf8", color: loading ? "#94a3b8" : "#0f172a",
            fontSize: "16px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "40px", transition: "background 0.2s"
          }}
        >
          {loading ? "⏳ Analyzing resumes with AI..." : "🚀 Screen Resumes"}
        </button>

        {/* Results */}
        {results && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#e2e8f0" }}>
              🏆 Ranked Candidates ({results.length})
            </h2>
            {results.map((r, i) => (
              <div key={i} style={{
                background: "#1e293b", borderRadius: "12px", padding: "20px 24px",
                marginBottom: "16px", border: "1px solid #334155",
                borderLeft: `4px solid ${getScoreColor(r.score)}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#94a3b8" }}>#{i + 1}</span>
                    <span style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0" }}>{r.filename}</span>
                  </div>
                  <div style={{
                    background: getScoreColor(r.score), color: "#0f172a",
                    fontWeight: "700", fontSize: "18px", borderRadius: "8px",
                    padding: "4px 14px", minWidth: "60px", textAlign: "center"
                  }}>
                    {r.score}/100
                  </div>
                </div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
                  {r.reason}
                </p>
              </div>
            ))}

            {/* Flagged */}
            {flagged.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#f87171" }}>
                  ⚠️ Flagged Files ({flagged.length})
                </h2>
                {flagged.map((r, i) => (
                  <div key={i} style={{
                    background: "#1e293b", borderRadius: "12px", padding: "16px 20px",
                    marginBottom: "12px", border: "1px solid #ef4444"
                  }}>
                    <p style={{ margin: "0 0 6px", fontWeight: "600", color: "#fca5a5" }}>{r.filename}</p>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>{r.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}