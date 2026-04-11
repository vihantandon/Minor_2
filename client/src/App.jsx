import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Questions from "./pages/Questions";
import Contests from "./pages/Contests";
import ContestRoom from "./pages/ContestRoom";
import Profile from "./pages/Profile";
import Contributor from "./pages/Contributor";

function RainCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const cols = Math.floor(W / 20);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF";
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,6,0.05)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00ffc8";
      ctx.font = "14px 'Space Mono', monospace";
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 20, y * 20);
        if (y * 20 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} id="rain-canvas" />;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("oh-theme") || "dark");
  const [user] = useState({
    id: 1, username: "Krish Wadhwa", email: "krish@olympiad.com",
    rating: 3200, avatar: "KW", role: "user",
    questionsSolved: 847, contestsPlayed: 63, rank: 4,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("oh-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user }}>
        <BrowserRouter>
          {theme === "dark" && <RainCanvas />}
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: "var(--dark-2)", color: "var(--text)",
              border: "1px solid var(--border)", borderRadius: 0,
              fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
            },
          }} />
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/questions"   element={<Questions />} />
            <Route path="/contests"    element={<Contests />} />
            <Route path="/contest/:id" element={<ContestRoom />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="/contributor" element={<Contributor />} />
            <Route path="*"            element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
