"use client";

import { useEffect, useRef, useCallback } from "react";

interface Props {
  isSpeaking: boolean;
  currentText?: string;
  onLoad?: () => void;
}

declare global {
  interface Window {
    __talkingHead: any;
    __avatarReady: boolean;
  }
}

const AVATAR_URL =
  "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.7/avatars/brunette.glb";
const MODULE_URL =
  "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.7/modules/talkinghead.mjs";

export default function TalkingAvatar({ isSpeaking, onLoad }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const el = mountRef.current;
    if (!el) return;

    const timer = setTimeout(async () => {
      try {
        const mod = await import(/* webpackIgnore: true */ MODULE_URL as any);
        const TH = mod.TalkingHead ?? mod.default;
        const head = new TH(el, {
          ttsEndpoint: null,
          cameraView: "upper",
          cameraRotateEnable: false,
          cameraPanEnable: false,
          cameraZoomEnable: false,
          modelFPS: 30,
          background: null,
        });
        window.__talkingHead = head;
        await head.showAvatar(
          { url: AVATAR_URL, body: "F", avatarMood: "neutral", ttsLang: "en-GB" },
          (ev: string) => {
            if (ev === "loaded") {
              window.__avatarReady = true;
              head.playGesture("breathing", 999);
              onLoad?.();
            }
          }
        );
      } catch (e) {
        console.error("Avatar failed:", e);
        onLoad?.();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [onLoad]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%", display: "block", minHeight: 480 }}
      />
      {isSpeaking && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "flex-end", gap: 3,
        }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              width: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.7)",
              height: `${8 + Math.sin(i * 0.9) * 10 + 6}px`,
              animation: `waveBar 0.4s ${i * 0.06}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      )}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  );
}

function pickFemaleVoice(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return null;
  const preferred = [
    "Google UK English Female",
    "Samantha", "Karen", "Moira", "Tessa",
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

export function speakWithAvatar(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  const clean = text.replace(/[^\x00-\x7F]/g, "").replace(/\n+/g, " ").trim();
  if (!clean) { onEnd?.(); return; }

  const head = window.__talkingHead;
  if (head?.speakText && window.__avatarReady) {
    onStart?.();
    head.speakText(clean, { lang: "en-GB", rate: 0.95, pitch: 1.1 })
      .then(() => onEnd?.())
      .catch(() => doFallback());
  } else {
    doFallback();
  }

  function doFallback() {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    function go() {
      const u = new SpeechSynthesisUtterance(clean);
      const v = pickFemaleVoice();
      if (v) { u.voice = v; console.log("Voice:", v.name); }
      u.lang = "en-GB"; u.rate = 0.95; u.pitch = 1.2; u.volume = 1.0;
      u.onstart = () => onStart?.();
      u.onend = () => onEnd?.();
      u.onerror = () => onEnd?.();
      window.speechSynthesis.speak(u);
    }
    if (window.speechSynthesis.getVoices().length > 0) go();
    else window.speechSynthesis.addEventListener("voiceschanged", go, { once: true });
  }
}

export function stopSpeaking(): void {
  window.__talkingHead?.stopSpeaking?.();
  window.speechSynthesis?.cancel();
}