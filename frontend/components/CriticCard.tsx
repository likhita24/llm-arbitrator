"use client";

import { useState } from "react";
import { CritiqueOutput } from "@/types";
import { useLang, TKey } from "@/contexts/LangContext";

const DIM: Record<string, { labelKey: TKey; dot: string; accent: string }> = {
  accuracy:     { labelKey: "accuracy",     dot: "#60a5fa", accent: "#93c5fd" },
  logic:        { labelKey: "logic",        dot: "#a78bfa", accent: "#c4b5fd" },
  completeness: { labelKey: "completeness", dot: "#34d399", accent: "#6ee7b7" },
};

const SEV_KEYS: Record<string, TKey> = { low: "sev_low", medium: "sev_medium", high: "sev_high" };
const SEV_STYLE = {
  low:    { bg: "rgba(202,138,4,0.12)",  text: "#fde047", border: "rgba(202,138,4,0.3)" },
  medium: { bg: "rgba(234,88,12,0.12)",  text: "#fb923c", border: "rgba(234,88,12,0.3)" },
  high:   { bg: "rgba(220,38,38,0.15)",  text: "#f87171", border: "rgba(220,38,38,0.35)" },
};

export default function CriticCard({ critique }: { critique: CritiqueOutput }) {
  const { t } = useLang();
  const [showReasoning, setShowReasoning] = useState(false);
  const dim = DIM[critique.dimension];
  const pct = (critique.score / 5) * 100;
  const barColor = critique.score >= 4 ? "#22c55e" : critique.score >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dim.dot }} />
          <span className="text-sm font-semibold" style={{ color: dim.accent }}>{t(dim.labelKey)}</span>
        </div>
        <span className="text-xs" style={{ color: "var(--c-text-muted)" }}>
          {Math.round(critique.confidence * 100)}% {t("confidence")}
        </span>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--c-surface-2)" }}>
          <div style={{ width: `${pct}%`, background: barColor, height: "100%", borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
        <span className="text-xs font-mono font-bold tabular-nums w-6 text-right" style={{ color: "var(--c-text)" }}>
          {critique.score}/5
        </span>
      </div>

      {/* Issues */}
      {critique.issues.length > 0 ? (
        <div className="space-y-2">
          {critique.issues.map((issue, i) => (
            <div
              key={i}
              className="rounded-lg p-3 space-y-1.5"
              style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-border-sub)" }}
            >
              <div className="flex items-start gap-2">
                <blockquote className="flex-1 text-xs italic leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
                  &ldquo;{issue.quote}&rdquo;
                </blockquote>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: SEV_STYLE[issue.severity].bg,
                    color: SEV_STYLE[issue.severity].text,
                    border: `1px solid ${SEV_STYLE[issue.severity].border}`,
                  }}
                >
                  {t(SEV_KEYS[issue.severity])}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--c-text)" }}>{issue.problem}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs italic" style={{ color: "var(--c-text-subtle)" }}>{t("noIssues")}</p>
      )}

      {/* Reasoning */}
      <div>
        <button
          onClick={() => setShowReasoning((v) => !v)}
          className="text-xs transition-colors"
          style={{ color: "var(--c-text-muted)" }}
        >
          {showReasoning ? t("hideReasoning") : t("showReasoning")}
        </button>
        {showReasoning && (
          <p
            className="mt-2 rounded-lg p-3 text-xs leading-relaxed"
            style={{ background: "var(--c-surface-2)", color: "var(--c-text-muted)", border: "1px solid var(--c-border-sub)" }}
          >
            {critique.reasoning}
          </p>
        )}
      </div>
    </div>
  );
}
