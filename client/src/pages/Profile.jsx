import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const HISTORY = [
  { c: "#1", r: 1500 },
  { c: "#5", r: 1620 },
  { c: "#9", r: 1580 },
  { c: "#13", r: 1780 },
  { c: "#17", r: 1950 },
  { c: "#21", r: 2100 },
  { c: "#25", r: 2050 },
  { c: "#29", r: 2280 },
  { c: "#33", r: 2450 },
  { c: "#37", r: 2600 },
  { c: "#41", r: 2750 },
  { c: "#44", r: 2900 },
  { c: "#46", r: 3050 },
  { c: "#47", r: 3200 },
];

const WEAK = [
  { topic: "Combinatorics", score: 38 },
  { topic: "Electrochemistry", score: 52 },
  { topic: "Projective Geometry", score: 61 },
];

const RECENT = [
  {
    name: "Olympiad Sprint #47",
    rank: 1,
    delta: "+150",
    solved: "8/8",
    date: "Today",
  },
  {
    name: "Algebra Deep Dive",
    rank: 2,
    delta: "+100",
    solved: "7/8",
    date: "3d ago",
  },
  {
    name: "Chem Blitz #11",
    rank: 1,
    delta: "+140",
    solved: "9/10",
    date: "1w ago",
  },
  {
    name: "Number Theory Open",
    rank: 3,
    delta: "+70",
    solved: "6/8",
    date: "2w ago",
  },
];

function RatingGraph() {
  const W = 600,
    H = 180,
    PX = 32,
    PY = 20;
  const rs = HISTORY.map((h) => h.r);
  const minR = Math.min(...rs) - 80,
    maxR = Math.max(...rs) + 80;
  const pts = HISTORY.map((h, i) => ({
    x: PX + (i / (HISTORY.length - 1)) * (W - PX * 2),
    y: PY + ((maxR - h.r) / (maxR - minR)) * (H - PY * 2),
    r: h.r,
    c: h.c,
  }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const [hov, setHov] = useState(null);

  const ticks = [1500, 2000, 2500, 3000];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00ffc8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((r) => {
        const y = PY + ((maxR - r) / (maxR - minR)) * (H - PY * 2);
        return (
          <g key={r}>
            <line
              x1={PX}
              y1={y}
              x2={W - PX}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={PX - 4}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.15)"
              fontSize="8"
              fontFamily="'Space Mono',monospace"
            >
              {r}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#g)" />
      <path
        d={line}
        fill="none"
        stroke="#00ffc8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <g
          key={i}
          onMouseEnter={() => setHov(p)}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "pointer" }}
        >
          <circle cx={p.x} cy={p.y} r={8} fill="transparent" />
          <circle
            cx={p.x}
            cy={p.y}
            r={hov === p ? 5 : 3}
            fill={i === pts.length - 1 ? "#ff4060" : "#00ffc8"}
            stroke="var(--dark)"
            strokeWidth="1.5"
          />
        </g>
      ))}
      {hov && (
        <g>
          <rect
            x={Math.min(hov.x - 28, W - 90)}
            y={hov.y - 36}
            width={80}
            height={28}
            rx={0}
            fill="var(--dark-2)"
            stroke="rgba(0,255,200,0.25)"
            strokeWidth="1"
          />
          <text
            x={Math.min(hov.x - 28, W - 90) + 40}
            y={hov.y - 25}
            textAnchor="middle"
            fill="#00ffc8"
            fontSize="10"
            fontFamily="'Space Mono',monospace"
            fontWeight="700"
          >
            {hov.r}
          </text>
          <text
            x={Math.min(hov.x - 28, W - 90) + 40}
            y={hov.y - 13}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="7"
            fontFamily="'Space Mono',monospace"
          >
            Sprint {hov.c}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const STATS = [
    { label: "ELO Rating", val: user.rating, color: "#ff4060" },
    { label: "Questions Solved", val: 847, color: "var(--teal)" },
    { label: "Contests", val: 63, color: "var(--gold)" },
    { label: "Global Rank", val: "#4", color: "var(--green)" },
  ];

  return (
    <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
      {/* Hero */}
      <div
        style={{ borderBottom: "1px solid var(--border-2)", padding: "48px 0" }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                background: "var(--teal)",
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Mono',monospace",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--black)",
              }}
            >
              KW
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  className="font-display"
                  style={{ fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1 }}
                >
                  {user.username.toUpperCase()}
                </h1>
                <span className="tag tag-red" style={{ fontSize: "0.65rem" }}>
                  GRANDMASTER
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {user.email} · JIIT NOIDA · 2ND YEAR
              </div>
            </div>
          </div>

          {/* Stat boxes — We Cargo style */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 36,
              borderTop: "1px solid var(--border-2)",
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 36px",
                  borderRight: "1px solid var(--border-2)",
                  minWidth: 130,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: "2.2rem",
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.6rem",
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40 }}>
        {/* Rating Graph */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <span className="section-label">Rating History</span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "0.65rem",
                color: "var(--text-3)",
              }}
            >
              CURRENT: <span style={{ color: "#ff4060" }}>3200</span>
            </span>
          </div>
          <div
            style={{
              border: "1px solid var(--border-2)",
              padding: "24px 16px 8px",
              background: "var(--dark)",
            }}
          >
            <RatingGraph />
          </div>
        </div>

        {/* Bottom grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 1,
            background: "var(--border-2)",
          }}
        >
          {/* Recent contests */}
          <div style={{ background: "var(--dark)", padding: "28px" }}>
            <span
              className="section-label"
              style={{ marginBottom: 20, display: "flex" }}
            >
              Recent Contests
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                background: "var(--border-2)",
              }}
            >
              {RECENT.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--dark-2)",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.6rem",
                        color: "var(--text-3)",
                      }}
                    >
                      RANK #{c.rank} · {c.solved} · {c.date}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "0.8rem",
                      color: "var(--teal)",
                      fontWeight: 700,
                    }}
                  >
                    {c.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach */}
          <div style={{ background: "var(--dark)", padding: "28px" }}>
            <span
              className="section-label"
              style={{ marginBottom: 6, display: "flex" }}
            >
              AI Study Coach
            </span>
            <p
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "0.62rem",
                color: "var(--text-3)",
                marginBottom: 20,
              }}
            >
              GEMINI // WEAK AREA ANALYSIS
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {WEAK.map((w, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {w.topic}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.65rem",
                        color: w.score < 50 ? "var(--red)" : "var(--gold)",
                      }}
                    >
                      {w.score}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "var(--dark-3)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${w.score}%`,
                        background: w.score < 50 ? "var(--red)" : "var(--gold)",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  <a
                    href={`https://youtube.com/results?search_query=${w.topic}+olympiad`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "0.6rem",
                      color: "var(--teal)",
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    ▶ Watch resources →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
