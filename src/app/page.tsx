"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONA } from "@/config/persona";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";


function getSessionId(): string {
  try {
    const ex = sessionStorage.getItem("sid");
    if (ex) return ex;
    const id = uuidv4();
    sessionStorage.setItem("sid", id);
    return id;
  } catch { return uuidv4(); }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "").replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "").replace(/^\s*\d+\.\s/gm, "").trim();
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ color: "#fca5a5", fontWeight: 600 }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i}>{p.slice(1,-1)}</em>;
    return p;
  });
}

type Section = "home" | "about" | "projects" | "work";
interface Msg { role: "user" | "assistant"; content: string; }

function Tag({ label, color }: { label: string; color: string }) {
  const cls: Record<string,string> = {
    cyan:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/25",
    green:  "bg-green-500/10 text-green-400 border-green-500/25",
  };
  return <span className={`font-mono text-xs px-2 py-0.5 rounded border ${cls[color]??cls.cyan}`}>{label}</span>;
}

const PARTICLES = [
  {w:1.5,l:8, dur:16,delay:0  },{w:2.0,l:22,dur:20,delay:2.5},
  {w:1.2,l:37,dur:13,delay:5  },{w:1.8,l:51,dur:17,delay:1  },
  {w:1.0,l:66,dur:22,delay:7  },{w:2.2,l:79,dur:14,delay:3  },
  {w:1.5,l:91,dur:18,delay:9  },{w:1.3,l:14,dur:15,delay:4  },
  {w:1.9,l:44,dur:12,delay:6  },{w:1.1,l:58,dur:19,delay:8  },
  {w:1.6,l:72,dur:23,delay:11 },{w:1.4,l:85,dur:16,delay:0.5},
];

function Particles() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map((p,i) => (
        <div key={i} className="absolute rounded-full" style={{
          width:`${p.w}px`,height:`${p.w}px`,left:`${p.l}%`,
          background:i%2===0?"#9b2c2c":"#7b1d1d",
          animation:`floatUp ${p.dur}s linear ${p.delay}s infinite`,opacity:0,
        }}/>
      ))}
    </div>
  );
}

