import json

from langchain_core.prompts import ChatPromptTemplate

from app.agents.critics import get_synthesizer_llm
from app.models.schemas import VerdictOutput

SYNTHESIZER_PROMPT = """\
You are a Verdict Synthesizer. Three specialized AI critics have evaluated an LLM response:
1. Factual Accuracy Critic
2. Logical Consistency Critic
3. Completeness Critic

Here are their critiques:
{critiques_json}

Synthesize these into a final verdict:
- overall_score (0-100): weighted quality score. Severity of issues should reduce this significantly.
  Rough guide: 0 issues = 85-100, minor issues = 65-84, moderate issues = 45-64, major issues = 0-44.
- confidence (0-1): your confidence in this verdict
- summary: 2-3 sentences summarizing the main findings
- key_issues: list of the top 3 most important issues across all critics (empty list if none)
- recommendation:
    "approved"       → overall_score >= 75 (safe to use)
    "review_needed"  → overall_score 45-74 (use with caution)
    "rejected"       → overall_score < 45  (do not use without correction)"""


async def run_synthesizer(state: dict) -> dict:
    """
    LangGraph node. Runs after all 3 critics have completed.
    Receives the full ArbitrationState with critiques list populated.
    """
    critiques = state["critiques"]
    use_local = state.get("use_local", False)

    llm = get_synthesizer_llm(use_local)
    structured_llm = llm.with_structured_output(VerdictOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYNTHESIZER_PROMPT),
        ("human", "Provide the synthesized verdict now."),
    ])

    chain = prompt | structured_llm

    critiques_json = json.dumps(
        [c.model_dump() for c in critiques],
        indent=2,
    )

    verdict: VerdictOutput = await chain.ainvoke({"critiques_json": critiques_json})

    return {"verdict": verdict}
