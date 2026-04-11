import { useState } from "react";
import toast from "react-hot-toast";

const OPEN = [
  { title:"Number Theory Sprint #48",   qs:6,  deadline:"2 days", status:"OPEN"   },
  { title:"Organic Chemistry Open #13", qs:8,  deadline:"5 days", status:"REVIEW" },
  { title:"Combined Science Olympiad",  qs:4,  deadline:"1 week", status:"OPEN"   },
];

const inputStyle = {
  width:"100%", padding:"11px 14px", background:"var(--dark-2)",
  border:"1px solid var(--border-2)", color:"var(--text)",
  fontFamily:"'Space Mono',monospace", fontSize:"0.75rem",
  outline:"none", borderRadius:0, transition:"border-color .2s",
};

export default function Contributor() {
  const [form, setForm] = useState({ title:"", desc:"", subject:"Mathematics", topic:"", diff:"", answer:"", solution:"" });
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("// SUBMITTED FOR REVIEW");
    setForm({ title:"", desc:"", subject:"Mathematics", topic:"", diff:"", answer:"", solution:"" });
  };

  return (
    <div style={{ position:"relative", zIndex:1, paddingBottom:80 }}>
      {/* Header */}
      <div style={{ borderBottom:"1px solid var(--border-2)", padding:"48px 0 36px" }}>
        <div className="container">
          <span className="section-label" style={{ marginBottom:12, display:"flex" }}>Community Contribution</span>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
            <h1 className="font-display" style={{ fontSize:"clamp(2.4rem,5vw,4rem)", lineHeight:1 }}>
              CONTRIBUTE<br /><span className="accent">TO THE PLATFORM</span>
            </h1>
            <span className="tag tag-teal" style={{ fontSize:"0.65rem" }}>✓ CONTRIBUTOR ACCESS — ELO 3200</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:40 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:1, background:"var(--border-2)" }}>

          {/* Submit form */}
          <div style={{ background:"var(--dark)", padding:"32px" }}>
            <span className="section-label" style={{ marginBottom:24, display:"flex" }}>Submit a Problem</span>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Problem Title",      key:"title",    type:"text",     ph:"e.g. Prove there are infinitely many primes" },
                { label:"Full Statement",     key:"desc",     type:"textarea", ph:"Write the complete problem statement..." },
                { label:"Correct Answer",     key:"answer",   type:"text",     ph:"The exact answer or result" },
                { label:"Solution (optional)",key:"solution", type:"textarea", ph:"Step-by-step solution..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>{f.label}</label>
                  {f.type==="textarea"
                    ? <textarea rows={3} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} style={{...inputStyle,resize:"vertical"}} onFocus={e=>e.target.style.borderColor="var(--teal)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    : <input type="text" placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} style={inputStyle} onFocus={e=>e.target.style.borderColor="var(--teal)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                  }
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>Subject</label>
                  <select value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))} style={inputStyle}>
                    <option>Mathematics</option><option>Chemistry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:6 }}>Difficulty (800–3500)</label>
                  <input type="number" min={800} max={3500} placeholder="1800" value={form.diff} onChange={e => setForm(p=>({...p,diff:e.target.value}))} style={inputStyle} onFocus={e=>e.target.style.borderColor="var(--teal)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop:8, width:"100%" }}>Submit Problem →</button>
            </form>
          </div>

          {/* Open contests */}
          <div style={{ background:"var(--dark)", padding:"32px" }}>
            <span className="section-label" style={{ marginBottom:24, display:"flex" }}>Open Contests</span>
            <div style={{ display:"flex", flexDirection:"column", gap:1, background:"var(--border-2)" }}>
              {OPEN.map((c,i) => (
                <div key={i} style={{ background:"var(--dark-2)", padding:"20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.15rem", letterSpacing:"0.04em" }}>{c.title}</span>
                    <span className={`tag ${c.status==="REVIEW"?"tag-gold":"tag-teal"}`} style={{ fontSize:"0.58rem", flexShrink:0, marginLeft:8 }}>{c.status}</span>
                  </div>
                  <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                    <span className="tag" style={{ fontSize:"0.6rem" }}>{c.qs}/10 PROBLEMS</span>
                    <span className="tag" style={{ fontSize:"0.6rem" }}>{c.deadline.toUpperCase()} LEFT</span>
                  </div>
                  <button className="btn btn-ghost" style={{ width:"100%", padding:"10px" }}
                    onClick={() => toast.success("// CONTEST EDITOR COMING IN PHASE 2")}>
                    Add Problems →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
