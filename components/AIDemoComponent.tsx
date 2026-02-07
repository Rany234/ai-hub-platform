"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type DemoPhase = "typing" | "loading" | "result";

const PROMPT_TEXT = "A futuristic city skyline at sunset...";

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => savedCallback.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

export function AIDemoComponent() {
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [typed, setTyped] = useState<string>("");
  const [seed, setSeed] = useState(0);

  const placeholderUrl = useMemo(() => {
    // Stable-ish placeholder that changes each loop
    const w = 900;
    const h = 600;
    return `https://picsum.photos/seed/ai-hub-${seed}/${w}/${h}`;
  }, [seed]);

  // Typing loop
  useInterval(
    () => {
      if (phase !== "typing") return;
      setTyped((prev) => {
        if (prev.length >= PROMPT_TEXT.length) return prev;
        return PROMPT_TEXT.slice(0, prev.length + 1);
      });
    },
    phase === "typing" ? 35 : null
  );

  // Phase transitions
  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length < PROMPT_TEXT.length) return;

    const t = window.setTimeout(() => setPhase("loading"), 550);
    return () => window.clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => setPhase("result"), 1200);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") return;
    const t = window.setTimeout(() => {
      setPhase("typing");
      setTyped("");
      setSeed((s) => s + 1);
    }, 2400);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Prompt */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-300">Prompt</div>
            <div className="text-[11px] text-slate-500">AI-Hub Demo</div>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[12px] leading-5 text-slate-200">
            <span className="text-slate-400">&gt; </span>
            <span>{typed}</span>
            <motion.span
              className="inline-block w-2 align-[-2px]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              |
            </motion.span>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            {phase === "typing" && "正在输入..."}
            {phase === "loading" && "生成中..."}
            {phase === "result" && "生成完成"}
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-2xl" />
        </div>

        {/* Preview */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-slate-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI 生成演示
          </div>

          <div className="relative aspect-[4/3]">
            <AnimatePresence mode="wait">
              {phase === "loading" ? (
                <motion.div
                  key="skeleton"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.06)_33%)] bg-[length:200%_100%]" />
                  <motion.div
                    className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.00)_8%,rgba(255,255,255,0.10)_18%,rgba(255,255,255,0.00)_33%)] bg-[length:200%_100%]"
                    animate={{ backgroundPositionX: ["200%", "-200%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={placeholderUrl}
                    alt="AI 生成演示"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.65),transparent_50%)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress / volume bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className="w-[5px] rounded-sm bg-gradient-to-t from-indigo-400/70 to-fuchsia-300/70"
                  animate={{
                    height:
                      phase === "result"
                        ? [6, 18, 10, 22, 8, 16]
                        : phase === "loading"
                        ? [4, 10, 6, 12, 5, 9]
                        : [3, 6, 4, 7, 3, 5],
                    opacity: phase === "typing" ? 0.55 : 0.9,
                  }}
                  transition={{
                    duration: phase === "result" ? 1.2 : 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.03,
                  }}
                />
              ))}
              <div className="ml-2 flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400/70 via-sky-300/60 to-fuchsia-300/70"
                    animate={{
                      width:
                        phase === "typing"
                          ? ["12%", "40%", "22%"]
                          : phase === "loading"
                          ? ["15%", "92%"]
                          : ["92%", "100%"],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: phase === "loading" ? 1.2 : 1.6,
                      repeat: phase === "result" ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {phase === "typing" && "等待输入"}
                  {phase === "loading" && "处理进度"}
                  {phase === "result" && "输出稳定"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
