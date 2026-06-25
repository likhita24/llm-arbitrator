"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ja";

const T = {
  en: {
    appTitle: "LLM Arbitrator",
    subtitle: "Three specialized AI critics evaluate any LLM response in parallel, then a synthesizer produces a confidence-scored verdict.",
    inputLabel: "LLM-Generated Text to Evaluate",
    inputPlaceholder: "Paste any AI-generated response here…",
    questionLabel: "Original Question",
    questionHint: "(optional — improves completeness evaluation)",
    questionPlaceholder: "What was the prompt that generated the text above?",
    modelCloud: "Cloud — Claude",
    modelCloudDesc: "Claude Haiku for critics · Sonnet for synthesis",
    modelLocal: "Local — Ollama",
    modelLocalDesc: "llama3.1 via Ollama · free · private · slower",
    submitBtn: "Arbitrate →",
    submitting: "Running 3 critics in parallel…",
    verdictSection: "Verdict",
    criticSection: "Critic Reports",
    approved: "Approved",
    reviewNeeded: "Review Needed",
    rejected: "Rejected",
    keyIssues: "Key Issues",
    noIssues: "No issues found.",
    showReasoning: "Show reasoning ▼",
    hideReasoning: "Hide reasoning ▲",
    confidence: "confidence",
    history: "History",
    newArbitration: "← New",
    historyTitle: "Arbitration History",
    noHistory: "No arbitrations yet. Run one from the home page.",
    loading: "Loading…",
    accuracy: "Factual Accuracy",
    logic: "Logical Consistency",
    completeness: "Completeness",
    synthesizer: "Synthesizer",
    sev_low: "low",
    sev_medium: "medium",
    sev_high: "high",
    errorFallback: "Arbitration failed — is the backend running?",
  },
  ja: {
    appTitle: "LLM 審判官",
    subtitle: "3つの専門AIが並列でLLM生成テキストを評価し、信頼スコア付きの総合判定を出力します。",
    inputLabel: "評価するLLM生成テキスト",
    inputPlaceholder: "AI生成テキストをここに貼り付けてください…",
    questionLabel: "元の質問",
    questionHint: "（任意 — 完全性評価の精度が向上します）",
    questionPlaceholder: "テキストを生成したプロンプトを入力してください",
    modelCloud: "クラウド — Claude",
    modelCloudDesc: "Haiku（評価）· Sonnet（統合）",
    modelLocal: "ローカル — Ollama",
    modelLocalDesc: "llama3.1（Ollama）· 無料 · プライベート · 低速",
    submitBtn: "評価する →",
    submitting: "3つの評価者が並列実行中…",
    verdictSection: "判定",
    criticSection: "評価レポート",
    approved: "承認",
    reviewNeeded: "要確認",
    rejected: "不合格",
    keyIssues: "主な問題点",
    noIssues: "問題は見つかりませんでした。",
    showReasoning: "推論を表示 ▼",
    hideReasoning: "推論を非表示 ▲",
    confidence: "信頼度",
    history: "履歴",
    newArbitration: "← 戻る",
    historyTitle: "評価履歴",
    noHistory: "まだ評価がありません。ホームページから実行してください。",
    loading: "読み込み中…",
    accuracy: "事実の正確性",
    logic: "論理的一貫性",
    completeness: "完全性",
    synthesizer: "統合器",
    sev_low: "低",
    sev_medium: "中",
    sev_high: "高",
    errorFallback: "評価に失敗しました — バックエンドは起動していますか？",
  },
} as const;

export type TKey = keyof (typeof T)["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
}

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => T.en[k] });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "ja") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: (k) => T[lang][k] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
