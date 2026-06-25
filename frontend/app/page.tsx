"use client";

import { useState } from "react";
import ArbitrationForm from "@/components/ArbitrationForm";
import CriticCard from "@/components/CriticCard";
import VerdictCard from "@/components/VerdictCard";
import { arbitrate } from "@/lib/api";
import { ArbitrationResult } from "@/types";
import { useLang } from "@/contexts/LangContext";

const AGENT_COLORS = [
  { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  { color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.2)" },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest shrink-0" style={{ color: "var(--c-text-muted)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--c-border)" }} />
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArbitrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleArbitrate = async (inputText: string, originalQuestion: string, useLocal: boolean) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await arbitrate(inputText, originalQuestion, useLocal));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("errorFallback"));
    } finally {
      setLoading(false);
    }
  };

  const agentKeys = [t("accuracy"), t("logic"), t("completeness"), t("synthesizer")] as const;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--c-text)" }}>
          {t("appTitle")}
        </h1>
        <p className="text-base max-w-2xl" style={{ color: "var(--c-text-muted)" }}>
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {agentKeys.map((label, i) => (
            <span
              key={label}
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                color: AGENT_COLORS[i].color,
                background: AGENT_COLORS[i].bg,
                border: `1px solid ${AGENT_COLORS[i].border}`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <ArbitrationForm onSubmit={handleArbitrate} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--c-bad-bg)", border: "1px solid var(--c-bad-border)", color: "var(--c-bad-text)" }}
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-7">
          <div className="h-px" style={{ background: "var(--c-border)" }} />

          <div className="space-y-3">
            <SectionHeader label={t("verdictSection")} />
            <VerdictCard result={result} />
          </div>

          <div className="space-y-3">
            <SectionHeader label={t("criticSection")} />
            <div className="grid gap-3">
              {result.critiques.map((c) => (
                <CriticCard key={c.dimension} critique={c} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
