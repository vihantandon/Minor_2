import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listContests } from "../api/client";

// Map backend status int to UI tab key
const STATUS_MAP = { 0: "upcoming", 1: "live", 2: "past" };

const STATUS_META = {
  live: { label: "LIVE", tagCls: "tag-red", dot: "#ff4060" },
  upcoming: { label: "UPCOMING", tagCls: "tag-gold", dot: "#f0c040" },
  past: { label: "ENDED", tagCls: "", dot: "var(--text-3)" },
};

export default function Contests() {
  const [tab, setTab] = useState("live");
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContests()
      .then(({ data }) => setContests(Array.isArray(data) ? data : []))
      .catch(() => setContests([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contests.filter((c) => STATUS_MAP[c.status] === tab);

  const liveCnt = contests.filter(
    (c) => STATUS_MAP[c.status] === "live",
  ).length;
  const upcomingCnt = contests.filter(
    (c) => STATUS_MAP[c.status] === "upcoming",
  ).length;

  return (
    <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
      {/* Header — unchanged */}
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
            Rated Competitions
          </span>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1 }}
          >
            CONTESTS
            <br />
            <span className="accent">SEASON 3</span>
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 36,
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          {["live", "upcoming", "past"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "12px 28px",
                background: "none",
                border: "none",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                color: tab === t ? "var(--teal)" : "var(--text-3)",
                borderBottom:
                  tab === t ? "2px solid var(--teal)" : "2px solid transparent",
                marginBottom: -1,
                transition: "all .15s",
              }}
            >
              {t === "live" && (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ff4060",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />
              )}
              {t}
              {t === "live" && liveCnt > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.6rem",
                    color: "#ff4060",
                  }}
                >
                  {liveCnt}
                </span>
              )}
              {t === "upcoming" && upcomingCnt > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.6rem",
                    color: "#f0c040",
                  }}
                >
                  {upcomingCnt}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: "var(--text-3)",
              padding: "40px 0",
            }}
          >
            // LOADING CONTESTS...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: "var(--text-3)",
              padding: "40px 0",
            }}
          >
            // NO {tab.toUpperCase()} CONTESTS
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: "var(--border-2)",
            }}
          >
            {filtered.map((c) => {
              const statusKey = STATUS_MAP[c.status];
              const meta = STATUS_META[statusKey];
              const timeLabel =
                statusKey === "live"
                  ? "LIVE NOW"
                  : statusKey === "upcoming"
                    ? new Date(c.starts_at).toLocaleString()
                    : new Date(c.ends_at).toLocaleString();

              return (
                <div
                  key={c.id}
                  style={{
                    background: "var(--dark)",
                    padding: "32px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 24,
                    alignItems: "center",
                    borderLeft:
                      statusKey === "live"
                        ? "2px solid #ff4060"
                        : "2px solid transparent",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--dark-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--dark)")
                  }
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 14,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span className={`tag ${meta.tagCls}`}>
                        {statusKey === "live" && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: meta.dot,
                              display: "inline-block",
                              marginRight: 4,
                            }}
                          />
                        )}
                        {meta.label}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.8rem",
                        letterSpacing: "0.04em",
                        marginBottom: 10,
                      }}
                    >
                      {c.title}
                    </h2>
                    {c.description && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-2)",
                          marginBottom: 10,
                        }}
                      >
                        {c.description}
                      </p>
                    )}
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                      }}
                    >
                      {c.questions?.length > 0 &&
                        `${c.questions.length} PROBLEMS`}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 20px",
                        border: "1px solid var(--border-2)",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.7rem",
                        color:
                          statusKey === "live" ? "#ff4060" : "var(--text-3)",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {timeLabel}
                    </div>
                    {statusKey === "live" && (
                      <Link to={`/contest/${c.id}`}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "12px 28px", fontSize: "0.72rem" }}
                        >
                          Join Now →
                        </button>
                      </Link>
                    )}
                    {statusKey === "upcoming" && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "11px 24px" }}
                      >
                        Set Reminder
                      </button>
                    )}
                    {statusKey === "past" && (
                      <Link to={`/contest/${c.id}`}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "11px 24px" }}
                        >
                          View Results
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
