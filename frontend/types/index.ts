export interface Issue {
  quote: string;
  problem: string;
  severity: "low" | "medium" | "high";
}

export interface CritiqueOutput {
  dimension: "accuracy" | "logic" | "completeness";
  score: number; // 1–5
  issues: Issue[];
  confidence: number; // 0–1
  reasoning: string;
}

export interface VerdictOutput {
  overall_score: number; // 0–100
  confidence: number; // 0–1
  summary: string;
  key_issues: string[];
  recommendation: "approved" | "review_needed" | "rejected";
}

export interface ArbitrationResult {
  id: string;
  input_text: string;
  original_question: string | null;
  verdict: VerdictOutput;
  critiques: CritiqueOutput[];
  model_used: string;
  duration_ms: number;
  created_at: string;
}

export interface ArbitrationSummary {
  id: string;
  input_text_preview: string;
  overall_score: number;
  recommendation: string;
  model_used: string;
  created_at: string;
}
