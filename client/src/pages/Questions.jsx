import React, { useState, useEffect } from "react";
import client from "../api/client";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

const TOPICS = [
  "All",
  "Counting & Probability",
  "Precalculus",
  "Prealgebra",
  "Algebra",
  "Geometry",
  "Number Theory",
  "Intermediate Algebra",
];

const diffInfo = (d) => {
  // 0 = LOW, 1 = MEDIUM, 2 = HIGH based on your Go enum
  if (d === 0) return { label: "Easy", cls: "diff-easy", tag: "tag-green" };
  if (d === 1) return { label: "Medium", cls: "diff-medium", tag: "tag-gold" };
  return { label: "Hard", cls: "diff-hard", tag: "tag-red" };
};

export default function Questions() {
  // Data state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [topic, setTopic] = useState("All");
  const [diff, setDiff] = useState("All");

  // Fetch data on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await client.get("/api/questions");
        setQuestions(response.data);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Could not load problems. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Normalize the fetched data to handle Go's capitalized fields vs JSON tags,
  // and provide fallbacks for fields like "subject" or "solved" if they aren't in your DB yet.
  // Normalize the fetched data to handle the QnA struct
  const normalizedQuestions = questions.map((q, index) => ({
    id: q.ID || q.id || index,
    title: q.Question || q.question || "Untitled Problem", // Using 'Question' field
    topic: q.Topic || q.topic || "General", // Using 'Topic' field
    subject: q.Topic || q.topic || "Mathematics", // QnA only has Topic, so we mirror it
    difficulty: q.Difficulty ?? q.difficulty ?? 0, // 0, 1, or 2
    solved: false, // Add this to struct later if needed
  }));

  // Apply filters to the normalized data
  const filtered = normalizedQuestions.filter((q) => {
    const s = q.title.toLowerCase().includes(search.toLowerCase());
    const su = subject === "All" || q.subject === subject;
    const t = topic === "All" || q.topic === topic;
    const d_filter =
      diff === "All" ||
      (diff === "Easy" && q.difficulty === 0) ||
      (diff === "Medium" && q.difficulty === 1) ||
      (diff === "Hard" && q.difficulty === 2);
    return s && su && t && d_filter;
  });

  if (loading) {
    return (
      <div
        style={{
          padding: "120px 0",
          textAlign: "center",
          color: "var(--text-3)",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Loading problem archive...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "120px 0",
          textAlign: "center",
          color: "var(--red)",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {error}
      </div>
    );
  }

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
              <span className="accent">{normalizedQuestions.length} Total</span>
            </h1>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.65rem",
                color: "var(--text-3)",
              }}
            >
              Showing {filtered.length} / {normalizedQuestions.length}
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
              prefix: "SUBJ",
            },
            {
              val: diff,
              set: setDiff,
              opts: ["All", "Easy", "Medium", "Hard"],
              prefix: "DIFF",
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
                  {f.prefix}: {o}
                </option>
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
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--text-3)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            No problems match your filters.
          </div>
        ) : (
          filtered.map((q, i) => {
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

                {/* UPDATED: Wrap the title in the <Latex> component.
                          This will parse inline $math$ and block $$math$$.
                        */}
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Latex>{q.title}</Latex>
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
          })
        )}
      </div>
    </div>
  );
}
