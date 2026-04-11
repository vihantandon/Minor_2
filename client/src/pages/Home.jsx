import { Link } from "react-router-dom";

const STATS = [
  { val: "12,400+", label: "Problems" },
  { val: "340+",    label: "Contests" },
  { val: "8,200+",  label: "Students" },
  { val: "96%",     label: "Satisfaction" },
];

const FEATURES = [
  { id: "01", title: "Adaptive Problem Bank", desc: "12,000+ curated Olympiad-level problems across Mathematics & Chemistry. ELO-tagged by difficulty from 800 to 3500." },
  { id: "02", title: "Live Rated Contests",   desc: "Real-time competitive contests. Live leaderboards powered by Go WebSockets and Redis. Every solve updates your rating instantly." },
  { id: "03", title: "ELO Rating Engine",     desc: "Climb from Pupil to Grandmaster. Your rating evolves after every contest based on rank, time, and problems solved." },
  { id: "04", title: "AI Study Coach",        desc: "Gemini AI analyses your submission history, identifies weak topics, and surfaces targeted YouTube resources." },
  { id: "05", title: "Contributor Mode",      desc: "Reach rating 2000+ to unlock contributor access. Create and curate problems and contests for the community." },
  { id: "06", title: "Global Leaderboard",    desc: "See where you stand against the best Olympiad students worldwide. Filter by country, subject, and rating tier." },
];

const TOPPERS = [
  { rank: 1, name: "Krish Wadhwa",  rating: 3200, tier: "Grandmaster", you: true },
  { rank: 2, name: "Aanya Sharma",  rating: 3050, tier: "Grandmaster", you: false },
  { rank: 3, name: "Rohan Mehta",   rating: 2980, tier: "Grandmaster", you: false },
  { rank: 4, name: "Priya Nair",    rating: 2870, tier: "Master",      you: false },
  { rank: 5, name: "Vikram Singh",  rating: 2790, tier: "Master",      you: false },
];

const TIER_COLOR = { Grandmaster: "#ff4060", Master: "#f0c040", Expert: "var(--teal)", Pupil: "var(--green)" };

export default function Home() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "88vh", display: "flex", alignItems: "center",
        borderBottom: "1px solid var(--border-2)", position: "relative", overflow: "hidden",
      }}>
        {/* Structural grid lines like We Cargo */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border-2)", opacity: 0.4 }} />
        <div style={{ position: "absolute", right: "20%", top: 0, bottom: 0, width: 1, background: "var(--border-2)", opacity: 0.2 }} />

        <div className="container" style={{ width: "100%" }}>
          <div className="anim-up" style={{ marginBottom: 20 }}>
            <span className="section-label">International Science Olympiad Platform</span>
          </div>

          {/* MASSIVE headline like USACO Guide */}
          <h1 className="anim-up-1 font-display" style={{
            fontSize: "clamp(5rem, 13vw, 11rem)", lineHeight: 0.9,
            color: "var(--text)", marginBottom: 32, letterSpacing: "0.01em",
          }}>
            TRAIN.<br />
            COMPETE.<br />
            <span className="accent-grad">DOMINATE.</span>
          </h1>

          <p className="anim-up-2" style={{
            fontSize: "1.05rem", color: "var(--text-2)", maxWidth: 520,
            lineHeight: 1.7, marginBottom: 44, fontWeight: 300,
          }}>
            A curated, high-quality platform to take you from beginner to{" "}
            <span style={{ color: "var(--teal)", fontWeight: 500 }}>Grandmaster</span>{" "}
            in Mathematics and Chemistry Olympiads.
          </p>

          <div className="anim-up-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 80 }}>
            <Link to="/contests"><button className="btn btn-primary">Get Started →</button></Link>
            <Link to="/questions"><button className="btn btn-ghost">Browse Problems</button></Link>
          </div>

          {/* Stats row like We Cargo date/location boxes */}
          <div className="anim-up-4" style={{ display: "flex", flexWrap: "wrap", gap: 0, borderTop: "1px solid var(--border-2)" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: "24px 40px", borderRight: "1px solid var(--border-2)",
                minWidth: 140,
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.4rem",
                  color: "var(--text)", lineHeight: 1, marginBottom: 4,
                }}>{s.val}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section style={{ padding: "100px 0", borderBottom: "1px solid var(--border-2)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60 }}>
            <div>
              <span className="section-label" style={{ marginBottom: 14, display: "flex" }}>Platform Features</span>
              <h2 className="font-display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1 }}>
                EVERYTHING YOU NEED<br />
                <span className="accent">TO WIN.</span>
              </h2>
            </div>
            <Link to="/questions" style={{ display: "none" }}></Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "var(--border-2)" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ padding: "36px 32px", background: "var(--dark)", gap: 0 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
                  color: "var(--teal)", letterSpacing: "0.15em", marginBottom: 20,
                }}>{f.id}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", marginBottom: 14, letterSpacing: "0.04em" }}>{f.title}</h3>
                <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ───────────────────────────────────────────── */}
      <section style={{ padding: "100px 0", borderBottom: "1px solid var(--border-2)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <div>
              <span className="section-label" style={{ marginBottom: 14, display: "flex" }}>Season 3 Rankings</span>
              <h2 className="font-display" style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", lineHeight: 1, marginBottom: 12 }}>
                GLOBAL<br />LEADERBOARD
              </h2>
              <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
                Top performers ranked by ELO rating across all contests this season.
              </p>
              <Link to="/contests"><button className="btn btn-outline" style={{ fontSize: "0.72rem" }}>View All Rankings →</button></Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-2)" }}>
              {TOPPERS.map((t, i) => (
                <div key={i} style={{
                  background: t.you ? "rgba(0,255,200,0.04)" : "var(--dark)",
                  padding: "18px 24px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", borderLeft: t.you ? "2px solid var(--teal)" : "2px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
                      color: i === 0 ? "var(--gold)" : "var(--text-3)", minWidth: 24,
                    }}>#{t.rank}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: 2 }}>
                        {t.name}
                        {t.you && <span style={{ marginLeft: 8, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "var(--teal)", border: "1px solid var(--teal)", padding: "1px 6px" }}>YOU</span>}
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)" }}>{t.tier}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: TIER_COLOR[t.tier] }}>{t.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="section-label" style={{ justifyContent: "center", marginBottom: 20, display: "flex" }}>Join Now</span>
          <h2 className="font-display" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", lineHeight: 0.95, marginBottom: 32 }}>
            READY TO<br /><span className="accent">REACH THE TOP?</span>
          </h2>
          <p style={{ color: "var(--text-2)", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.7, fontWeight: 300 }}>
            Join 8,000+ students preparing for IMO, IChO and national Olympiads. Free forever.
          </p>
          <Link to="/login"><button className="btn btn-primary" style={{ padding: "16px 48px", fontSize: "0.82rem" }}>Start Training →</button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-2)", padding: "28px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)" }}>
            © 2026 OLYMPIADHUB — BUILT FOR CHAMPIONS
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)" }}>
            GO · REACT · POSTGRES · REDIS
          </span>
        </div>
      </footer>
    </div>
  );
}
