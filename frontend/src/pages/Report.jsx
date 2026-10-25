
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";

import { getMyReport } from "../api/assessments";
import "../App.css";

function Report() {
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get("result_id");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const data = await getMyReport(resultId || undefined);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "We couldn't load your report. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [resultId]);

  const assessmentName =
    typeof report?.assessment === "object"
      ? report.assessment?.name || "Assessment Report"
      : report?.assessment || "Assessment Report";

  const responses = Array.isArray(report?.responses)
    ? report.responses
    : [];

  const dimensions = Array.isArray(report?.dimensions)
    ? report.dimensions
    : [];

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
  };

  const downloadPdf = () => {
    if (!report || downloading) return;

    setDownloading(true);

    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 52;

      const ensureSpace = (height = 12) => {
        if (y + height > pageHeight - 18) {
          pdf.addPage();
          y = 22;
        }
      };

      const addText = (text, options = {}) => {
        const {
          size = 10,
          bold = false,
          color = [44, 62, 80],
          after = 4,
        } = options;

        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);

        const lines = pdf.splitTextToSize(
          String(text ?? "Not available"),
          contentWidth
        );

        ensureSpace(lines.length * size * 0.45 + after);
        pdf.text(lines, margin, y);
        y += lines.length * size * 0.45 + after;
      };

      const addSection = (heading) => {
        ensureSpace(18);
        y += 4;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(18, 59, 89);
        pdf.text(heading, margin, y);

        y += 3;

        pdf.setDrawColor(245, 124, 0);
        pdf.setLineWidth(0.6);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 7;
      };

      // Report cover header
      pdf.setFillColor(18, 59, 89);
      pdf.rect(0, 0, pageWidth, 40, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("NEUROMATRIX PATHWAYS", margin, 13);

      pdf.setFontSize(21);
      pdf.text("Assessment Report", margin, 25);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(220, 236, 242);
      pdf.text("Your assessment summary and recorded results", margin, 33);

      addSection("Assessment Summary");
      addText(assessmentName, {
        bold: true,
        size: 12,
        color: [18, 59, 89],
      });
      addText("Status: Completed");
      addText(`Completed on: ${formatDate(report.completed_at)}`);
      addText(`Questions answered: ${report.question_count ?? responses.length}`);
      addText(`Scoring version: ${report.scoring_version || "Not specified"}`);

      addSection("Dimension Scores");

      if (dimensions.length === 0) {
        addText("No dimension scores were returned.");
      }

      dimensions.forEach((dimension) => {
        addText(
          `${dimension.name}: ${dimension.normalized_score} / 100`,
          { bold: true, size: 11, color: [18, 59, 89] }
        );
        addText(`Raw score: ${dimension.raw_score}`);
      });

      addSection("Recorded Responses");

      if (responses.length === 0) {
        addText("No saved responses were returned.");
      }

      responses.forEach((item, index) => {
        addText(`Question ${index + 1}`, {
          bold: true,
          size: 11,
          color: [18, 59, 89],
        });
        addText(item.question);
        addText(`Your answer: ${item.answer}`, { bold: true });
        addText(`Recorded value: ${item.value}`);
        addText(`Section: ${item.section}`);
        y += 2;
      });

      addSection("Important Note");
      addText(
        "These scores reflect the scoring rules configured for this assessment. " +
          "They are not a clinical diagnosis or evidence of a validated psychological " +
          "assessment unless the instrument and methodology have been appropriately validated.",
        { size: 9, color: [90, 103, 113] }
      );

      // Footer and page numbers
      const pageCount = pdf.getNumberOfPages();

      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);

        pdf.setDrawColor(220, 228, 233);
        pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 114, 124);

        pdf.text("NeuroMatrix Pathways", margin, pageHeight - 7);
        pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 7, {
          align: "right",
        });
      }

      const safeName =
        assessmentName.replace(/[^\w.-]+/g, "_") || "Assessment";

      pdf.save(`${safeName}_Report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("The PDF could not be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="nm-report-page">
        <div className="nm-report-state">
          <div className="nm-report-spinner" />
          <h2>Preparing your report</h2>
          <p>Retrieving your saved assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="nm-report-page">
        <nav className="nm-report-nav">
          <Link to="/" className="nm-report-logo">
            <span>NeuroMatrix</span> Pathways
          </Link>
          <Link to="/dashboard" className="nm-report-nav-link">
            Dashboard
          </Link>
        </nav>

        <main className="nm-report-container">
          <div className="nm-report-state nm-report-error">
            <span className="nm-report-error-symbol">!</span>
            <h2>Report unavailable</h2>
            <p>
              {error || "No completed assessment report was found for this account."}
            </p>
            <div className="nm-report-state-actions">
              <button
                className="nm-report-button nm-report-button-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link
                to="/dashboard"
                className="nm-report-button nm-report-button-secondary"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="nm-report-page">
      <nav className="nm-report-nav">
        <Link to="/" className="nm-report-logo">
          <span>NeuroMatrix</span> Pathways
        </Link>

        <div className="nm-report-nav-actions">
          <Link to="/dashboard" className="nm-report-nav-link">
            Dashboard
          </Link>
          <span className="nm-report-nav-divider" />
          <span className="nm-report-nav-caption">YOUR REPORT</span>
        </div>
      </nav>

      <main className="nm-report-container">
        <header className="nm-report-hero">
          <div className="nm-report-hero-content">
            <p className="nm-report-eyebrow">
              YOUR NEUROMATRIX JOURNEY
            </p>
            <h1>
              Your growth.
              <br />
              <span>Your next chapter.</span>
            </h1>
            <p className="nm-report-hero-description">
              A clear overview of your completed assessment, recorded
              responses, and the dimensions measured by its scoring setup.
            </p>

            <div className="nm-report-hero-meta">
              <span className="nm-report-live-dot" />
              Assessment completed
              <span className="nm-report-meta-separator">·</span>
              {formatDate(report.completed_at)}
            </div>
          </div>

          <div className="nm-report-hero-mark" aria-hidden="true">
            <div className="nm-report-orbit nm-report-orbit-one" />
            <div className="nm-report-orbit nm-report-orbit-two" />
            <div className="nm-report-mark-core">NM</div>
          </div>
        </header>

        {error && (
          <div className="nm-report-inline-error" role="alert">
            {error}
          </div>
        )}

        <div className="nm-report-toolbar">
          <div>
            <p className="nm-report-card-label">YOUR REPORT</p>
            <h2 className="nm-report-page-title">Assessment overview</h2>
          </div>

          <button
            type="button"
            className="nm-report-button nm-report-button-primary"
            onClick={downloadPdf}
            disabled={downloading}
          >
            <span className="nm-report-download-icon">↓</span>
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>

        <section className="nm-report-summary">
          <div className="nm-report-summary-header">
            <div className="nm-report-summary-icon">✓</div>
            <div className="nm-report-summary-heading">
              <p className="nm-report-card-label">COMPLETED ASSESSMENT</p>
              <h2>{assessmentName}</h2>
            </div>
            <span className="nm-report-status">
              <span /> Completed
            </span>
          </div>

          <div className="nm-report-meta-grid">
            <div className="nm-report-meta-item">
              <span className="nm-report-meta-icon">▤</span>
              <div>
                <span>Questions answered</span>
                <strong>{report.question_count ?? responses.length}</strong>
              </div>
            </div>
            <div className="nm-report-meta-item">
              <span className="nm-report-meta-icon">◷</span>
              <div>
                <span>Completed on</span>
                <strong>{formatDate(report.completed_at)}</strong>
              </div>
            </div>
            <div className="nm-report-meta-item">
              <span className="nm-report-meta-icon">◇</span>
              <div>
                <span>Scoring version</span>
                <strong>{report.scoring_version || "Not specified"}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="nm-report-section">
          <div className="nm-report-section-heading">
            <div>
              <p className="nm-report-card-label">YOUR RESULTS</p>
              <h2>Dimension scores</h2>
              <p className="nm-report-section-description">
                Scores generated by the currently configured assessment rules.
              </p>
            </div>
            <span className="nm-report-count">
              {dimensions.length} {dimensions.length === 1 ? "dimension" : "dimensions"}
            </span>
          </div>

          {dimensions.length > 0 ? (
            <div className="nm-report-dimension-grid">
              {dimensions.map((dimension, index) => {
                const numericScore = Number(dimension.normalized_score);
                const score = Number.isFinite(numericScore)
                  ? Math.max(0, Math.min(100, numericScore))
                  : null;

                return (
                  <article
                    className="nm-report-dimension-card"
                    key={dimension.code || dimension.name}
                  >
                    <div className="nm-report-dimension-card-top">
                      <span className="nm-report-dimension-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="nm-report-dimension-symbol">↗</span>
                    </div>

                    <h3>{dimension.name}</h3>

                    <div className="nm-report-score-line">
                      <strong>
                        {score === null ? "N/A" : score.toFixed(2)}
                      </strong>
                      <span>/ 100</span>
                    </div>

                    <div
                      className="nm-report-progress"
                      role="progressbar"
                      aria-label={`${dimension.name} normalized score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={score ?? 0}
                    >
                      <span style={{ width: `${score ?? 0}%` }} />
                    </div>

                    <div className="nm-report-score-foot">
                      <span>Normalized score</span>
                      <span>Raw: {dimension.raw_score}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="nm-report-empty">
              <h3>No dimension scores yet</h3>
              <p>
                Check the active scoring configuration and question-to-dimension
                mappings in Django.
              </p>
            </div>
          )}
        </section>

        <section className="nm-report-section">
          <div className="nm-report-section-heading">
            <div>
              <p className="nm-report-card-label">YOUR ANSWERS</p>
              <h2>Recorded responses</h2>
              <p className="nm-report-section-description">
                The answers saved for this assessment attempt.
              </p>
            </div>
            <span className="nm-report-count">
              {responses.length} {responses.length === 1 ? "response" : "responses"}
            </span>
          </div>

          {responses.length > 0 ? (
            <div className="nm-report-response-list">
              {responses.map((item, index) => (
                <details
                  className="nm-report-response-card"
                  key={item.question_id ?? index}
                  open={index === 0}
                >
                  <summary className="nm-report-response-summary">
                    <span className="nm-report-question-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nm-report-response-title">
                      <span>{item.section || "Assessment question"}</span>
                      <strong>{item.question || "Question text unavailable"}</strong>
                    </span>
                    <span className="nm-report-expand" aria-hidden="true">+</span>
                  </summary>

                  <div className="nm-report-response-detail">
                    <div className="nm-report-answer-box">
                      <span>Your answer</span>
                      <strong>{item.answer ?? "Not available"}</strong>
                    </div>
                    <div className="nm-report-answer-value">
                      <span>Recorded value</span>
                      <strong>{item.value ?? "—"}</strong>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="nm-report-empty">
              <h3>No saved responses were returned</h3>
              <p>
                The report API must return the responses saved against this
                completed assessment attempt.
              </p>
            </div>
          )}
        </section>

        <aside className="nm-report-disclaimer">
          <span className="nm-report-disclaimer-icon">i</span>
          <div>
            <strong>How to read these results</strong>
            <p>
              These scores reflect the configured scoring rules. They should
              not be interpreted as a clinical diagnosis or validated
              psychological assessment unless the instrument and methodology
              have been appropriately validated.
            </p>
          </div>
        </aside>

        <div className="nm-report-bottom-actions">
          <Link to="/dashboard" className="nm-report-button nm-report-button-secondary">
            ← Back to Dashboard
          </Link>
          <button
            type="button"
            className="nm-report-button nm-report-button-primary"
            onClick={downloadPdf}
            disabled={downloading}
          >
            {downloading ? "Preparing PDF..." : "↓ Download Report PDF"}
          </button>
        </div>
      </main>

      <footer className="nm-report-footer">
        <span>NeuroMatrix Pathways</span>
        <span>Your journey of self-discovery</span>
      </footer>
    </div>
  );
}

export default Report;
