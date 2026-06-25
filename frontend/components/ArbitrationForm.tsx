"use client";

import { useState } from "react";
import { useLang } from "@/contexts/LangContext";

interface Props {
  onSubmit: (inputText: string, originalQuestion: string, useLocal: boolean) => void;
  loading: boolean;
}

export default function ArbitrationForm({ onSubmit, loading }: Props) {
  const { t } = useLang();
  const [inputText, setInputText] = useState("");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [useLocal, setUseLocal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText, originalQuestion, useLocal);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Main text input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: "var(--c-text)" }}>
          {t("inputLabel")}
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={7}
          required
          className="arb-input"
          style={{ resize: "none" }}
        />
      </div>

      {/* Optional question */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: "var(--c-text)" }}>
          {t("questionLabel")}{" "}
          <span className="font-normal" style={{ color: "var(--c-text-muted)" }}>
            {t("questionHint")}
          </span>
        </label>
        <input
          type="text"
          value={originalQuestion}
          onChange={(e) => setOriginalQuestion(e.target.value)}
          placeholder={t("questionPlaceholder")}
          className="arb-input"
        />
      </div>

      {/* Model selector */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}
      >
        <div className="space-y-0.5">
          <p className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
            {useLocal ? t("modelLocal") : t("modelCloud")}
          </p>
          <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
            {useLocal ? t("modelLocalDesc") : t("modelCloudDesc")}
          </p>
        </div>
        {/* Toggle — inline styles to avoid Tailwind class conflicts */}
        <button
          type="button"
          role="switch"
          aria-checked={useLocal}
          onClick={() => setUseLocal((v) => !v)}
          style={{
            width: 44, height: 24, borderRadius: 12,
            background: useLocal ? "var(--c-primary)" : "var(--c-border)",
            position: "relative", border: "none", cursor: "pointer",
            transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute", top: 3,
              left: useLocal ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
            }}
          />
        </button>
      </div>

      <button type="submit" disabled={loading || !inputText.trim()} className="btn-primary">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("submitting")}
          </span>
        ) : t("submitBtn")}
      </button>
    </form>
  );
}
