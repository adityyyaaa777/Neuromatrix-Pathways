import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/editorial.css";

function About() {
  return (
    <div className="nm-about">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="nm-about-hero">

        <div className="nm-about-hero-bg"></div>

        <div className="nm-container nm-about-hero-content">

          <div className="nm-about-hero-copy">

            <p className="nm-eyebrow nm-about-eyebrow">
              🧠 ABOUT NEUROMATRIX
            </p>

            <h1>
              Guidance built
              <br />
              around <em>you.</em>
            </h1>

            <p>
              NeuroMatrix Pathways brings together psychological
              assessment, career guidance and thoughtful
              self-reflection to help students understand
              their possibilities.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="nm-section nm-section-light">

        <div className="nm-container">

          <div className="nm-about-intro">

            <div>

              <p className="nm-eyebrow">
                🌱 OUR PURPOSE
              </p>

              <h2 className="nm-title">
                Before choosing a path,
                <br />
                <em>understand yourself.</em>
              </h2>

            </div>

            <div className="nm-about-intro-text">

              <p>
                Choosing a stream, course or career can feel
                like a decision that has to be made perfectly.
              </p>

              <p>
                Our approach starts somewhere different.
                We create space for students to understand
                their interests, strengths, preferences and
                questions before turning those reflections
                into possible directions.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          FOUNDER
      ===================================================== */}

      <section className="nm-section nm-about-founder-section">
        <div className="nm-container">
          <div className="nm-about-founder">

{/* Founder image */}
<div className="nm-about-founder-image">
  <img
    src="/About_image.png"
    alt="Dr. Seema Wagh, Founder and Career Mentor"
    className="nm-founder-photo"
    loading="lazy"
    onError={(e) => {
      console.error("Founder image failed to load:", e.currentTarget.src);
    }}
  />

  <div className="nm-founder-badge">
    <span>🎓</span>
    <div>
      <strong>Gold Medalist</strong>
      <div>Academic Excellence</div>
    </div>
  </div>
</div>


            {/* Founder information */}
            <div className="nm-about-founder-content">
              <p className="nm-eyebrow">
                👩‍🏫 FOUNDER &amp; CAREER MENTOR
              </p>

              <h2 className="nm-title">
                Meet Dr. Seema
                <br />
                <em>Wagh.</em>
              </h2>

              <div className="nm-about-divider"></div>

              <p>
                Her academic achievements reflect both
                excellence and dedication. She holds an
                M.Sc. in Zoology from NMU, where she was
                awarded a Gold Medal, along with qualifications
                including M.A. in Psychology, D.Lit., M.Phil.,
                B.Ed., and a Diploma in Psychological Assessment.
              </p>

              <p>
                She has also pursued specialized training in
                Career and Educational Counselling and
                psychological assessment to further strengthen
                her expertise in student guidance and
                counselling psychology.
              </p>

              {/* Areas of expertise */}
              <div className="nm-founder-expertise">
                <div>
                  <span>🧠</span>
                  <div>
                    <strong>Psychology</strong>
                    <small>Psychological expertise</small>
                  </div>
                </div>

                <div>
                  <span>🎯</span>
                  <div>
                    <strong>Career Guidance</strong>
                    <small>Student-focused counselling</small>
                  </div>
                </div>

                <div>
                  <span>📚</span>
                  <div>
                    <strong>Education</strong>
                    <small>Educational mentoring</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          APPROACH
      ===================================================== */}

      <section className="nm-section nm-section-blue">

        <div className="nm-container">

          <div className="nm-home-section-heading">

            <div>

              <p className="nm-eyebrow">
                💡 OUR APPROACH
              </p>

              <h2 className="nm-title">
                More than a result.
                <br />
                <em>A clearer conversation.</em>
              </h2>

            </div>

            <p className="nm-subtitle">
              NeuroMatrix is designed to make self-reflection
              useful. The goal isn't to tell you who you are
              or what you must become — it's to help you ask
              better questions about what comes next.
            </p>

          </div>


          <div className="nm-about-principles">

            <article className="nm-card">

              <div className="nm-card-icon">
                �
              </div>

              <span className="nm-principle-label">
                UNDERSTAND
              </span>

              <h3>
                Start with yourself.
              </h3>

              <p>
                Understand your patterns, interests,
                preferences and strengths before making
                an important decision.
              </p>

            </article>


            <article className="nm-card">

              <div className="nm-card-icon">
                ðŸ”
              </div>

              <span className="nm-principle-label">
                EXPLORE
              </span>

              <h3>
                Look beyond the obvious.
              </h3>

              <p>
                Explore academic and career possibilities
                with more context instead of choosing only
                from familiar options.
              </p>

            </article>


            <article className="nm-card">

              <div className="nm-card-icon">
                🚀
              </div>

              <span className="nm-principle-label">
                MOVE FORWARD
              </span>

              <h3>
                Turn insight into action.
              </h3>

              <p>
                Use reflection as a starting point for
                practical next steps that you can actually
                explore.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          CREDENTIALS
      ===================================================== */}

      <section className="nm-section nm-section-light">

        <div className="nm-container">

          <div className="nm-about-credentials">

            <div className="nm-about-credentials-heading">

              <p className="nm-eyebrow">
                🎓 BACKGROUND
              </p>

              <h2 className="nm-title">
                A multidisciplinary
                <br />
                <em>perspective.</em>
              </h2>

              <p>
                A combination of academic knowledge,
                psychological training and counselling
                experience supports the NeuroMatrix approach.
              </p>

            </div>


            <div className="nm-credentials-grid">

              <div className="nm-credential">

                <span>🎓</span>

                <small>
                  ACADEMIC
                </small>

                <strong>
                  M.Sc. · M.A. Psychology · D.Lit.
                </strong>

              </div>


              <div className="nm-credential">

                <span>📖</span>

                <small>
                  ADDITIONAL
                </small>

                <strong>
                  M.Phil. · B.Ed.
                </strong>

              </div>


              <div className="nm-credential">

                <span>🧠</span>

                <small>
                  ASSESSMENT
                </small>

                <strong>
                  Diploma in Psychological Assessment
                </strong>

              </div>


              <div className="nm-credential">

                <span>🎯</span>

                <small>
                  COUNSELLING
                </small>

                <strong>
                  Career & Educational Counselling Training
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


       {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="nm-home-footer">

        <div className="nm-container">

          <div className="nm-footer-brand">

            <strong>
              NEUROMATRIX
            </strong>

            <span>
              PATHWAYS · STUDENT ASSESSMENT PLATFORM
            </span>

          </div>


          <div className="nm-footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/why-counselling">
              Why Counselling
            </Link>

            <Link to="/insights">
              Insights
            </Link>

            <Link to="/services">
              Services
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default About;
