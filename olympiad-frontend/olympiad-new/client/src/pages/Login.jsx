import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(mode === "login" ? "// ACCESS GRANTED" : "// ACCOUNT CREATED");
      navigate("/profile");
    }, 1000);
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 92px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "60px 24px", position: "relative", zIndex: 1,
    }}>
      {/* Grid decoration */}
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border-2)", opacity: 0.3 }} />

      <div style={{ width: "100%", maxWidth: 440 }} className="anim-up">
        {/* Label */}
        <div style={{ marginBottom: 32 }}>
          <span className="section-label">Authentication</span>
        </div>

        {/* Title */}
        <h1 className="font-display" style={{ fontSize: "3.2rem", lineHeight: 1, marginBottom: 32 }}>
          {mode === "login" ? "SIGN IN" : "REGISTER"}
        </h1>

        {/* Mode toggle */}
        <div style={{ display: "flex", marginBottom: 36, borderBottom: "1px solid var(--border-2)" }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "12px", background: "none", border: "none",
              fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
              textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer",
              color: mode === m ? "var(--teal)" : "var(--text-3)",
              borderBottom: mode === m ? "2px solid var(--teal)" : "2px solid transparent",
              marginBottom: -1, transition: "all .15s",
            }}>{m === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        {/* OAuth */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Continue with Google", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )},
            { label: "Continue with GitHub", icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            )},
          ].map((o, i) => (
            <button key={i} onClick={() => toast.success("// OAUTH COMING SOON")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "12px", background: "var(--dark-2)", border: "1px solid var(--border-2)",
              color: "var(--text-2)", fontFamily: "'Space Mono', monospace",
              fontSize: "0.72rem", letterSpacing: "0.06em", cursor: "pointer",
              transition: "border-color .2s, color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-2)"; }}
            >{o.icon}{o.label}</button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-2)" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "var(--text-3)" }}>OR EMAIL</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-2)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div>
              <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Username</label>
              <input className="input" type="text" placeholder="krish_wadhwa" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          )}
          <div>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="krish@olympiad.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Password</label>
            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          {mode === "login" && (
            <div style={{ textAlign: "right" }}>
              <a href="#" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--teal)" }}>Forgot password?</a>
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, opacity: loading ? 0.6 : 1, width: "100%" }}>
            {loading ? "// AUTHENTICATING..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 28, fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-3)" }}>
          {mode === "login" ? "No account? " : "Have account? "}
          <button onClick={() => setMode(m => m === "login" ? "register" : "login")} style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
