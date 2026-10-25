
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getMyReport } from "../api/assessments";
import "../App.css";

function Report() {
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get("result_id");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMyReport(resultId);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.error ||
              "Unable to load your report. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [resultId]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
  };

  return (
    <div className="report-page">
      <nav className="dashboard-navbar">
        <Link to="/" className="logo">
          NeuroMatrix <span>Pathways</span>
        </Link>

        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <main className="report-content">
        <p className="eyebrow">YOUR NEUROMATRIX REPORT</p>

        <h1>Your Assessment Report</h1>

        {loading && (
          <div className="report-placeholder" role="status">
            <h2>Loading your report...</h2>
            <p>Please wait while we retrieve your saved results.</p>
          </div>
        )}

        {!loading && error && (
          <div className="report-placeholder" role="alert">
            <h2>Report Unavailable</h2>
            <p>{error}</p>

            <button
              type="button"
              className="primary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && report && (
          <>
            <section className="report-placeholder">
              <h2>
                {typeof report.assessment === "object"
                ? report.assessment?.name || "Assessment Report"
                : report.assessment || "Assessment Report"}
              </h2>

              <p>
                <strong>Status:</strong> Completed
              </p>

              <p>
                <strong>Completed on:</strong>{" "}
                {formatDate(report.completed_at)}
              </p>

              <p>
                <strong>Questions answered:</strong>{" "}
                {report.question_count}
              </p>

              <p>
                <strong>Scoring version:</strong>{" "}
                {report.scoring_version || "Not specified"}
              </p>
            </section>

            <section style={{ marginTop: "32px" }}>
              <h2>Dimension Scores</h2>

              {report.dimensions?.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    marginTop: "16px",
                  }}
                >
                  {report.dimensions.map((dimension) => {
                    const score = Number(
                      dimension.normalized_score
                    );

                    const validScore = Number.isFinite(score)
                      ? Math.max(0, Math.min(100, score))
                      : 0;

                    return (
                      <article
                        className="report-placeholder"
                        key={dimension.code || dimension.name}
                      >
                        <h3>{dimension.name}</h3>

                        <p>
                          Normalized score:{" "}
                          <strong>
                            {Number.isFinite(score)
                              ? score.toFixed(2)
                              : "Not available"}
                          </strong>{" "}
                          / 100
                        </p>

                        <p>
                          Raw score: {dimension.raw_score}
                        </p>

                        <div
                          style={{
                            height: "8px",
                            background: "#e5e7eb",
                            borderRadius: "8px",
                            overflow: "hidden",
                            marginTop: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: `${validScore}%`,
                              height: "100%",
                              background: "#f97316",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p>
                  No dimension scores were returned. Check the
                  scoring configuration and question-dimension
                  mappings in Django.
                </p>
              )}
            </section>

            <section style={{ marginTop: "32px" }}>
              <h2>Your Responses</h2>

              {report.responses?.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    marginTop: "16px",
                  }}
                >
                  {report.responses.map((item, index) => (
                    <article
                      className="report-placeholder"
                      key={item.question_id}
                    >
                      <p>
                        <strong>Question {index + 1}</strong>
                      </p>

                      <h3>{item.question}</h3>

                      <p>
                        <strong>Your answer:</strong>{" "}
                        {item.answer}
                      </p>

                      <p>
                        <strong>Recorded value:</strong>{" "}
                        {item.value}
                      </p>

                      <p>
                        <strong>Section:</strong>{" "}
                        {item.section}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No saved responses were returned.</p>
              )}
            </section>

            <p style={{ marginTop: "24px" }}>
              These scores reflect the configured scoring rules.
              They should not be interpreted as a clinical diagnosis
              or validated psychological assessment unless the
              assessment instrument and methodology have been
              appropriately validated.
            </p>
          </>
        )}

        <div style={{ marginTop: "28px" }}>
          <Link to="/dashboard" className="primary-btn">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Report;
