import { ArbitrationResult, ArbitrationSummary } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function arbitrate(
  inputText: string,
  originalQuestion: string,
  useLocal: boolean
): Promise<ArbitrationResult> {
  const res = await fetch(`${API_URL}/api/arbitrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input_text: inputText,
      original_question: originalQuestion || null,
      use_local: useLocal,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Arbitration request failed");
  }
  return res.json();
}

export async function getArbitrations(): Promise<ArbitrationSummary[]> {
  const res = await fetch(`${API_URL}/api/arbitrations`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function getArbitration(id: string): Promise<ArbitrationResult> {
  const res = await fetch(`${API_URL}/api/arbitrations/${id}`);
  if (!res.ok) throw new Error("Arbitration not found");
  return res.json();
}
