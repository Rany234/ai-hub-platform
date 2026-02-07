"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Activity = {
  id: string;
  text: string;
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeActivity(i: number): Activity {
  const sellers = ["卖家 A", "卖家 Luna", "卖家 Neo", "卖家 小北", "卖家 Aurora"];
  const buyers = ["买家 B", "买家 Kai", "买家 玖玖", "买家 Mira", "买家 Atlas"];
  const services = ["MJ 提示词服务", "智能体开发服务", "数据分析服务", "RAG 知识库搭建", "模型微调咨询"];
  const verbs = [
    () => `${pick(sellers)} 刚刚发布了 ${pick(services)}`,
    () => `${pick(buyers)} 接受了一个投标` ,
    () => `${pick(buyers)} 刚刚下单了 ${pick(services)}`,
    () => `${pick(sellers)} 更新了服务套餐定价`,
    () => `${pick(sellers)} 收到了一条新消息`,
  ];

  return {
    id: `activity-${Date.now()}-${i}`,
    text: pick(verbs)(),
  };
}

export function LiveActivityTicker() {
  const base = useMemo(() => Array.from({ length: 8 }).map((_, i) => makeActivity(i)), []);
  const [items, setItems] = useState<Activity[]>(base);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        // 每轮滚动到底就补充一条新动态
        if (next >= items.length) {
          setItems((old) => [...old, makeActivity(old.length)]);
        }
        return next;
      });
    }, 2600);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const current = items[Math.min(activeIndex, items.length - 1)];

  return (
    <div className="w-full border-t border-white/5 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-950/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950/90 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="whitespace-nowrap text-xs text-slate-400"
            >
              <span className="mr-2 text-slate-500">Live</span>
              <span className="text-slate-300">{current?.text ?? ""}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
