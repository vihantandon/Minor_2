import { useState } from "react";
import { Link } from "react-router-dom";

const CONTESTS = [
  { id:1, title:"Olympiad Sprint #47",     status:"live",     subject:"Mathematics", questions:8,  participants:342, time:"45 MIN LEFT",    diff:"Expert"      },
  { id:2, title:"Chemistry Blitz #12",     status:"live",     subject:"Chemistry",   questions:10, participants:189, time:"1H 20M LEFT",    diff:"Master"      },
  { id:3, title:"Number Theory Dive",      status:"upcoming", subject:"Mathematics", questions:8,  participants:0,   time:"TOMORROW 18:00", diff:"Grandmaster" },
  { id:4, title:"Organic Chemistry Open",  status:"upcoming", subject:"Chemistry",   questions:10, participants:0,   time:"SAT 16:00",      diff:"Expert"      },
  { id:5, title:"Algebra Championship #8", status:"past",     subject:"Mathematics", questions:10, participants:891, time:"2 DAYS AGO",     diff:"Master"      },
  { id:6, title:"Electrochemistry Sprint", status:"past",     subject:"Chemistry",   questions:8,  participants:456, time:"5 DAYS AGO",     diff:"Expert"      },
];

const STATUS_META = {
  live:     { label: "LIVE",     tagCls: "tag-red",   dot: "#ff4060" },
  upcoming: { label: "UPCOMING", tagCls: "tag-gold",  dot: "#f0c040" },
  past:     { label: "ENDED",    tagCls: "",           dot: "var(--text-3)" },
};

export default function Contests() {
  const [tab, setTab] = useState("live");
  const filtered = CONTESTS.filter(c => c.status === tab);

  return (
    <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border-2)", padding: "48px 0 36px" }}>
        <div className="container">
          <span className="section-label" style={{ marginBottom: 12, display: "flex" }}>Rated Competitions</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1 }}>
            CONTESTS<br />
            <span className="accent">SEASON 3</span>
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36, borderBottom: "1px solid var(--border-2)" }}>
          {["live","upcoming","past"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 28px", background: "none", border: "none",
              fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
              letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
              color: tab === t ? "var(--teal)" : "var(--text-3)",
              borderBottom: tab === t ? "2px solid var(--teal)" : "2px solid transparent",
              marginBottom: -1, transition: "all .15s",
            }}>
              {t === "live" && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ff4060", marginRight: 8, verticalAlign: "middle" }} />}
              {t}
              {t === "live" && <span style={{ marginLeft: 8, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#ff4060" }}>2</span>}
            </button>
          ))}
        </div>

        {/* Contest cards — We Cargo style large panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-2)" }}>
          {filtered.map((c) => {
            const meta = STATUS_META[c.status];
            return (
              <div key={c.id} style={{
                background: "var(--dark)", padding: "32px",
                display: "grid", gridTemplateColumns: "1fr auto",
                gap: 24, alignItems: "center",
                borderLeft: c.status === "live" ? "2px solid #ff4060" : "2px solid transparent",
                transition: "background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--dark-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--dark)"}
              >
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`tag ${meta.tagCls}`}>
                      {c.status === "live" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block", marginRight: 4 }} />}
                      {meta.label}
                    </span>
                    <span className="tag">{c.subject.toUpperCase()}</span>
                    <span className="tag">{c.diff.toUpperCase()}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.04em", marginBottom: 10 }}>{c.title}</h2>
                  <div style={{ display: "flex", gap: 28, fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)", flexWrap: "wrap" }}>
                    <span>{c.questions} PROBLEMS</span>
                    {c.participants > 0 && <span>{c.participants} PARTICIPANTS</span>}
                  </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
                  <div style={{
                    padding: "12px 20px", border: "1px solid var(--border-2)",
                    fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
                    color: c.status === "live" ? "#ff4060" : "var(--text-3)",
                    letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>{c.time}</div>
                  {c.status === "live" && (
                    <Link to={`/contest/${c.id}`}><button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "0.72rem" }}>Join Now →</button></Link>
                  )}
                  {c.status === "upcoming" && (
                    <button className="btn btn-ghost" style={{ padding: "11px 24px" }}>Set Reminder</button>
                  )}
                  {c.status === "past" && (
                    <button className="btn btn-ghost" style={{ padding: "11px 24px" }}>View Results</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
