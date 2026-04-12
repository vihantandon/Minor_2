import { useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    title: "Prove that √2 is irrational",
    subject: "Mathematics",
    topic: "Number Theory",
    difficulty: 1200,
    solved: true,
    attempts: 3421,
  },
  {
    id: 2,
    title: "Find all integer solutions to x² − y² = 100",
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: 1500,
    solved: false,
    attempts: 2187,
  },
  {
    id: 3,
    title: "Valence bond theory and hybridization of SF₆",
    subject: "Chemistry",
    topic: "Inorganic",
    difficulty: 1300,
    solved: true,
    attempts: 1890,
  },
  {
    id: 4,
    title: "Radical axis theorem — Olympiad proof",
    subject: "Mathematics",
    topic: "Geometry",
    difficulty: 2100,
    solved: false,
    attempts: 987,
  },
  {
    id: 5,
    title: "SN1 vs SN2 reaction mechanisms",
    subject: "Chemistry",
    topic: "Organic",
    difficulty: 1600,
    solved: false,
    attempts: 2543,
  },
  {
    id: 6,
    title: "Cauchy-Schwarz inequality: 5 approaches",
    subject: "Mathematics",
    topic: "Inequalities",
    difficulty: 1900,
    solved: true,
    attempts: 1234,
  },
  {
    id: 7,
    title: "Balancing complex redox reactions",
    subject: "Chemistry",
    topic: "Electrochemistry",
    difficulty: 1100,
    solved: true,
    attempts: 3102,
  },
  {
    id: 8,
    title: "Pigeonhole principle — contest problems",
    subject: "Mathematics",
    topic: "Combinatorics",
    difficulty: 2300,
    solved: false,
    attempts: 654,
  },
  {
    id: 9,
    title: "Thermodynamics: Gibbs free energy derivation",
    subject: "Chemistry",
    topic: "Physical",
    difficulty: 1750,
    solved: false,
    attempts: 1120,
  },
  {
    id: 10,
    title: "IMO 2019 Problem 1 — angle bisector",
    subject: "Mathematics",
    topic: "Geometry",
    difficulty: 2600,
    solved: false,
    attempts: 430,
  },
];

const TOPICS = [
  "All",
  "Algebra",
  "Geometry",
  "Number Theory",
  "Combinatorics",
  "Inequalities",
  "Organic",
  "Inorganic",
  "Electrochemistry",
  "Physical",
];

const diffInfo = (d) => {
  if (d < 1300) return { label: "Easy", cls: "diff-easy", tag: "tag-green" };
  if (d < 1800) return { label: "Medium", cls: "diff-medium", tag: "tag-gold" };
  return { label: "Hard", cls: "diff-hard", tag: "tag-red" };
};

export default function Questions() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [topic, setTopic] = useState("All");
  const [diff, setDiff] = useState("All");

  const filtered = QUESTIONS.filter((q) => {
    const s = q.title.toLowerCase().includes(search.toLowerCase());
    const su = subject === "All" || q.subject === subject;
    const t = topic === "All" || q.topic === topic;
    const d =
      diff === "All" ||
      (diff === "Easy" && q.difficulty < 1300) ||
      (diff === "Medium" && q.difficulty >= 1300 && q.difficulty < 1800) ||
      (diff === "Hard" && q.difficulty >= 1800);
    return s && su && t && d;
  });

  return (
    <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border-2)",
          padding: "48px 0 36px",
        }}
      >
        <div className="container">
          <span
            className="section-label"
            style={{ marginBottom: 12, display: "flex" }}
          >
            Problem Archive
          </span>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1 }}
            >
              PROBLEMS
              <br />
              <span className="accent">12,400+</span>
            </h1>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.65rem",
                color: "var(--text-3)",
              }}
            >
              Showing {filtered.length} / {QUESTIONS.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          <input
            className="input"
            style={{ flex: "1 1 200px", maxWidth: 280 }}
            placeholder="// search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {[
            {
              val: subject,
              set: setSubject,
              opts: ["All", "Mathematics", "Chemistry"],
              label: "SUBJ",
            },
            {
              val: diff,
              set: setDiff,
              opts: ["All", "Easy", "Medium", "Hard"],
              label: "DIFF",
            },
          ].map((f, i) => (
            <select
              key={i}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="input"
              style={{ width: "auto", paddingLeft: 12 }}
            >
              {f.opts.map((o) => (
                <option key={o} value={o}>
                  {f.label}: {o}
                </option> // value=o not "LABEL: o"
              ))}
            </select>
          ))}
        </div>

        {/* Topic pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 28,
          }}
        >
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              style={{
                padding: "5px 14px",
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "1px solid",
                transition: "all .15s",
                borderColor: topic === t ? "var(--teal)" : "var(--border-2)",
                color: topic === t ? "var(--teal)" : "var(--text-3)",
                background: topic === t ? "var(--teal-dim)" : "transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 140px 100px 80px 70px",
            padding: "8px 16px",
            borderBottom: "1px solid var(--border-2)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            gap: 12,
          }}
        >
          <span>#</span>
          <span>Title</span>
          <span>Topic</span>
          <span>Subject</span>
          <span>Rating</span>
          <span>Diff</span>
        </div>

        {/* Rows */}
        {filtered.map((q, i) => {
          const d = diffInfo(q.difficulty);
          return (
            <div
              key={q.id}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr 140px 100px 80px 70px",
                padding: "14px 16px",
                gap: 12,
                cursor: "pointer",
                borderBottom: "1px solid var(--border-2)",
                background: "transparent",
                transition: "background .15s",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--dark-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.65rem",
                  color: q.solved ? "var(--teal)" : "var(--text-3)",
                }}
              >
                {q.solved ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                {q.title}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {q.topic}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {q.subject.slice(0, 4).toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.7rem",
                  color: "var(--text-2)",
                }}
              >
                {q.difficulty}
              </span>
              <span
                className={`tag ${d.tag}`}
                style={{ fontSize: "0.6rem", padding: "3px 8px" }}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
