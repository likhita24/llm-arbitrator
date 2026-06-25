"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArbitrations } from "@/lib/api";
import { ArbitrationSummary } from "@/types";
import { useLang } from "@/contexts/LangContext";

const REC_STYLE = {
  approved:      { bg: "var(--c-ok-bg)",   border: "var(--c-ok-border)",   color: "var(--c-ok-text)",   bar: "var(--c-ok-bar)" },
  review_needed: { bg: "var(--c-warn-bg)", border: "var(--c-warn-border)", color: "var(--c-warn-text)", bar: "var(--c-warn-bar)" },
  rejected:      { bg: "var(--c-bad-bg)",  border: "var(--c-bad-border)",  color: "var(--c-bad-text)",  bar: "var(--c-bad-bar)" },
};

export default function HistoryPage() {
  const { t } = useLang();
  const [records, setRecords] = useState<ArbitrationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArbitrations()
      .then(setRecords)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const recStyle = (rec: string) => REC_STYLE[rec as keyof typeof REC_STYLE] ?? REC_STYLE.review_needed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>
          {t("historyTitle")}
        </h1>
        <Link href="/" className="text-sm transition-colors" style={{ color: "var(--c-primary)" }}>
          {t("newArbitration")}
        </Link>
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>{t("loading")}</p>}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--c-bad-bg)", border: "1px solid var(--c-bad-border)", color: "var(--c-bad-text)" }}>
          {error}
        </div>
      )}

      {!loading && records.length === 0 && !error && (
        <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>{t("noHistory")}</p>
      )}

      <div className="space-y-2">
        {records.map((r) => {
          const s = recStyle(r.recommendation);
          return (
            <Link
              key={r.id}
              href={`/?id=${r.id}`}
              className="block rounded-xl p-4 transition-colors"
              style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="flex-1 text-sm line-clamp-2" style={{ color: "var(--c-text)" }}>
                  {r.input_text_preview}
                </p>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-lg font-bold font-mono" style={{ color: s.bar }}>
                    {Math.round(r.overall_score)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                  >
                    {r.recommendation.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                <span>{r.model_used}</span>
                <span>·</span>
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
