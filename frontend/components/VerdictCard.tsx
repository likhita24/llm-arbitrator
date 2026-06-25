"use client";

import { ArbitrationResult } from "@/types";
import { useLang } from "@/contexts/LangContext";

const REC_KEYS = {
  approved:      { bg: "--c-ok-bg",   border: "--c-ok-border",   text: "--c-ok-text",   bar: "--c-ok-bar",   labelKey: "approved" },
  review_needed: { bg: "--c-warn-bg", border: "--c-warn-border", text: "--c-warn-text", bar: "--c-warn-bar", labelKey: "reviewNeeded" },
  rejected:      { bg: "--c-bad-bg",  border: "--c-bad-border",  text: "--c-bad-text",  bar: "--c-bad-bar",  labelKey: "rejected" },
} as const;

export default function VerdictCard({ result }: { result: ArbitrationResult }) {
  const { t } = useLang();
  const { verdict } = result;
  const cfg = REC_KEYS[verdict.recommendation];
  const score = Math.round(verdict.overall_score);

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: `var(${cfg.bg})`,
        border: `1px solid var(${cfg.border})`,
      }}
    >
      <div className="flex items-start gap-5">
        {/* Score ring */}
        <div
          className="shrink-0 flex flex-col items-center justify-center rounded-full w-20 h-20"
          style={{ border: `2px solid var(${cfg.bar})` }}
        >
          <span className="text-2xl font-black leading-none" style={{ color: `var(${cfg.bar})` }}>
            {score}
          </span>
          <span className="text-xs mt-0.5" style={{ color: "var(--c-text-muted)" }}>/100</span>
        </div>

        <div className="flex-1 space-y-2 pt-1">
          <span
            className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
            style={{ background: `var(${cfg.border})`, color: `var(${cfg.text})` }}
          >
            {t(cfg.labelKey)}
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "var(--c-text)" }}>
            {verdict.summary}
          </p>
        </div>
      </div>

      {verdict.key_issues.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--c-text-muted)" }}
          >
            {t("keyIssues")}
          </p>
          <ul className="space-y-1.5">
            {verdict.key_issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--c-text)" }}>
                <span className="shrink-0 mt-0.5" style={{ color: "var(--c-text-muted)" }}>→</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs"
        style={{ borderTop: "1px solid var(--c-border-sub)", color: "var(--c-text-muted)" }}
      >
        <span>{result.model_used}</span>
        <span>{result.duration_ms}ms</span>
        <span>{Math.round(verdict.confidence * 100)}% {t("confidence")}</span>
      </div>
    </div>
  );
}
