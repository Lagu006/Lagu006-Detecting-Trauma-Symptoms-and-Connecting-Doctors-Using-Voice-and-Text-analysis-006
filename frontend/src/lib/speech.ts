import { useCallback, useEffect, useRef, useState } from "react";

/** Strip markdown + internal severity tags so the spoken output sounds natural. */
export function cleanForSpeech(text: string) {
  return text
    .replace(/Severity:\s*(LOW|MODERATE|HIGH)/gi, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function browserSpeak(text: string, lang: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return onEnd();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "en" ? "en-IN" : `${lang}-IN`;
  u.rate = 0.95;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
}

/** Speaks assistant replies aloud — AI Gateway TTS with browser speech fallback. */
export function useSpeech(lang: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
<<<<<<< HEAD
  const currentRequestRef = useRef<number>(0);

  const stop = useCallback(() => {
    currentRequestRef.current += 1;
=======

  const stop = useCallback(() => {
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (rawText: string, id = "current") => {
      const text = cleanForSpeech(rawText);
      if (!text) return;
<<<<<<< HEAD
      
      stop();
      const requestId = currentRequestRef.current;
      setSpeakingId(id);
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const url = new URL(`${API_URL}/api/tts/`);
        url.searchParams.append("text", text);
        url.searchParams.append("language", lang);
        
        const audio = new Audio(url.toString());
        audioRef.current = audio;
        audio.onended = () => {
          if (currentRequestRef.current === requestId) setSpeakingId(null);
        };
        audio.onerror = () => {
          if (currentRequestRef.current !== requestId) return;
          browserSpeak(text, lang, () => {
            if (currentRequestRef.current === requestId) setSpeakingId(null);
          });
        };
        await audio.play();
      } catch {
        if (currentRequestRef.current !== requestId) return;
        browserSpeak(text, lang, () => {
          if (currentRequestRef.current === requestId) setSpeakingId(null);
        });
=======
      stop();
      setSpeakingId(id);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/tts/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => browserSpeak(text, lang, () => setSpeakingId(null));
        await audio.play();
      } catch {
        browserSpeak(text, lang, () => setSpeakingId(null));
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
      }
    },
    [lang, stop],
  );

  return { speak, stop, speakingId };
}
