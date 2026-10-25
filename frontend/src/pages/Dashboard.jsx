import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import "../App.css";

import {
  getMyAssessment,
} from "../api/assessments";

import { useAuth } from "../context/AuthContext";


const STATUS_LABELS = {
  "8th": "8th Standard",
  "9th": "9th Standard",
  "10th": "10th Standard",
  "11th": "11th Standard",
  "12th": "12th Standard",
  "pursuing-ug": "Pursuing UG",
  "completed-ug": "Completed UG",
};


function Dashboard() {

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  // =========================================================
  // ASSESSMENT STATE
  // =========================================================

  const [
    assessment,
    setAssessment,
  ] = useState(null);


  const [
    assessmentLoading,
    setAssessmentLoading,
  ] = useState(true);


  const [
    assessmentError,
    setAssessmentError,
  ] = useState("");


  // =========================================================
  // LOAD ASSIGNED ASSESSMENT
  // =========================================================

  useEffect(() => {

    const loadAssignedAssessment = async () => {

      try {

        setAssessmentLoading(true);
        setAssessmentError("");

        const data =
          await getMyAssessment();

        setAssessment(data);

      } catch (err) {

        console.error(
          "Failed to load assigned assessment:",
          err
        );

        if (
          err.response?.status === 404
        ) {

          setAssessment(null);

          setAssessmentError(
            "No assessment is currently assigned to your student standard."
          );

        } else if (
          err.response?.status === 401
        ) {

          logout();
          navigate("/login");

          return;

        } else {

          setAssessmentError(
            "Unable to load your assigned assessment."
          );

        }

      } finally {

        setAssessmentLoading(false);

      }

    };


    if (user) {
      loadAssignedAssessment();
    }

  }, [
    user,
    logout,
    navigate,
  ]);


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    logout();

    navigate("/login");

  };


  // =========================================================
  // USER CHECK
  // =========================================================

  if (!user) {
    return null;
  }


  // =========================================================
  // USER DISPLAY DATA
  // =========================================================

  const fullName = [
    user.first_name,
    user.last_name,
  ]
    .filter(Boolean)
    .join(" ");


  const displayName =
    fullName ||
    user.username;


  const studentStatus =
    STATUS_LABELS[
      user.student_status
    ] ||
    user.student_status ||
    "Not specified";


  // =========================================================
  // ASSESSMENT DATA
  // =========================================================

  const questionCount =
    assessment?.question_count || 0;


  const responseScale =
    assessment?.response_scale || 0;


  const assessmentName =
    assessment?.name ||
    "Assessment";


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="dashboard-page">


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <Link
          to="/"
          className="dashboard-brand"
        >

          <span>
            NeuroMatrix
          </span>{" "}
          Pathways

        </Link>


        <div className="dashboard-nav">

          <Link to="/dashboard">
            Dashboard
          </Link>


          <Link to="/profile">
            Profile
          </Link>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">


        {/* ===================================================
            WELCOME
        =================================================== */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-eyebrow">
              YOUR NEUROMATRIX JOURNEY
            </p>


            <h1>
              Welcome back,{" "}
              {displayName}.
            </h1>


            <p>
              This is your personal space
              to explore yourself and
              your future.
            </p>

          </div>


          <div className="profile-avatar">

            {displayName
              .charAt(0)
              .toUpperCase()}

          </div>

        </section>


        {/* ===================================================
            STUDENT STATUS
        =================================================== */}

        <section className="status-banner">

          <div className="status-banner-icon">
            ✓
          </div>


          <div>

            <span>
              CURRENT STUDENT STATUS
            </span>


            <strong>
              {studentStatus}
            </strong>

          </div>


          <Link to="/profile">
            View Profile →
          </Link>

        </section>


        {/* ===================================================
            ASSESSMENT
        =================================================== */}

        <section className="assessment-dashboard-card">


          <div className="assessment-card-content">


            <p className="dashboard-eyebrow">
              YOUR ASSESSMENT
            </p>


            {/* =================================================
                LOADING
            ================================================= */}

            {assessmentLoading ? (

              <>

                <h2>
                  Loading your assessment...
                </h2>


                <p>
                  We're checking which
                  assessment is assigned
                  to your student standard.
                </p>


                <div className="assessment-meta">

                  <div>

                    <span>
                      Questions
                    </span>

                    <strong>
                      ...
                    </strong>

                  </div>


                  <div>

                    <span>
                      Response
                    </span>

                    <strong>
                      ...
                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      Loading
                    </strong>

                  </div>

                </div>

              </>

            ) : assessment ? (

              /* =================================================
                 ASSESSMENT FOUND
              ================================================= */

              <>

                <h2>
                  {assessmentName}
                </h2>


                <p>
                  {assessment.description ||
                    "Your assessment is designed according to your current stage of education. Take your time and answer each statement honestly."}
                </p>


                <div className="assessment-meta">


                  <div>

                    <span>
                      Questions
                    </span>

                    <strong>
                      {questionCount}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Response
                    </span>

                    <strong>

                      {responseScale
                        ? `${responseScale} Point Scale`
                        : "—"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      Not Started
                    </strong>

                  </div>


                </div>


                <Link
                  to="/assessment"
                  className="dashboard-start-button"
                >

                  Start Assessment

                  <span>
                    →
                  </span>

                </Link>

              </>

            ) : (

              /* =================================================
                 NO ASSESSMENT
              ================================================= */

              <>

                <h2>
                  No assessment assigned yet.
                </h2>


                <p>
                  {assessmentError ||
                    "There is currently no assessment assigned to your student standard."}
                </p>


                <div className="assessment-meta">


                  <div>

                    <span>
                      Questions
                    </span>

                    <strong>
                      —
                    </strong>

                  </div>


                  <div>

                    <span>
                      Response
                    </span>

                    <strong>
                      —
                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      Unavailable
                    </strong>

                  </div>

                </div>

              </>

            )}

          </div>


          {/* =================================================
              VISUAL
          ================================================= */}

          <div className="dashboard-card-visual">

            <div
              className="dashboard-orbit orbit-a"
            />


            <div
              className="dashboard-orbit orbit-b"
            />


            <div
              className="dashboard-center"
            >

              <span>
                NM
              </span>

            </div>

          </div>


        </section>


        
        {/* ===================================================
            BOTTOM CARDS
        =================================================== */}

        <section className="dashboard-bottom-grid">

          {/* My Profile */}

          <Link
            to="/profile"
            className="dashboard-small-card"
          >
            <div className="small-card-icon">
              ◉
            </div>

            <div>
              <h3>My Profile</h3>

              <p>
                View and manage your
                personal information.
              </p>
            </div>

            <span className="small-card-arrow">
              →
            </span>
          </Link>

          {/* My Report */}

          <Link
            to="/report"
            className="dashboard-small-card nm-report-dashboard-card"
            aria-label="View your assessment report"
          >
            <div className="small-card-icon">
              ◈
            </div>

            <div>
              <h3>My Report</h3>

              <p>
                View your completed assessment,
                dimension scores, and recorded responses.
              </p>

              <strong className="nm-dashboard-report-link">
                View Report →
              </strong>
            </div>

            <span className="small-card-arrow">
              →
            </span>
          </Link>

        </section>

      </main>

    </div>
  );

}

export default Dashboard;
