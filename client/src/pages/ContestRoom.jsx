import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getContest } from "../api/client";

function useTimer(secs) {
  const [left, setLeft] = useState(secs);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(left / 60),
    s = left % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ContestRoom() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [ans, setAns] = useState({});
  const [sub, setSub] = useState({});
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("problem");
  const timer = useTimer(45 * 60);

  useEffect(() => {
    getContest(id)
      .then(({ data }) => setContest(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: 40,
          fontFamily: "'Space Mono',monospace",
          color: "var(--text-3)",
        }}
      >
        // LOADING CONTEST...
      </div>
    );

  if (!contest)
    return (
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: 40,
          fontFamily: "'Space Mono',monospace",
          color: "var(--red)",
        }}
      >
        // CONTEST NOT FOUND
      </div>
    );

  const QS = contest.questions || [];
  const q = QS[sel];
  const urgent = parseInt(timer.split(":")[0]) < 10;

  const handleSub = () => {
    if (!input.trim()) return;
    setSub((s) => ({ ...s, [sel]: input }));
    setAns((a) => ({ ...a, [sel]: input }));
    setInput("");
  };

  const diffCls = (d) =>
    d < 1300 ? "tag-green" : d < 1800 ? "tag-gold" : "tag-red";

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 92px)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "var(--dark-2)",
          borderBottom: "1px solid var(--border-2)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "1.2rem",
              letterSpacing: "0.06em",
            }}
          >
            OLYMPIAD SPRINT #47
          </span>
          <span
            style={{
              marginLeft: 12,
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            342 PARTICIPANTS
          </span>
        </div>
        <div
          style={{
            padding: "8px 20px",
            border: `1px solid ${urgent ? "rgba(255,64,96,0.5)" : "var(--border-2)"}`,
            background: urgent ? "rgba(255,64,96,0.08)" : "transparent",
            fontFamily: "'Space Mono',monospace",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: urgent ? "#ff4060" : "var(--text)",
            letterSpacing: "0.1em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {timer}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            className={`tag ${Object.keys(sub).length === QS.length ? "tag-teal" : ""}`}
            style={{ fontSize: "0.62rem" }}
          >
            {Object.keys(sub).length}/{QS.length} SOLVED
          </span>
          <span className="tag tag-gold" style={{ fontSize: "0.62rem" }}>
            RANK #1
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 180,
            borderRight: "1px solid var(--border-2)",
            background: "var(--dark)",
            overflowY: "auto",
            flexShrink: 0,
            padding: "12px 8px",
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.58rem",
              color: "var(--text-3)",
              padding: "4px 8px",
              marginBottom: 8,
              letterSpacing: "0.12em",
            }}
          >
            // PROBLEMS
          </div>
          {QS.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setSel(i);
                setInput(ans[i] || "");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 10px",
                background:
                  sel === i
                    ? "var(--teal-dim)"
                    : sub[i]
                      ? "rgba(0,255,200,0.04)"
                      : "transparent",
                border: "none",
                borderLeft: `2px solid ${sel === i ? "var(--teal)" : sub[i] ? "rgba(0,255,200,0.3)" : "transparent"}`,
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
                marginBottom: 2,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.68rem",
                  color:
                    sel === i
                      ? "var(--teal)"
                      : sub[i]
                        ? "rgba(0,255,200,0.7)"
                        : "var(--text-2)",
                }}
              >
                Q{i + 1} {sub[i] ? "✓" : ""}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.58rem",
                  color: "var(--text-3)",
                  marginTop: 2,
                }}
              >
                {q.difficulty}
              </div>
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
          {/* View tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 24,
              borderBottom: "1px solid var(--border-2)",
            }}
          >
            {["problem", "leaderboard"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: tab === t ? "var(--teal)" : "var(--text-3)",
                  borderBottom:
                    tab === t
                      ? "2px solid var(--teal)"
                      : "2px solid transparent",
                  marginBottom: -1,
                  transition: "all .15s",
                }}
              >
                {t === "problem" ? "// PROBLEM" : "// LEADERBOARD"}
              </button>
            ))}
          </div>

          {tab === "problem" ? (
            <>
              {/* Problem card */}
              <div
                style={{
                  border: "1px solid var(--border-2)",
                  padding: "28px",
                  marginBottom: 20,
                  background: "var(--dark)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 24,
                    height: 1,
                    background: "var(--teal)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 1,
                    height: 24,
                    background: "var(--teal)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="tag tag-teal" style={{ fontSize: "0.6rem" }}>
                    Q{sel + 1}
                  </span>
                  <span className="tag" style={{ fontSize: "0.6rem" }}>
                    {q.topic.toUpperCase()}
                  </span>
                  <span
                    className={`tag ${diffCls(q.difficulty)}`}
                    style={{ fontSize: "0.6rem" }}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: "1.5rem",
                    letterSpacing: "0.04em",
                    lineHeight: 1.3,
                  }}
                >
                  {q.title}
                </h2>
              </div>

              {/* Answer */}
              <div
                style={{
                  border: "1px solid var(--border-2)",
                  padding: "24px",
                  background: "var(--dark)",
                }}
              >
                <label
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.62rem",
                    color: "var(--text-3)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  // Your Answer
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write your solution or answer..."
                  rows={5}
                  disabled={!!sub[sel]}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "var(--dark-2)",
                    border: "1px solid var(--border-2)",
                    color: "var(--text)",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.78rem",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    opacity: sub[sel] ? 0.5 : 1,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "0.62rem",
                      color: sub[sel] ? "var(--teal)" : "var(--text-3)",
                    }}
                  >
                    {sub[sel] ? "// SUBMITTED ✓" : "// AWAITING SUBMISSION"}
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={handleSub}
                    disabled={!!sub[sel] || !input.trim()}
                    style={{
                      padding: "10px 24px",
                      fontSize: "0.7rem",
                      opacity: sub[sel] || !input.trim() ? 0.4 : 1,
                    }}
                  >
                    {sub[sel] ? "Submitted ✓" : "Submit →"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  background: "var(--border-2)",
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 80px 80px 60px",
                    padding: "10px 16px",
                    background: "var(--dark-3)",
                    gap: 12,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.6rem",
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  <span>Rank</span>
                  <span>Name</span>
                  <span>Solved</span>
                  <span>Time</span>
                  <span>Delta</span>
                </div>
                {LB.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 80px 80px 60px",
                      padding: "14px 16px",
                      gap: 12,
                      alignItems: "center",
                      background: p.you
                        ? "rgba(0,255,200,0.04)"
                        : "var(--dark)",
                      borderLeft: p.you
                        ? "2px solid var(--teal)"
                        : "2px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.7rem",
                        color: i === 0 ? "var(--gold)" : "var(--text-3)",
                      }}
                    >
                      #{p.rank}
                    </span>
                    <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                      {p.name}
                      {p.you && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontFamily: "'Space Mono',monospace",
                            fontSize: "0.58rem",
                            color: "var(--teal)",
                            border: "1px solid var(--teal)",
                            padding: "1px 5px",
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.65rem",
                        color: "var(--text-2)",
                      }}
                    >
                      {p.solved}/8
                    </span>
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                      }}
                    >
                      {p.time}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.7rem",
                        color: "var(--teal)",
                        fontWeight: 700,
                      }}
                    >
                      {p.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
