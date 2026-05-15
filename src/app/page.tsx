"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONA } from "@/config/persona";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// ─── Session ID ───────────────────────────────────────────────
let SESSION_ID = "";
if (typeof window !== "undefined") {
  SESSION_ID = sessionStorage.getItem("sid") ?? uuidv4();
  sessionStorage.setItem("sid", SESSION_ID);
}

type Section = "home" | "about" | "projects";
interface Msg { role: "user" | "assistant"; content: string; }

function Tag({ label, color }: { label: string; color: string }) {
  const cls: Record<string, string> = {
    cyan:   "bg-cyan-500/10   text-cyan-400   border-cyan-500/25",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/25",
    green:  "bg-green-500/10  text-green-400  border-green-500/25",
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${cls[color] ?? cls.cyan}`}>
      {label}
    </span>
  );
}

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width:      `${Math.random() * 2 + 1}px`,
          height:     `${Math.random() * 2 + 1}px`,
          left:       `${Math.random() * 100}%`,
          background: Math.random() > 0.5 ? "#c07840" : "#7b5cff",
          animation:  `floatUp ${12 + Math.random() * 10}s linear ${Math.random() * 12}s infinite`,
          opacity:    0,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform:translateY(100vh) scale(0); opacity:0; }
          10%  { opacity:0.4; }
          90%  { opacity:0.1; }
          100% { transform:translateY(-5vh) scale(1); opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ─── South Indian SVG Avatar ──────────────────────────────────
function SouthIndianAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  const mouthRef = useRef<SVGPathElement>(null);
  const ivRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpeaking) {
      let open = false;
      ivRef.current = setInterval(() => {
        open = !open;
        if (mouthRef.current) {
          mouthRef.current.setAttribute("d",
            open
              ? "M172 172 Q181 183 190 184 Q199 183 208 172 Q199 177 190 178 Q181 177 172 172Z"
              : "M172 172 Q182 179 190 180 Q198 179 208 172"
          );
        }
      }, 130);
    } else {
      if (ivRef.current) clearInterval(ivRef.current);
      if (mouthRef.current) {
        mouthRef.current.setAttribute("d", "M172 172 Q182 179 190 180 Q198 179 208 172");
      }
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [isSpeaking]);

  return (
    <svg viewBox="0 0 380 520" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", animation: "breathe 3.5s ease-in-out infinite" }}>
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#c8845a" />
          <stop offset="100%" stopColor="#a05f38" />
        </radialGradient>
        <radialGradient id="skinFaceGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="#d4916a" />
          <stop offset="100%" stopColor="#b06840" />
        </radialGradient>
        <radialGradient id="hairGrad" cx="50%" cy="20%" r="70%">
          <stop offset="0%"   stopColor="#3a2010" />
          <stop offset="100%" stopColor="#1a0c06" />
        </radialGradient>
        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#5a0e0e" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="100%" r="50%">
          <stop offset="0%"   stopColor="rgba(180,100,60,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="190" cy="510" rx="180" ry="40" fill="url(#glowGrad)" />
      <rect x="130" y="390" width="55" height="130" rx="6" fill="#6b1515" />
      <rect x="195" y="390" width="55" height="130" rx="6" fill="#6b1515" />
      <ellipse cx="157" cy="518" rx="32" ry="10" fill="#f0e8d0" />
      <ellipse cx="222" cy="518" rx="32" ry="10" fill="#f0e8d0" />
      <path d="M100 260 Q85 300 80 400 L300 400 Q295 300 280 260 Q240 280 190 278 Q140 280 100 260Z" fill="url(#suitGrad)" />
      <path d="M165 262 L190 360 L190 278 Q175 272 165 262Z" fill="#f5f0e8" />
      <path d="M215 262 L190 360 L190 278 Q205 272 215 262Z" fill="#f5f0e8" />
      <path d="M155 260 Q165 262 190 280 Q215 262 225 260 Q210 240 190 245 Q170 240 155 260Z" fill="url(#suitGrad)" />
      <path d="M100 260 Q70 290 65 360 L110 370 Q115 310 135 280Z"  fill="url(#suitGrad)" />
      <path d="M280 260 Q310 290 315 360 L270 370 Q285 310 265 280Z" fill="url(#suitGrad)" />
      <rect x="65"  y="355" width="45" height="18" rx="4" fill="#f5f0e8" />
      <rect x="270" y="355" width="45" height="18" rx="4" fill="#f5f0e8" />
      <ellipse cx="92"  cy="330" rx="18" ry="7" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      <ellipse cx="92"  cy="342" rx="18" ry="7" fill="none" stroke="#d97706" strokeWidth="3"   />
      <ellipse cx="92"  cy="353" rx="17" ry="6" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      <ellipse cx="288" cy="330" rx="18" ry="7" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      <ellipse cx="288" cy="342" rx="18" ry="7" fill="none" stroke="#d97706" strokeWidth="3"   />
      <ellipse cx="288" cy="353" rx="17" ry="6" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      <ellipse cx="92"  cy="375" rx="20" ry="14" fill="url(#skinGrad)" />
      <ellipse cx="288" cy="375" rx="20" ry="14" fill="url(#skinGrad)" />
      <rect x="175" y="200" width="30" height="50" rx="8" fill="url(#skinFaceGrad)" />
      <path d="M160 220 Q190 238 220 220" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
      <circle cx="190" cy="237" r="4"   fill="#f59e0b" />
      <circle cx="175" cy="229" r="2.5" fill="#f59e0b" />
      <circle cx="205" cy="229" r="2.5" fill="#f59e0b" />
      <ellipse cx="190" cy="128" rx="72" ry="80" fill="url(#hairGrad)" />
      <path d="M120 100 Q105 140 115 180 Q125 195 138 198" fill="url(#hairGrad)" />
      <path d="M260 100 Q275 140 265 180 Q255 195 242 198" fill="url(#hairGrad)" />
      <ellipse cx="190" cy="135" rx="62" ry="70" fill="url(#skinFaceGrad)" />
      <ellipse cx="128" cy="158" rx="7" ry="5" fill="#f59e0b" />
      <line x1="128" y1="163" x2="128" y2="178" stroke="#f59e0b" strokeWidth="2" />
      <path d="M121 178 Q128 188 135 178" fill="#f59e0b" />
      <ellipse cx="252" cy="158" rx="7" ry="5" fill="#f59e0b" />
      <line x1="252" y1="163" x2="252" y2="178" stroke="#f59e0b" strokeWidth="2" />
      <path d="M245 178 Q252 188 259 178" fill="#f59e0b" />
      <path d="M158 110 Q170 105 180 108" stroke="#3a2010" strokeWidth="3"   fill="none" strokeLinecap="round" />
      <path d="M200 108 Q210 105 222 110" stroke="#3a2010" strokeWidth="3"   fill="none" strokeLinecap="round" />
      <path d="M155 128 Q169 120 183 128 Q169 136 155 128Z" fill="#1a0c06" />
      <ellipse cx="169" cy="128" rx="6" ry="6.5" fill="#1a0c06" />
      <circle  cx="169" cy="128" r="4.5" fill="#2d1407" />
      <circle  cx="171" cy="126" r="1.5" fill="white" opacity="0.9" />
      <path d="M155 128 Q168 131 183 128" stroke="#0a0505" strokeWidth="1" fill="none" />
      <path d="M197 128 Q211 120 225 128 Q211 136 197 128Z" fill="#1a0c06" />
      <ellipse cx="211" cy="128" rx="6" ry="6.5" fill="#1a0c06" />
      <circle  cx="211" cy="128" r="4.5" fill="#2d1407" />
      <circle  cx="213" cy="126" r="1.5" fill="white" opacity="0.9" />
      <path d="M197 128 Q210 131 225 128" stroke="#0a0505" strokeWidth="1" fill="none" />
      <path d="M186 138 Q182 152 185 158 Q190 162 195 158 Q198 152 194 138" stroke="#a05f38" strokeWidth="1.2" fill="none" />
      <circle cx="184" cy="158" r="2.5" fill="#f59e0b" />
      <g>
        <path ref={mouthRef}
          d="M172 172 Q182 179 190 180 Q198 179 208 172"
          stroke="#8b3a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M172 172 Q181 168 190 169 Q199 168 208 172 Q198 177 190 178 Q182 177 172 172Z"
          fill="#c0524a" opacity="0.7" />
      </g>
      <circle cx="190" cy="98" r="5"   fill="#dc2626" />
      <circle cx="190" cy="98" r="2.5" fill="#ff6b6b" />
      <path d="M140 75 Q130 110 128 155" stroke="#2a1508" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M148 70 Q138 105 136 150" stroke="#2a1508" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M240 75 Q250 110 252 155" stroke="#2a1508" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M232 70 Q242 105 244 150" stroke="#2a1508" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M145 80 Q155 60 190 65 Q225 60 235 80" stroke="#3a2010" strokeWidth="4" fill="none" />
    </svg>
  );
}

// ─── Voice helpers ────────────────────────────────────────────
function pickFemaleVoice(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  const preferred = [
    "Google UK English Female", "Samantha", "Karen", "Moira", "Tessa",
    "Microsoft Zira - English (United States)",
    "Microsoft Hazel - English (Great Britain)",
  ];
  for (const name of preferred) {
    const v = all.find(x => x.name === name);
    if (v) return v;
  }
  return (
    all.find(v => v.name.toLowerCase().includes("female")) ??
    all.find(v => v.lang === "en-GB") ??
    all.find(v => v.lang.startsWith("en")) ??
    null
  );
}

function speakText(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === "undefined") return;
  const clean = text.replace(/[^\x00-\x7F]/g, "").replace(/\n+/g, " ").trim();
  if (!clean) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  function go() {
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickFemaleVoice();
    if (v) { u.voice = v; console.log("Voice:", v.name); }
    u.lang = "en-GB"; u.rate = 0.93; u.pitch = 1.2; u.volume = 1.0;
    u.onstart = () => onStart?.();
    u.onend   = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  }

  if (window.speechSynthesis.getVoices().length > 0) go();
  else window.speechSynthesis.addEventListener("voiceschanged", go, { once: true });
}

// ─── Main Page ────────────────────────────────────────────────
export default function Page() {
  const [section,     setSection]     = useState<Section>("home");
  const [displayText, setDisplayText] = useState("");
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [messages,    setMessages]    = useState<Msg[]>([
    { role: "assistant", content: PERSONA.openingMessage },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef   = useRef<HTMLDivElement>(null);
  const greetIdxRef  = useRef(0);

  const runGreeting = useCallback((gIdx: number, cIdx: number) => {
    const text = PERSONA.greetings[gIdx];
    if (cIdx <= text.length) {
      setDisplayText(text.slice(0, cIdx));
      typeTimerRef.current = setTimeout(() => runGreeting(gIdx, cIdx + 1), 36);
    } else {
      speakText(
        text,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          typeTimerRef.current = setTimeout(() => {
            const next = (gIdx + 1) % PERSONA.greetings.length;
            greetIdxRef.current = next;
            runGreeting(next, 0);
          }, 3000);
        }
      );
    }
  }, []);

  useEffect(() => {
    typeTimerRef.current = setTimeout(() => runGreeting(0, 0), 800);
    return () => {
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [runGreeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    await supabase.from("chat_history").insert({
      session_id: SESSION_ID, role: "user", content: text,
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("API error");

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: "assistant", content: full };
          return u;
        });
      }

      await supabase.from("chat_history").insert({
        session_id: SESSION_ID, role: "assistant", content: full,
      });

      speakText(full, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const goTo = (s: Section) => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (s === "home") setTimeout(() => runGreeting(0, 0), 400);
    setSection(s);
  };

  const navItems: { id: Section; label: string }[] = [
    { id: "home",     label: "Home"     },
    { id: "about",    label: "About"    },
    { id: "projects", label: "Projects" },
  ];

  return (
    <>
      <Particles />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0d0f14; font-family:'Exo 2',sans-serif; }
        .font-display { font-family:'Rajdhani',sans-serif; }
        .font-mono    { font-family:'Share Tech Mono',monospace; }
        @keyframes breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes wavebar { from{transform:scaleY(.2)} to{transform:scaleY(1)} }
        @keyframes msgIn   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes typeDot { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
        @keyframes scanline { 0%{top:0%} 100%{top:100%} }
        input::placeholder { color:rgba(255,255,255,0.22); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 28px",
        background:"rgba(10,10,16,0.88)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        backdropFilter:"blur(20px)",
      }}>
        <div className="font-display" style={{
          fontSize:20, fontWeight:700, letterSpacing:3,
          color:"#c07840", textTransform:"uppercase",
        }}>
          {PERSONA.navBrand}
        </div>
        <ul style={{ display:"flex", gap:28, listStyle:"none" }}>
          {navItems.map(n => (
            <li key={n.id}>
              <button onClick={() => goTo(n.id)} className="font-mono" style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:12, textTransform:"uppercase", letterSpacing:2,
                color: section === n.id ? "#c07840" : "rgba(255,255,255,0.35)",
                transition:"color 0.2s",
              }}>
                {n.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <AnimatePresence mode="wait">

        {/* ═══════ HOME ═══════ */}
        {section === "home" && (
          <motion.div key="home"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ display:"flex", height:"100vh", paddingTop:52 }}
          >
            {/* LEFT: Avatar */}
            <div style={{
              width:"52%", position:"relative", overflow:"hidden",
              background:"linear-gradient(160deg,#120e1a 0%,#1a1228 55%,#0e1018 100%)",
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"flex-end",
            }}>
              {/* Ambient glow */}
              <div style={{
                position:"absolute", bottom:0, left:"50%",
                transform:"translateX(-50%)",
                width:500, height:500, borderRadius:"50%",
                background:"radial-gradient(ellipse, rgba(192,120,64,0.15) 0%, transparent 70%)",
                pointerEvents:"none",
              }} />
              {/* Grid */}
              <div style={{
                position:"absolute", inset:0, pointerEvents:"none",
                backgroundImage:`
                  linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                `,
                backgroundSize:"50px 50px",
                WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 60%, black, transparent)",
                maskImage:"radial-gradient(ellipse 80% 80% at 50% 60%, black, transparent)",
              }} />
              {/* Scan line */}
              <div style={{
                position:"absolute", left:0, right:0, height:2, zIndex:5,
                background:"linear-gradient(transparent, rgba(192,120,64,0.12), transparent)",
                animation:"scanline 6s linear infinite",
                pointerEvents:"none",
              }} />

              {/* Name plate */}
              <div style={{ position:"absolute", top:24, left:28, zIndex:3 }}>
                <div className="font-mono" style={{
                  fontSize:10, letterSpacing:3, textTransform:"uppercase",
                  color:"rgba(192,120,64,0.8)", marginBottom:4,
                }}>
                  AI Twin · Online
                </div>
                <div className="font-display" style={{
                  fontSize:24, fontWeight:700, color:"#fff", lineHeight:1.1,
                }}>
                  {PERSONA.name}
                </div>
                <div className="font-mono" style={{
                  fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginTop:3,
                }}>
                  {PERSONA.title}
                </div>
              </div>

              {/* Live badge */}
              <div className="font-mono" style={{
                position:"absolute", top:24, right:24, zIndex:3,
                display:"flex", alignItems:"center", gap:6,
                background:"rgba(0,0,0,0.45)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:20, padding:"5px 12px",
                fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#4ade80",
              }}>
                <span style={{
                  width:6, height:6, borderRadius:"50%",
                  background:"#4ade80", animation:"blink 1.4s infinite",
                  display:"inline-block",
                }} />
                Live
              </div>

              {/* Avatar SVG */}
              <div style={{
                position:"relative", zIndex:2, width:"100%", maxWidth:360,
                height:"calc(100% - 100px)",
                display:"flex", alignItems:"flex-end", justifyContent:"center",
              }}>
                <SouthIndianAvatar isSpeaking={isSpeaking} />
              </div>

              {/* Speech bubble */}
              <div style={{
                position:"absolute", bottom:30, left:"50%",
                transform:"translateX(-50%)",
                background:"rgba(8,6,16,0.9)",
                border:"1px solid rgba(192,120,64,0.35)",
                borderRadius:14, padding:"11px 18px",
                maxWidth:310, zIndex:4, textAlign:"center",
              }}>
                <p className="font-mono" style={{
                  fontSize:12.5, color:"rgba(255,255,255,0.82)",
                  lineHeight:1.55, minHeight:"2.5rem",
                }}>
                  {displayText || "Initialising AI twin…"}
                  <span style={{
                    display:"inline-block", width:2, height:13,
                    background:"#c07840", marginLeft:2, verticalAlign:"middle",
                    animation:"blink 0.8s infinite",
                  }} />
                </p>
                <div style={{
                  position:"absolute", bottom:-8, left:"50%",
                  transform:"translateX(-50%)",
                  width:0, height:0,
                  borderLeft:"8px solid transparent",
                  borderRight:"8px solid transparent",
                  borderTop:"8px solid rgba(192,120,64,0.35)",
                }} />
              </div>

              {/* Waveform */}
              {isSpeaking && (
                <div style={{
                  position:"absolute", bottom:110, left:"50%",
                  transform:"translateX(-50%)",
                  display:"flex", alignItems:"flex-end", gap:3, zIndex:3,
                }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{
                      width:3, borderRadius:2,
                      background:"rgba(192,120,64,0.85)",
                      height:`${8 + Math.sin(i * 0.9) * 10 + 6}px`,
                      animation:`wavebar 0.4s ${i * 0.06}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Chat */}
            <div style={{
              width:"48%", background:"#13161e",
              borderLeft:"1px solid rgba(255,255,255,0.07)",
              display:"flex", flexDirection:"column",
            }}>
              {/* Chat header */}
              <div style={{
                padding:"18px 22px 14px",
                borderBottom:"1px solid rgba(255,255,255,0.07)",
                background:"#0f1219",
              }}>
                <div className="font-display" style={{ fontSize:16, fontWeight:600, color:"#fff" }}>
                  Talk to {PERSONA.name}&apos;s AI Twin
                </div>
                <div className="font-mono" style={{
                  fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2,
                }}>
                  Powered by Gemini · Supabase RAG · Voice enabled
                </div>
              </div>

              {/* Quick prompts */}
              <div style={{
                padding:"12px 18px 8px",
                display:"flex", flexWrap:"wrap", gap:7,
              }}>
                {PERSONA.quickPrompts.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} className="font-mono"
                    style={{
                      fontSize:11, color:"rgba(255,255,255,0.4)",
                      background:"transparent",
                      border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:20, padding:"5px 12px",
                      cursor:"pointer", transition:"all 0.18s",
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.color = "rgba(192,120,64,0.9)";
                      (e.target as HTMLElement).style.borderColor = "rgba(192,120,64,0.4)";
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div style={{
                flex:1, overflowY:"auto",
                padding:"8px 18px 12px",
                display:"flex", flexDirection:"column", gap:12,
              }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    maxWidth:"88%",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    padding:"10px 14px", borderRadius:14,
                    fontSize:13.5, lineHeight:1.55,
                    whiteSpace:"pre-wrap",
                    animation:"msgIn 0.22s ease",
                    background: m.role === "user"
                      ? "linear-gradient(135deg,#8b5cf6,#7c3aed)"
                      : "rgba(255,255,255,0.065)",
                    border: m.role === "user"
                      ? "none"
                      : "1px solid rgba(255,255,255,0.09)",
                    borderBottomRightRadius: m.role === "user" ? 4 : 14,
                    borderBottomLeftRadius:  m.role === "user" ? 14 : 4,
                    color:"#dde2ee",
                  }}>
                    {m.role === "assistant" && (
                      <div className="font-mono" style={{
                        fontSize:10, letterSpacing:1, textTransform:"uppercase",
                        color:"rgba(192,120,64,0.75)", marginBottom:5,
                      }}>
                        {PERSONA.name} AI
                      </div>
                    )}
                    {m.content}
                  </div>
                ))}

                {loading && (
                  <div style={{
                    alignSelf:"flex-start",
                    display:"flex", gap:5, alignItems:"center",
                    padding:"10px 14px", borderRadius:14,
                    background:"rgba(255,255,255,0.065)",
                    border:"1px solid rgba(255,255,255,0.09)",
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width:7, height:7, borderRadius:"50%",
                        background:"rgba(255,255,255,0.4)",
                        animation:`typeDot 1.2s ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding:"14px 18px",
                borderTop:"1px solid rgba(255,255,255,0.07)",
                background:"#0f1219",
                display:"flex", gap:10, alignItems:"center",
              }}>
                <input
                  style={{
                    flex:1,
                    background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:24, padding:"10px 16px",
                    fontSize:13.5, color:"#e8eaf0",
                    fontFamily:"inherit", outline:"none",
                    caretColor:"#c07840",
                    transition:"border-color 0.2s",
                  }}
                  placeholder="Ask me anything…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  onFocus={e  => { (e.target as HTMLInputElement).style.borderColor = "rgba(192,120,64,0.45)"; }}
                  onBlur={e   => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    width:42, height:42, borderRadius:"50%",
                    background: loading || !input.trim()
                      ? "rgba(192,120,64,0.25)"
                      : "linear-gradient(135deg,#c07840,#8b5020)",
                    border:"none",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    color:"#fff", fontSize:18,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.18s", flexShrink:0,
                  }}
                >
                  ↑
                </button>
              </div>

              <div className="font-mono" style={{
                textAlign:"center", fontSize:10,
                color:"rgba(255,255,255,0.18)",
                padding:"8px 0 10px",
              }}>
                Voice responses enabled · Conversations stored securely
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ ABOUT ═══════ */}
        {section === "about" && (
          <motion.main key="about"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ minHeight:"100vh", padding:"80px 28px 40px" }}
          >
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:32 }}>
                <div className="font-mono" style={{
                  fontSize:11, color:"#c07840", letterSpacing:3,
                  textTransform:"uppercase", marginBottom:6,
                }}>
                  // IDENTITY.LOG
                </div>
                <h2 className="font-display" style={{
                  fontSize:40, fontWeight:700,
                  background:"linear-gradient(135deg,#fff,#c07840)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>
                  {PERSONA.about.pageTitle}
                </h2>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{
                  gridColumn:"1 / -1",
                  background:"rgba(10,20,40,0.7)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:16, padding:"1.5rem",
                }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>🧠</div>
                  <div className="font-display" style={{ fontSize:18, color:"#c07840", marginBottom:8 }}>
                    The Human Behind the AI
                  </div>
                  <p style={{
                    color:"rgba(255,255,255,0.5)", lineHeight:1.7,
                    fontSize:14, whiteSpace:"pre-line",
                  }}>
                    {PERSONA.about.bio}
                  </p>
                </div>

                {PERSONA.about.cards.map((c, i) => (
                  <div key={i} style={{
                    background:"rgba(10,20,40,0.7)",
                    border:"1px solid rgba(255,255,255,0.09)",
                    borderRadius:16, padding:"1.25rem",
                  }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
                    <div className="font-display" style={{ fontSize:16, color:"#c07840", marginBottom:6 }}>
                      {c.title}
                    </div>
                    <p style={{
                      color:"rgba(255,255,255,0.45)", fontSize:13,
                      lineHeight:1.65, marginBottom:10,
                    }}>
                      {c.body}
                    </p>
                    {c.tags.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {c.tags.map(t => <Tag key={t.label} {...t} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {/* ═══════ PROJECTS ═══════ */}
        {section === "projects" && (
          <motion.main key="projects"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ minHeight:"100vh", padding:"80px 28px 40px" }}
          >
            <div style={{ maxWidth:1060, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:32 }}>
                <div className="font-mono" style={{
                  fontSize:11, color:"#c07840", letterSpacing:3,
                  textTransform:"uppercase", marginBottom:6,
                }}>
                  // PROJECT.ARCHIVE
                </div>
                <h2 className="font-display" style={{
                  fontSize:40, fontWeight:700,
                  background:"linear-gradient(135deg,#fff,#c07840)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>
                  AI Experiments
                </h2>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {PERSONA.projects.map((p, i) => (
                  <motion.div key={i} whileHover={{ y:-4 }} style={{
                    background:"rgba(10,20,40,0.7)",
                    border:"1px solid rgba(255,255,255,0.09)",
                    borderRadius:16, overflow:"hidden", cursor:"pointer",
                  }}>
                    <div className={`bg-gradient-to-br ${p.gradient}`} style={{
                      height:130, display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:48,
                    }}>
                      {p.emoji}
                    </div>
                    <div style={{ padding:"1rem" }}>
                      <div className="font-display" style={{
                        fontSize:15, fontWeight:600, color:"#e8eaf0", marginBottom:5,
                      }}>
                        {p.title}
                      </div>
                      <p style={{
                        color:"rgba(255,255,255,0.38)", fontSize:12,
                        lineHeight:1.6, marginBottom:10,
                      }}>
                        {p.desc}
                      </p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {p.tags.map(t => <Tag key={t.label} {...t} />)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.main>
        )}

      </AnimatePresence>
    </>
  );
}