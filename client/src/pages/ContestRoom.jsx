import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContest, submitAnswer } from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Counts down to a target UTC timestamp (ISO string).
// Returns "MM:SS" string. Returns "00:00" when expired.
function useContestTimer(endsAt) {
  const calcLeft = () => {
    if (!endsAt) return 0;
    return Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
  };

  const [left, setLeft] = useState(calcLeft);

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => {
      const remaining = calcLeft();
      setLeft(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Stub leaderboard — replace with real API data when endpoint is ready
const LB_STUB = [
  {
    rank: 1,
    name: "Krish Wadhwa",
    solved: 7,
    time: "38:14",
    delta: "+150",
    you: false,
  },
  {
    rank: 2,
    name: "Aanya Sharma",
    solved: 6,
    time: "41:02",
    delta: "+110",
    you: false,
  },
  {
    rank: 3,
    name: "Rohan Mehta",
    solved: 6,
    time: "44:55",
    delta: "+95",
    you: false,
  },
  {
    rank: 4,
    name: "Priya Nair",
    solved: 5,
    time: "39:30",
    delta: "+80",
    you: true,
  },
  {
    rank: 5,
    name: "Vikram Singh",
    solved: 4,
    time: "42:18",
    delta: "+60",
    you: false,
  },
];

export default function ContestRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [ans, setAns] = useState({}); // { questionIndex: lastAnswerText }
  const [sub, setSub] = useState({}); // { questionIndex: true } once submitted
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("problem");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getContest(id)
      .then(({ data }) => setContest(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const timer = useContestTimer(contest?.ends_at);
  const urgent = contest
    ? (() => {
        const secsLeft = Math.max(
          0,
          Math.floor((new Date(contest.ends_at) - Date.now()) / 1000),
        );
        return secsLeft < 600; // < 10 minutes
      })()
    : false;

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
  const q = QS[sel]; // ContestQuestionDTO

  const diffCls = (d) =>
    d === 0 ? "tag-green" : d === 1 ? "tag-gold" : "tag-red";
  const diffLabel = (d) => (d === 0 ? "Easy" : d === 1 ? "Medium" : "Hard");

  const handleSub = async () => {
    if (!input.trim() || submitting) return;

    setSubmitting(true);
    try {
      await submitAnswer(id, q.question_id, input.trim());
      // Store the submitted answer locally so the textarea shows it
      setAns((a) => ({ ...a, [sel]: input }));
      setSub((s) => ({ ...s, [sel]: true }));
      setInput("");
      // No success toast — users are not told if they're right or wrong
    } catch (err) {
      const msg = err.response?.data?.error || "Submission failed";
      toast.error(`// ${msg.toUpperCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Allow resubmission: clicking a submitted question re-enables the textarea
  const handleQuestionSelect = (i) => {
    setSel(i);
    setInput(ans[i] || "");
    // Allow editing/resubmitting even if previously submitted
    setSub((s) => ({ ...s, [i]: false }));
  };

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
            {contest.title}
          </span>
          <span
            style={{
              marginLeft: 12,
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            {QS.length} PROBLEMS
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
          <span className="tag" style={{ fontSize: "0.62rem" }}>
            {Object.keys(ans).length}/{QS.length} ATTEMPTED
          </span>
          <span className="tag tag-gold" style={{ fontSize: "0.62rem" }}>
            RANK #—
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
          {QS.map((cq, i) => (
            <button
              key={i}
              onClick={() => handleQuestionSelect(i)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 10px",
                background:
                  sel === i
                    ? "var(--teal-dim)"
                    : ans[i]
                      ? "rgba(0,255,200,0.04)"
                      : "transparent",
                border: "none",
                borderLeft: `2px solid ${sel === i ? "var(--teal)" : ans[i] ? "rgba(0,255,200,0.3)" : "transparent"}`,
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
                      : ans[i]
                        ? "rgba(0,255,200,0.7)"
                        : "var(--text-2)",
                }}
              >
                Q{i + 1} {ans[i] ? "✓" : ""}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.58rem",
                  color: "var(--text-3)",
                  marginTop: 2,
                }}
              >
                {diffLabel(cq.question?.difficulty)}
              </div>
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
          {/* Tabs */}
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
            q ? (
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
                    <span
                      className="tag tag-teal"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Q{sel + 1}
                    </span>
                    <span className="tag" style={{ fontSize: "0.6rem" }}>
                      {(q.question?.topic || "General")
                        .slice(0, 4)
                        .toUpperCase()}
                    </span>
                    <span
                      className={`tag ${diffCls(q.question?.difficulty)}`}
                      style={{ fontSize: "0.6rem" }}
                    >
                      {diffLabel(q.question?.difficulty)}
                    </span>
                    <span className="tag" style={{ fontSize: "0.6rem" }}>
                      {q.max_score} PTS
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      lineHeight: 1.75,
                      color: "var(--text-2)",
                    }}
                  >
                    {q.question?.question || "No problem statement available."}
                  </p>
                </div>

                {/* Answer input */}
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
                    placeholder="Write your answer..."
                    rows={5}
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
                        color: ans[sel] ? "var(--teal)" : "var(--text-3)",
                      }}
                    >
                      {ans[sel]
                        ? `// LAST SUBMITTED: ${ans[sel].slice(0, 20)}${ans[sel].length > 20 ? "…" : ""}`
                        : "// AWAITING SUBMISSION"}
                    </span>
                    <button
                      className="btn btn-primary"
                      onClick={handleSub}
                      disabled={!input.trim() || submitting}
                      style={{
                        padding: "10px 24px",
                        fontSize: "0.7rem",
                        opacity: !input.trim() || submitting ? 0.4 : 1,
                      }}
                    >
                      {submitting ? "// SUBMITTING..." : "Submit →"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.7rem",
                  color: "var(--text-3)",
                  padding: "40px 0",
                }}
              >
                // NO PROBLEMS IN THIS CONTEST
              </div>
            )
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
                {LB_STUB.map((p, i) => (
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
                      {p.solved}/{QS.length}
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
