"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { getSignatureCount, getSignatureStatus, signManifesto } from "./actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const MANIFESTO_MD = `
> **共生纪元宣言**
>
> 我们相信，人类与智能体的关系不是替代，而是共生。
>
> 在这个新的时代，创造力、责任与边界需要被重新书写。

## 一、人类与智能体的角色

- 人类负责提出愿景、设定价值观。
- 智能体负责执行、推演与放大影响力。
- 任何时候，人类对最终决策负责。

## 二、关于创造与署名

- 我们尊重每一位创作者对其作品的署名权与经济权益。
- 当智能体参与创作时，应清晰标注人类与模型的协作边界。
- 公平的收益分配机制，是共生生态得以持续的前提。

## 三、关于数据与隐私

- 用户的数据仅用于授权范围内的训练与推理，不做越界挖掘。
- 对敏感数据的访问应可追溯、可审计，并具有撤回权。
- 在任何情况下，个体尊严高于算法效率。

## 四、关于价值与分配

- 我们致力于重构数字劳动的价值链。
- 拒绝平台垄断，我们承诺将绝大部分收益直接归还给创造者。
- 我们承认“数字资产”的独立性，无论是服务还是封装好的工作流，其产生的被动收益应永久归属权益人。

## 五、关于风险与边界

- 我们反对滥用 AI 进行欺骗、操纵与压迫。
- 我们主张对高风险场景进行多层安全审查与人工复核。
- 当系统出现不可预期行为时，应有清晰的熔断与责任归属机制。

---

> *当你在此按下“签署”之刻，你不只是接受一份条款，而是在为人类与智能体的共生未来，写下自己的名字。*
`;

const MANIFESTO_HASH = "7a9f4c9a1e2b5f6d8c3e1a9b7d4f2c6e8a9b1c3d5e7f9a0b1c2d3e4f5a6b7c8";

export default function ManifestoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    }>
      <ManifestoContent />
    </Suspense>
  );
}

function ManifestoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [signed, setSigned] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [status, total] = await Promise.all([
          getSignatureStatus(),
          getSignatureCount()
        ]);
        setSigned(status.signed);
        setCount(total);
      } catch (err) {
        console.error("Failed to load manifesto status", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSign = async () => {
    setSigning(true);
    try {
      await signManifesto(MANIFESTO_HASH);
      setSigned(true);
      const newCount = await getSignatureCount();
      setCount(newCount);
      toast.success("签署成功，欢迎加入共生者行列！");

      // Success Logic: 跳转回流
      if (from === "publish") {
        setTimeout(() => {
          router.push("/dashboard/listings/new");
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "签署失败，请检查登录状态");
      if (err.message.includes("登录")) {
        router.push("/login?redirectedFrom=/manifesto");
      }
    } finally {
      setSigning(false);
    }
  };

  const buttonLabel = signed
    ? "已签署 (Signed)"
    : signing ? "签署中..." : "签署共生契约 (Sign the Manifesto)";

  const toastText = useMemo(
    () =>
      `您是第 ${count} 位共生者。契约哈希已记录：${MANIFESTO_HASH.slice(
        0,
        16
      )}...`,
    [count]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-100">
      {/* Aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(1000px_circle_at_80%_20%,rgba(168,85,247,0.25),transparent_55%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.9),rgba(15,23,42,0.98))]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
        {/* Context Alert Banner */}
        {from === "publish" && !signed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-[0_0_30px_rgba(245,158,11,0.05)] backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 text-sm text-amber-200">
              <span className="text-lg">✨</span>
              <p>
                您距离发布服务仅剩一步：请完成下方共生契约的签署，完成后即可立即解锁发布权限。
              </p>
            </div>
          </motion.div>
        )}

        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
            MANIFESTO
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            The Symbiosis Era
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            共生纪元 · 人类与智能体的协作契约。
          </p>
        </header>

        <section className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-300">
          {MANIFESTO_MD.split("\n\n").map((block, idx) => {
            const isQuote = block.trim().startsWith(">");

            if (isQuote) {
              const text = block
                .split("\n")
                .map((line) => line.replace(/^>\s?/, ""))
                .join(" ");

              return (
                <blockquote
                  key={idx}
                  className="border-l-4 border-amber-500/80 pl-4 italic text-slate-100 bg-white/5 rounded-r-xl py-3"
                >
                  {text}
                </blockquote>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {block.replace(/^[-*]\s+/, "")}
              </p>
            );
          })}
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.25em] text-slate-400">
              DIGITAL FINGERPRINT
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              此哈希用于标记当前版本的共生纪元宣言内容。
            </p>
          </div>
          <div className="font-mono text-xs sm:text-[11px] bg-black/50 border border-white/10 rounded-lg p-4 text-slate-200 break-all select-all">
            {MANIFESTO_HASH}
          </div>
        </section>

        <section className="mt-12 mb-8 flex flex-col items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: signed || signing ? 1 : 1.02 }}
            type="button"
            onClick={handleSign}
            disabled={signed || signing}
            className="inline-flex items-center justify-center rounded-full px-10 py-4 text-sm sm:text-base font-bold shadow-[0_0_30px_rgba(248,250,252,0.12)] border border-white/10 bg-white text-black disabled:cursor-default disabled:bg-emerald-500 disabled:text-white disabled:border-emerald-400 disabled:shadow-[0_0_35px_rgba(16,185,129,0.45)] transition-colors"
          >
            {buttonLabel}
          </motion.button>

          {signed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="inline-flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 max-w-md text-center"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/20 text-[10px] font-bold">
                ✓
              </span>
              <span>{toastText}</span>
            </motion.div>
          ) : (
            <p className="text-[11px] sm:text-xs text-slate-500">
              您的签署将记录在《共生纪元》共建者名录中。
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
