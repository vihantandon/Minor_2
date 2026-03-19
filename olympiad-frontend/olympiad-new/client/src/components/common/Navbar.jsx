import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { to: "/questions",   label: "Problems" },
  { to: "/contests",    label: "Contests" },
  { to: "/contributor", label: "Contribute" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Ticker bar */}
      <div style={{
        background: "var(--teal)", color: "var(--black)", overflow: "hidden",
        height: 32, display: "flex", alignItems: "center",
      }}>
        <div style={{
          display: "flex", gap: "80px", whiteSpace: "nowrap",
          animation: "ticker 22s linear infinite",
          fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
          fontWeight: 700, letterSpacing: "0.12em",
        }}>
          {Array(6).fill(null).map((_, i) => (
            <span key={i}>
              🏆 OLYMPIAD SPRINT #47 — LIVE NOW &nbsp;·&nbsp;
              📐 SEASON 3 OPEN &nbsp;·&nbsp;
              ⚡ KRISH WADHWA RANKED #1 GLOBALLY &nbsp;·&nbsp;
              🔬 NEW: CHEMISTRY DEEP DIVE SERIES &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "var(--nav-bg)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-2)",
        height: 60, display: "flex", alignItems: "center",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, background: "var(--teal)",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem",
            }}>🏆</div>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.35rem",
              letterSpacing: "0.08em", color: "var(--text)",
            }}>
              OLYMPIAD<span style={{ color: "var(--teal)" }}>HUB</span>
            </span>
          </Link>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: "6px 16px", fontFamily: "'Space Mono', monospace",
                fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
                color: pathname === l.to ? "var(--teal)" : "var(--text-2)",
                borderBottom: pathname === l.to ? "2px solid var(--teal)" : "2px solid transparent",
                transition: "all .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = pathname === l.to ? "var(--teal)" : "var(--text-2)"}
              >{l.label}</Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width: 34, height: 34, background: "var(--dark-2)", border: "1px solid var(--border-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", transition: "border-color .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--teal)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-2)"}
            >{theme === "dark" ? "○" : "●"}</button>

            {/* Rating */}
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
              color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", border: "1px solid var(--border-2)",
            }}>
              <span style={{ color: "var(--text-3)" }}>ELO</span>
              <span style={{ color: "#ff4060", fontWeight: 700 }}>3200</span>
            </div>

            {/* Avatar */}
            <Link to="/profile">
              <div style={{
                width: 34, height: 34, background: "var(--teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Mono', monospace", fontWeight: 700,
                fontSize: "0.7rem", color: "var(--black)", cursor: "pointer",
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}>KW</div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
