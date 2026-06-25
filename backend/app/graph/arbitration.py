import operator
from typing import Annotated, List, Optional, TypedDict

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from app.agents.critics import run_critic
from app.agents.synthesizer import run_synthesizer
from app.models.schemas import CritiqueOutput, VerdictOutput


class ArbitrationState(TypedDict):
    input_text: str
    original_question: str
    use_local: bool
    # Annotated with operator.add means LangGraph concatenates lists from parallel branches
    # When critic A returns {"critiques": [c1]} and critic B returns {"critiques": [c2]},
    # the merged state becomes critiques: [c1, c2]
    critiques: Annotated[List[CritiqueOutput], operator.add]
    verdict: Optional[VerdictOutput]


def route_to_critics(state: ArbitrationState) -> list:
    """
    Fan-out: dispatch all 3 critics simultaneously via Send().
    LangGraph runs all three in parallel and merges results before
    moving to the synthesizer.
    """
    base = {
        "input_text": state["input_text"],
        "original_question": state["original_question"],
        "use_local": state["use_local"],
    }
    return [
        Send("run_critic", {**base, "critic_type": "accuracy"}),
        Send("run_critic", {**base, "critic_type": "logic"}),
        Send("run_critic", {**base, "critic_type": "completeness"}),
    ]


def build_graph() -> StateGraph:
    builder = StateGraph(ArbitrationState)

    builder.add_node("run_critic", run_critic)
    builder.add_node("run_synthesizer", run_synthesizer)

    # START → fan out to 3 parallel run_critic nodes
    builder.add_conditional_edges(START, route_to_critics, ["run_critic"])
    # All 3 critics must finish before synthesizer runs (LangGraph barrier)
    builder.add_edge("run_critic", "run_synthesizer")
    builder.add_edge("run_synthesizer", END)

    return builder.compile()


# Module-level singleton — compiled once at startup
arbitration_graph = build_graph()