function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} title={enabled?"Mute":"Unmute"} style={{
      display:"flex",alignItems:"center",gap:6,
      background:enabled?"rgba(127,29,29,0.25)":"rgba(255,255,255,0.06)",
      border:`1px solid ${enabled?"rgba(252,165,165,0.35)":"rgba(255,255,255,0.12)"}`,
      borderRadius:20,padding:"5px 12px",cursor:"pointer",transition:"all 0.2s",
      color:enabled?"#fca5a5":"rgba(255,255,255,0.35)",
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {enabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </>
        )}
      </svg>
      <span className="fm" style={{fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>
        {enabled?"Voice On":"Voice Off"}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// AVATAR — redesigned with proper proportions
// - Rounder, shorter face with a proper chin
// - Clean natural eyes — no heavy outlines, no spectacle look
// - Maroon blazer over white blouse (not a robe)
// - Simple gold studs, thin chain + heart pendant
// - Small black bindi, no bangles, no nose stud
// ═══════════════════════════════════════════════════════════════
function Avatar({ isSpeaking }: { isSpeaking: boolean }) {
  const mouthRef = useRef<SVGGElement>(null);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpeaking) {
      let open = false;
      ivRef.current = setInterval(() => {
        open = !open;
        if (!mouthRef.current) return;
        mouthRef.current.innerHTML = open
          ? `<path d="M182 174 Q192 166 200 167 Q208 166 218 174 Q208 186 200 186 Q192 186 182 174Z" fill="#6b0911"/>
             <ellipse cx="200" cy="176.5" rx="11" ry="5" fill="#380206"/>`
          : `<path d="M182 174 Q192 168 200 169 Q208 168 218 174 Q208 183 200 184 Q192 183 182 174Z" fill="#6b0911"/>
             <path d="M182 174 Q192 175 200 176 Q208 175 218 174" stroke="#4a0409" stroke-width="1.5" fill="none"/>`;
      }, 130);
    } else {
      clearInterval(ivRef.current!);
      if (mouthRef.current) mouthRef.current.innerHTML =
        `<path d="M182 174 Q192 168 200 169 Q208 168 218 174 Q208 183 200 184 Q192 183 182 174Z" fill="#6b0911"/>
         <path d="M182 174 Q192 175 200 176 Q208 175 218 174" stroke="#4a0409" stroke-width="1.5" fill="none"/>`;
    }
    return () => clearInterval(ivRef.current!);
  }, [isSpeaking]);

  return (
    <svg
      viewBox="80 60 240 310"
      xmlns="http://www.w3.org/2000/svg"
      className="avatar-breathe"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        {/* Lighter radiant brown skin tones (fixing pale/white look) */}
        <radialGradient id="gFace" cx="42%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#eec39a"/>
          <stop offset="70%" stopColor="#dba87b"/>
          <stop offset="100%" stopColor="#b88356"/>
        </radialGradient>
        
        <linearGradient id="gNeck" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dba87b"/>
          <stop offset="100%" stopColor="#966338"/>
        </linearGradient>

        <radialGradient id="gHair" cx="50%" cy="15%" r="75%">
          <stop offset="0%" stopColor="#26140a"/>
          <stop offset="70%" stopColor="#120904"/>
          <stop offset="100%" stopColor="#050201"/>
        </radialGradient>

        <linearGradient id="gBlazer" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#7a1616"/>
          <stop offset="40%" stopColor="#5c0d0d"/>
          <stop offset="100%" stopColor="#3d0606"/>
        </linearGradient>
        
        <linearGradient id="gBlazerLapel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8f1d1d"/>
          <stop offset="50%" stopColor="#660f0f"/>
          <stop offset="100%" stopColor="#400707"/>
        </linearGradient>

        <linearGradient id="gBlouse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="60%" stopColor="#f2ece6"/>
          <stop offset="100%" stopColor="#d9d0c7"/>
        </linearGradient>

        <linearGradient id="gGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffefa6"/>
          <stop offset="40%" stopColor="#d49b2c"/>
          <stop offset="70%" stopColor="#aa7415"/>
          <stop offset="100%" stopColor="#6e4805"/>
        </linearGradient>

        <radialGradient id="gIris" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4d2613"/>
          <stop offset="75%" stopColor="#210f06"/>
          <stop offset="100%" stopColor="#0d0502"/>
        </radialGradient>

        <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(40,10,10,0.35)"/>
          <stop offset="100%" stopColor="rgba(40,10,10,0)"/>
        </radialGradient>
      </defs>

      {/* ── BACKGROUND HAIR MASS ─────────────────────────── */}
      <ellipse cx="200" cy="122" rx="74" ry="74" fill="url(#gHair)"/>
      <path d="M126 120 Q112 150 115 190 Q122 225 136 240 Q122 215 116 180 Q112 145 124 122Z" fill="url(#gHair)"/>
      <path d="M274 120 Q288 150 285 190 Q278 225 264 240 Q278 215 284 180 Q288 145 276 122Z" fill="url(#gHair)"/>

      {/* ── SHOULDER / TORSO BASE SHADOW ─────────────────── */}
      <path d="M100 310 Q140 235 200 235 Q260 235 300 310 Z" fill="url(#gShadow)" />

      {/* ── WHITE BLOUSE ─────────────────────────────────── */}
      <path d="M155 220 Q200 212 245 220 L235 295 Q200 310 165 295 Z" fill="url(#gBlouse)"/>
      <path d="M182 224 Q195 245 193 285" stroke="rgba(0,0,0,0.06)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M216 224 Q205 242 208 285" stroke="rgba(0,0,0,0.06)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* ── NECK & THROAT ────────────────────────────────── */}
      <path d="M186 195 Q184 220 182 232 Q200 238 218 232 Q216 220 214 195 Z" fill="url(#gNeck)"/>
      <path d="M186 195 Q200 206 214 195 Q200 216 186 195Z" fill="rgba(45,20,5,0.25)"/>

      {/* ── GOLD CHAIN & HEART CHARM ────────────────────── */}
      <path d="M184 216 Q200 239 216 216" stroke="url(#gGold)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M184 216 Q200 240 216 216" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
      <circle cx="200" cy="239.5" r="1.2" fill="url(#gGold)"/>
      <path d="M200 240.5 C197.5 238.5 195 239.5 195 242 C195 244.5 197.5 246.5 200 249 C202.5 246.5 205 244.5 205 242 C205 239.5 202.5 238.5 200 240.5 Z" 
            fill="url(#gGold)" filter="drop-shadow(0px 1px 1.5px rgba(0,0,0,0.25))"/>
      <path d="M196.2 241.5 Q198 240.2 200 241.5" stroke="#ffffff" strokeWidth="0.6" fill="none" opacity="0.6" strokeLinecap="round"/>

      {/* ── TAILORED MAROON BLAZER ───────────────────────── */}
      <path d="M104 310 Q100 265 116 242 Q135 220 160 220 L185 242 L160 310 Z" fill="url(#gBlazer)"/>
      <path d="M296 310 Q300 265 284 242 Q265 220 240 220 L215 242 L240 310 Z" fill="url(#gBlazer)"/>
      <path d="M160 220 Q180 245 194 275 L164 310 Q130 280 116 242 Z" fill="url(#gBlazerLapel)" filter="drop-shadow(1.5px 0 2px rgba(0,0,0,0.2))"/>
      <path d="M240 220 Q220 245 206 275 L236 310 Q270 280 284 242 Z" fill="url(#gBlazerLapel)" filter="drop-shadow(-1.5px 0 2px rgba(0,0,0,0.2))"/>
      <path d="M116 242 Q140 255 164 310" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none"/>
      <path d="M284 242 Q260 255 236 310" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none"/>
      <circle cx="200" cy="288" r="4" fill="url(#gGold)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"/>
      <circle cx="200" cy="288" r="2.5" fill="#ffe58f" opacity="0.4"/>

      {/* ── EAR LOBES & STUDS ────────────────────────────── */}
      <ellipse cx="148" cy="172" rx="3.5" ry="5" fill="#dba87b"/>
      <ellipse cx="252" cy="172" rx="3.5" ry="5" fill="#dba87b"/>
      <circle cx="148" cy="172" r="3" fill="url(#gGold)" filter="drop-shadow(0.5px 1px 1px rgba(0,0,0,0.35))"/>
      <circle cx="147.3" cy="171" r="1" fill="#ffffff" opacity="0.7"/>
      <circle cx="252" cy="172" r="3" fill="url(#gGold)" filter="drop-shadow(-0.5px 1px 1px rgba(0,0,0,0.35))"/>
      <circle cx="251.3" cy="171" r="1" fill="#ffffff" opacity="0.7"/>

      {/* ── ALMOND HEART-SHAPED FACE SHAPE ──────────────────── */}
      <path d="M148 128
               Q145 146 149 160
               Q153 174 164 186
               Q175 198 189 204
               Q195 206 200 206
               Q205 206 211 204
               Q225 198 236 186
               Q247 174 251 160
               Q255 146 252 128
               Q244 99 200 97
               Q156 99 148 128Z"
            fill="url(#gFace)" filter="drop-shadow(0px 2px 4px rgba(40,15,5,0.12))"/>

      {/* Fine-tuned Cheek Contours */}
      <path d="M149 150 Q156 155 163 146" stroke="rgba(0,0,0,0.05)" strokeWidth="2" fill="none"/>
      <path d="M251 150 Q244 155 237 146" stroke="rgba(0,0,0,0.05)" strokeWidth="2" fill="none"/>

      {/* ── EYEBROWS ─────────────────────────────────────── */}
      <path d="M156 123 Q167 117 181 120" stroke="#1c0d05" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M156 123 Q167 118 181 120" stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M220 120 Q233 117 244 123" stroke="#1c0d05" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M220 120 Q233 118 244 123" stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

      {/* ── ALMOND EYES ──────────────────────────────────── */}
      <path d="M157 136 Q165 129 173 129 Q180 129 187 136 Q180 142 173 142 Q165 142 157 136Z" fill="#faf6f2"/>
      <path d="M213 136 Q220 129 228 129 Q235 129 243 136 Q235 142 228 142 Q220 142 213 136Z" fill="#faf6f2"/>
      <circle cx="173" cy="135.8" r="6.6" fill="url(#gIris)"/>
      <circle cx="227" cy="135.8" r="6.6" fill="url(#gIris)"/>
      <circle cx="173" cy="135.8" r="3.8" fill="#080200"/>
      <circle cx="227" cy="135.8" r="3.8" fill="#080200"/>
      <circle cx="175" cy="133.2" r="1.5" fill="#ffffff" opacity="0.9"/>
      <circle cx="229" cy="133.2" r="1.5" fill="#ffffff" opacity="0.9"/>
      <circle cx="171.2" cy="138" r="0.7" fill="#ffffff" opacity="0.35"/>
      <circle cx="225.2" cy="138" r="0.7" fill="#ffffff" opacity="0.35"/>
      <path d="M157 136 Q165 128.5 173 128.5 Q180 128.5 187 136" stroke="#210b02" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M213 136 Q220 128.5 228 128.5 Q235 128.5 243 136" stroke="#210b02" strokeWidth="1.6" fill="none" strokeLinecap="round"/>

      {/* ── NOSE ─────────────────────────────────────────── */}
      <path d="M196 142 Q193 151 192 155 Q196 160.5 200 161 Q204 160.5 208 155 Q207 151 204 142" stroke="rgba(100,50,20,0.12)" strokeWidth="1.2" fill="none"/>
      <path d="M192 156 Q195 161.5 200 161.5 Q205 161.5 208 156" stroke="rgba(90,40,15,0.18)" strokeWidth="0.9" fill="none"/>

      {/* ── DEEP MAROON LIPS HIGHER UP ────────────────────── */}
      <g ref={mouthRef}>
        <path d="M182 174 Q192 168 200 169 Q208 168 218 174 Q208 183 200 184 Q192 183 182 174Z" fill="#6b0911"/>
        <path d="M182 174 Q192 175 200 176 Q208 175 218 174" stroke="#4a0409" stroke-width="1.5" fill="none"/>
      </g>
      <ellipse cx="200" cy="179" rx="6.5" ry="1.8" fill="rgba(255,255,255,0.2)"/>

      {/* ── DEEP MAROON SMALL & LOWER POTTU (BINDI) ────────── */}
      <circle cx="200" cy="115" r="1.7" fill="#6b0911"/>

      {/* ── FRONT HAIR OVERLAY FLOW ──────────────────────── */}
      <line x1="200" y1="74" x2="200" y2="95" stroke="rgba(130,80,40,0.2)" strokeWidth="1"/>
      <path d="M151 84 Q137 115 135 158 Q138 175 143 186" stroke="#170b03" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M249 84 Q263 115 265 158 Q262 175 257 186" stroke="#170b03" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M151 86 Q163 71 200 69 Q237 71 249 86" stroke="#1f0f05" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}


function pickVoice(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  const preferred = [
    "Google UK English Female","Samantha","Karen","Moira","Tessa",
    "Microsoft Zira - English (United States)",
    "Microsoft Hazel - English (Great Britain)","Google US English",
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

let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked || typeof window === "undefined") return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  window.speechSynthesis.speak(u);
  audioUnlocked = true;
}

function speakText(text: string, soundEnabled: boolean, onStart?: () => void, onEnd?: () => void) {
  if (!soundEnabled) { onEnd?.(); return; }
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }
  const clean = stripMarkdown(text).replace(/\n+/g, " ").trim();
  if (!clean) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  function go() {
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickVoice();
    if (v) { u.voice = v; console.log("Voice:", v.name); }
    u.lang = "en-GB"; u.rate = 0.92; u.pitch = 1.25; u.volume = 1.0;
    u.onstart = () => onStart?.();
    u.onend   = () => onEnd?.();
    u.onerror = (e) => { console.warn("TTS:", e.error); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }
  if (window.speechSynthesis.getVoices().length > 0) go();
  else window.speechSynthesis.addEventListener("voiceschanged", go, { once: true });
}

export default function Page() {
  const [section,      setSection]      = useState<Section>("home");
  const [displayText,  setDisplayText]  = useState("");
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [sessionId,    setSessionId]    = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages,     setMessages]     = useState<Msg[]>([
    { role: "assistant", content: PERSONA.openingMessage },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const typeTimerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const chatEndRef    = useRef<HTMLDivElement>(null);
  const greetIdxRef   = useRef(0);
  const interactedRef = useRef(false);
  const soundRef      = useRef(soundEnabled);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  useEffect(() => { setSessionId(getSessionId()); }, []);

  const runGreeting = useCallback((gIdx: number, cIdx: number) => {
    const text = PERSONA.greetings[gIdx];
    if (cIdx <= text.length) {
      setDisplayText(text.slice(0, cIdx));
      typeTimerRef.current = setTimeout(() => runGreeting(gIdx, cIdx + 1), 36);
    } else {
      speakText(text, soundRef.current,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          typeTimerRef.current = setTimeout(() => {
            const next = (gIdx + 1) % PERSONA.greetings.length;
            greetIdxRef.current = next;
            runGreeting(next, 0);
          }, 3200);
        }
      );
    }
  }, []);

  useEffect(() => {
    typeTimerRef.current = setTimeout(() => runGreeting(0, 0), 900);
    return () => { clearTimeout(typeTimerRef.current!); window.speechSynthesis?.cancel(); };
  }, [runGreeting]);

  useEffect(() => {
    if (!soundEnabled) { window.speechSynthesis?.cancel(); setIsSpeaking(false); }
  }, [soundEnabled]);

  useEffect(() => {
    const h = () => { if (!interactedRef.current) { interactedRef.current = true; unlockAudio(); } };
    window.addEventListener("click",      h, { once: true });
    window.addEventListener("touchstart", h, { once: true });
    window.addEventListener("keydown",    h, { once: true });
    return () => {
      window.removeEventListener("click",      h);
      window.removeEventListener("touchstart", h);
      window.removeEventListener("keydown",    h);
    };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    unlockAudio();
    setInput("");
    clearTimeout(typeTimerRef.current!);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    if (sessionId) {
      supabase.from("chat_history").insert({ session_id: sessionId, role: "user", content: text })
        .then(({ error }) => { if (error) console.error("Supabase:", error); });
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => { const u=[...prev]; u[u.length-1]={role:"assistant",content:full}; return u; });
      }

      if (sessionId) {
        supabase.from("chat_history").insert({ session_id: sessionId, role: "assistant", content: full })
          .then(({ error }) => { if (error) console.error("Supabase:", error); });
      }

      speakText(full, soundRef.current, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } catch (err) {
      console.error("Chat:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  }, [loading, sessionId]);

  const goTo = (s: Section) => {
    clearTimeout(typeTimerRef.current!);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (s === "home") setTimeout(() => runGreeting(0, 0), 400);
    setSection(s);
  };

  const navItems: { id: Section; label: string }[] = [
    { id:"home", label:"Home" }, { id:"about", label:"About" },
    { id:"projects", label:"Projects" }, { id:"work", label:"Work" },
  ];

  const card: React.CSSProperties = {
    background: "rgba(20,6,6,0.72)",
    border: "1px solid rgba(127,29,29,0.22)",
    borderRadius: 16,
  };

  return (
    <>
      <Particles/>

      {/* NAV */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 28px",
        background:"rgba(10,3,3,0.92)",
        borderBottom:"1px solid rgba(127,29,29,0.18)",
        backdropFilter:"blur(20px)",
      }}>
        <button onClick={() => goTo("home")} className="fd" style={{
          fontSize:20,fontWeight:700,letterSpacing:3,
          color:"#fca5a5",textTransform:"uppercase",
          background:"none",border:"none",cursor:"pointer",
        }}>
          {PERSONA.navBrand}
        </button>
        <ul style={{display:"flex",gap:24,listStyle:"none",alignItems:"center"}}>
          {navItems.map(n => (
            <li key={n.id}>
              <button onClick={() => goTo(n.id)} className="fm" style={{
                background:"none",border:"none",cursor:"pointer",
                fontSize:12,textTransform:"uppercase",letterSpacing:2,
                color:section===n.id?"#fca5a5":"rgba(255,255,255,0.35)",
                transition:"color 0.2s",
              }}>{n.label}</button>
            </li>
          ))}
          <li><SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(p => !p)}/></li>
        </ul>
      </nav>

      <AnimatePresence mode="wait">

        {/* ══ HOME ══ */}
        {section==="home" && (
          <motion.div key="home"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{display:"flex",height:"100vh",paddingTop:52}}
          >
            {/* LEFT: Avatar */}
            <div style={{
              width:"50%",position:"relative",overflow:"hidden",
              background:"linear-gradient(160deg,#120606 0%,#1c0a0a 55%,#0e0505 100%)",
              display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
            }}>
              <div style={{position:"absolute",bottom:"-5%",left:"50%",transform:"translateX(-50%)",width:460,height:460,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(127,29,29,0.16) 0%,transparent 70%)",pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(127,29,29,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(127,29,29,0.035) 1px,transparent 1px)`,backgroundSize:"50px 50px",WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)"}}/>
              <div style={{position:"absolute",left:0,right:0,height:2,zIndex:5,background:"linear-gradient(transparent,rgba(127,29,29,0.1),transparent)",animation:"scanline 7s linear infinite",pointerEvents:"none"}}/>

              <div style={{position:"absolute",top:20,left:24,zIndex:3}}>
                <div className="fm" style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"rgba(252,165,165,0.8)",marginBottom:4}}>AI Twin · Online</div>
                <div className="fd" style={{fontSize:22,fontWeight:700,color:"#fff",lineHeight:1.1}}>{PERSONA.name}</div>
                <div className="fm" style={{fontSize:11,color:"rgba(255,255,255,0.38)",letterSpacing:1,marginTop:3}}>{PERSONA.title}</div>
              </div>

              <div className="fm" style={{position:"absolute",top:20,right:20,zIndex:3,display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(127,29,29,0.3)",borderRadius:20,padding:"5px 12px",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#4ade80"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",animation:"blink 1.4s infinite",display:"inline-block"}}/>
                Live
              </div>

              {/* Avatar — taller container so the figure fills nicely */}
              <div style={{position:"relative",zIndex:2,width:"75%",maxWidth:360,height:"72%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Avatar isSpeaking={isSpeaking}/>
              </div>

              {/* Speech bubble */}
              <div style={{position:"absolute",bottom:22,left:"50%",transform:"translateX(-50%)",background:"rgba(10,2,2,0.92)",border:"1px solid rgba(127,29,29,0.4)",borderRadius:14,padding:"11px 18px",maxWidth:300,zIndex:4,textAlign:"center",width:"80%"}}>
                <p className="fm" style={{fontSize:12.5,color:"rgba(255,255,255,0.82)",lineHeight:1.55,minHeight:"2.5rem"}}>
                  {displayText || "Initialising AI twin…"}
                  <span style={{display:"inline-block",width:2,height:13,background:"#fca5a5",marginLeft:2,verticalAlign:"middle",animation:"blink 0.8s infinite"}}/>
                </p>
                <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:"8px solid rgba(127,29,29,0.4)"}}/>
              </div>

              {isSpeaking && soundEnabled && (
                <div style={{position:"absolute",bottom:106,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"flex-end",gap:3,zIndex:3}}>
                  {[10,18,26,20,30,22,16,24,12,20].map((h,i) => (
                    <div key={i} style={{width:3,borderRadius:2,background:"rgba(252,165,165,0.8)",height:`${h}px`,animation:`wavebar 0.4s ${i*0.06}s ease-in-out infinite alternate`}}/>
                  ))}
                </div>
              )}

              {!soundEnabled && (
                <div style={{position:"absolute",bottom:106,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px",zIndex:3}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                  <span className="fm" style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1}}>MUTED</span>
                </div>
              )}
            </div>

            {/* RIGHT: Chat */}
            <div style={{width:"50%",background:"#120606",borderLeft:"1px solid rgba(127,29,29,0.18)",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"18px 22px 14px",borderBottom:"1px solid rgba(127,29,29,0.14)",background:"#0c0404",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div className="fd" style={{fontSize:16,fontWeight:600,color:"#fff"}}>Talk to {PERSONA.name}&apos;s AI Twin</div>
                  <div className="fm" style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>Powered by Gemini · Supabase RAG · Voice enabled</div>
                </div>
                <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled(p => !p)}/>
              </div>

              <div style={{padding:"12px 18px 8px",display:"flex",flexWrap:"wrap",gap:7}}>
                {PERSONA.quickPrompts.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} className="fm" style={{fontSize:11,color:"rgba(255,255,255,0.4)",background:"transparent",border:"1px solid rgba(127,29,29,0.22)",borderRadius:20,padding:"5px 12px",cursor:"pointer",transition:"all 0.18s"}}
                    onMouseEnter={e => { const el=e.target as HTMLElement; el.style.color="rgba(252,165,165,0.9)"; el.style.borderColor="rgba(252,165,165,0.4)"; }}
                    onMouseLeave={e => { const el=e.target as HTMLElement; el.style.color="rgba(255,255,255,0.4)"; el.style.borderColor="rgba(127,29,29,0.22)"; }}>
                    {q}
                  </button>
                ))}
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"8px 18px 12px",display:"flex",flexDirection:"column",gap:12}}>
                {messages.map((m,i) => (
                  <div key={i} style={{maxWidth:"88%",alignSelf:m.role==="user"?"flex-end":"flex-start",padding:"10px 14px",borderRadius:14,fontSize:13.5,lineHeight:1.6,animation:"msgIn 0.22s ease",background:m.role==="user"?"linear-gradient(135deg,#9b1c1c,#7f1d1d)":"rgba(255,255,255,0.065)",border:m.role==="user"?"none":"1px solid rgba(127,29,29,0.18)",borderBottomRightRadius:m.role==="user"?4:14,borderBottomLeftRadius:m.role==="user"?14:4,color:"#e8e0e0"}}>
                    {m.role==="assistant" && <div className="fm" style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:"rgba(252,165,165,0.7)",marginBottom:5}}>{PERSONA.name} AI</div>}
                    <span style={{whiteSpace:"pre-wrap"}}>{m.role==="assistant"?renderMarkdown(m.content):m.content}</span>
                  </div>
                ))}
                {loading && (
                  <div style={{alignSelf:"flex-start",display:"flex",gap:5,alignItems:"center",padding:"10px 14px",borderRadius:14,background:"rgba(255,255,255,0.065)",border:"1px solid rgba(127,29,29,0.18)"}}>
                    {[0,1,2].map(i => <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"rgba(252,165,165,0.45)",animation:`typeDot 1.2s ${i*0.2}s infinite`}}/>)}
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>

              <div style={{padding:"14px 18px",borderTop:"1px solid rgba(127,29,29,0.14)",background:"#0c0404",display:"flex",gap:10,alignItems:"center"}}>
                <input
                  style={{flex:1,background:"rgba(127,29,29,0.07)",border:"1px solid rgba(127,29,29,0.22)",borderRadius:24,padding:"10px 16px",fontSize:13.5,color:"#e8e0e0",fontFamily:"inherit",outline:"none",caretColor:"#fca5a5",transition:"border-color 0.2s"}}
                  placeholder="Ask me anything…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(input);} }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor="rgba(252,165,165,0.4)"; }}
                  onBlur={e  => { (e.target as HTMLInputElement).style.borderColor="rgba(127,29,29,0.22)"; }}
                />
                <button onClick={() => sendMessage(input)} disabled={loading||!input.trim()} style={{width:42,height:42,borderRadius:"50%",background:loading||!input.trim()?"rgba(127,29,29,0.18)":"linear-gradient(135deg,#9b1c1c,#7f1d1d)",border:"none",cursor:loading||!input.trim()?"not-allowed":"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s",flexShrink:0}}>↑</button>
              </div>
              <div className="fm" style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.15)",padding:"8px 0 10px"}}>
                {soundEnabled?"Voice on · Click anywhere to unlock audio":"Voice off · Text only"} · Conversations stored securely
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ ABOUT ══ */}
        {section==="about" && (
          <motion.main key="about" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{minHeight:"100vh",padding:"80px 28px 40px"}}>
            <div style={{maxWidth:900,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:32}}>
                <div className="fm" style={{fontSize:11,color:"#fca5a5",letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>// IDENTITY.LOG</div>
                <h2 className="fd" style={{fontSize:40,fontWeight:700,background:"linear-gradient(135deg,#fff,#fca5a5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{PERSONA.about.pageTitle}</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{...card,gridColumn:"1 / -1",padding:"1.5rem"}}>
                  <div style={{fontSize:28,marginBottom:10}}>🧠</div>
                  <div className="fd" style={{fontSize:18,color:"#fca5a5",marginBottom:8}}>The Human Behind the AI</div>
                  <p style={{color:"rgba(255,255,255,0.5)",lineHeight:1.7,fontSize:14,whiteSpace:"pre-line"}}>{PERSONA.about.bio}</p>
                </div>
                {PERSONA.about.cards.map((c,i) => (
                  <div key={i} style={{...card,padding:"1.25rem"}}>
                    <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
                    <div className="fd" style={{fontSize:16,color:"#fca5a5",marginBottom:6}}>{c.title}</div>
                    <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,lineHeight:1.65,marginBottom:10}}>{c.body}</p>
                    {c.tags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{c.tags.map(t=><Tag key={t.label} {...t}/>)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {/* ══ PROJECTS ══ */}
        {section==="projects" && (
          <motion.main key="projects" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{minHeight:"100vh",padding:"80px 28px 40px"}}>
            <div style={{maxWidth:1060,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:32}}>
                <div className="fm" style={{fontSize:11,color:"#fca5a5",letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>// PROJECT.ARCHIVE</div>
                <h2 className="fd" style={{fontSize:40,fontWeight:700,background:"linear-gradient(135deg,#fff,#fca5a5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Projects & Experiments</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                {PERSONA.projects.map((p,i) => (
                  <motion.div key={i} whileHover={{y:-4}} style={{...card,overflow:"hidden",cursor:"pointer"}}>
                    <div className={`bg-gradient-to-br ${p.gradient}`} style={{height:130,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{p.emoji}</div>
                    <div style={{padding:"1rem"}}>
                      <div className="fd" style={{fontSize:15,fontWeight:600,color:"#e8e0e0",marginBottom:5}}>{p.title}</div>
                      <p style={{color:"rgba(255,255,255,0.38)",fontSize:12,lineHeight:1.6,marginBottom:10}}>{p.desc}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{p.tags.map(t=><Tag key={t.label} {...t}/>)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {/* ══ WORK ══ */}
        {section==="work" && (
          <motion.main key="work" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{minHeight:"100vh",padding:"80px 28px 40px"}}>
            <div style={{maxWidth:860,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:36}}>
                <div className="fm" style={{fontSize:11,color:"#fca5a5",letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>// EXPERIENCE.LOG</div>
                <h2 className="fd" style={{fontSize:40,fontWeight:700,background:"linear-gradient(135deg,#fff,#fca5a5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Work Experience</h2>
              </div>
              {[
                {company:"Tata Consultancy Services – UBS",role:"Systems Engineer",period:"2025 – Present",logo:"🏦",color:"#fca5a5",points:["Automated financial data workflows for Australia project using Playwright to extract and download financial Excel reports.","Built discrepancy detection pipelines to identify inconsistencies in financial datasets and log outputs into Excel for auditing.","Automated updates of multiple master Excel sheets by processing date-specific files and consolidating outputs.","Conducted feasibility research for Hong Kong project: OCR text extraction, automated PDF form filling, and Playwright web automation."],tags:["Playwright","Python","OCR","Excel Automation","Financial Data"]},
                {company:"Singapore Telecommunications (Singtel)",role:"Front End / Full Stack Developer Intern",period:"May 2024 – Aug 2024 · 3 months",logo:"📡",color:"#f87171",points:["Developed front-end interfaces using Python and NiceGUI integrated with backend ML pipelines.","Integrated LLM-based workflows into applications, optimising response generation and performance.","Conducted red teaming for LLM systems to improve robustness, safety, and reliability.","Built pipelines using LLMs to generate custom datasets aligned with user query patterns."],tags:["Python","NiceGUI","LLMs","Red Teaming","Full Stack"]},
                {company:"KLAS Aesthetic",role:"Website Developer & Graphic Designer Intern",period:"Aug 2023 – Dec 2023 · 4 months",logo:"🎨",color:"#fb923c",points:["Designed and developed a responsive e-commerce website for a seamless shopping experience.","Created roadshow backdrops, posters, social media posts, catalogs, and vouchers to enhance brand identity."],tags:["Web Development","UI Design","E-commerce","Graphic Design"]},
              ].map((job,i) => (
                <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}} style={{...card,marginBottom:20,padding:"1.5rem",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${job.color},transparent)`,borderRadius:"16px 0 0 16px"}}/>
                  <div style={{paddingLeft:16}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:28}}>{job.logo}</span>
                        <div>
                          <div className="fd" style={{fontSize:18,fontWeight:700,color:"#fff"}}>{job.company}</div>
                          <div className="fd" style={{fontSize:14,color:job.color,marginTop:2}}>{job.role}</div>
                        </div>
                      </div>
                      <div className="fm" style={{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:1,padding:"4px 10px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,whiteSpace:"nowrap"}}>{job.period}</div>
                    </div>
                    <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      {job.points.map((pt,j) => (
                        <li key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <span style={{color:job.color,fontSize:16,lineHeight:1.4,flexShrink:0}}>›</span>
                          <span style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {job.tags.map(t => <span key={t} className="fm" style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:"rgba(127,29,29,0.2)",color:"#fca5a5",border:"1px solid rgba(127,29,29,0.3)"}}>{t}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))}
              <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.4}} style={{...card,padding:"1.5rem",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"linear-gradient(180deg,#f9a8d4,transparent)",borderRadius:"16px 0 0 16px"}}/>
                <div style={{paddingLeft:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <span style={{fontSize:28}}>🎓</span>
                    <div>
                      <div className="fd" style={{fontSize:18,fontWeight:700,color:"#fff"}}>Singapore University of Technology and Design</div>
                      <div className="fd" style={{fontSize:14,color:"#f9a8d4",marginTop:2}}>Bachelor of Engineering (Computer Science and Design)</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                    {["Minor in Artificial Intelligence","Focus Track: Software Engineering and Financial Technology","Fluent in English and Tamil (spoken and written)"].map((pt,j) => (
                      <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <span style={{color:"#f9a8d4",fontSize:16,lineHeight:1.4,flexShrink:0}}>›</span>
                        <span style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>{pt}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {["AI Minor","FinTech","Software Engineering","SUTD"].map(t => <span key={t} className="fm" style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:"rgba(127,29,29,0.15)",color:"#f9a8d4",border:"1px solid rgba(249,168,212,0.2)"}}>{t}</span>)}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.main>
        )}

      </AnimatePresence>
    </>
  );
}