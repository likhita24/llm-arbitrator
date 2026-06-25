from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings
from app.models.schemas import CritiqueData, CritiqueOutput

# Each prompt tells the critic exactly what dimension to evaluate.
# Keeping prompts focused = better structured outputs from smaller models.
CRITIC_PROMPTS = {
    "accuracy": """\
You are a Factual Accuracy Critic. Evaluate ONLY factual accuracy of the AI response below.

Check for:
- Claims that are factually wrong or unverifiable
- Hallucinated statistics, dates, names, or references
- Internal contradictions within the text

Original question: {original_question}
Text to evaluate:
{input_text}

Quote the exact problematic text in your issues. If there are no issues, return an empty list.""",

    "logic": """\
You are a Logical Consistency Critic. Evaluate ONLY the logical reasoning of the AI response below.

Check for:
- Conclusions that do not follow from stated premises
- Missing reasoning steps (logical gaps)
- Circular arguments
- Contradictory conclusions within the response

Original question: {original_question}
Text to evaluate:
{input_text}

Quote the exact problematic text in your issues. If there are no issues, return an empty list.""",

    "completeness": """\
You are a Completeness Critic. Evaluate ONLY whether the AI response fully addresses the question.

Check for:
- Parts of the question that were not addressed
- Important caveats or nuances omitted
- Incomplete explanations (started but not finished)
- Critical edge cases the response ignores

Original question: {original_question}
Text to evaluate:
{input_text}

Be specific about what is missing. If nothing is missing, return an empty list.""",
}


def get_critic_llm(use_local: bool):
    if use_local:
        return ChatOllama(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=0,
        )
    return ChatAnthropic(
        model=settings.critic_model_cloud,
        api_key=settings.anthropic_api_key,
        temperature=0,
    )


def get_synthesizer_llm(use_local: bool):
    if use_local:
        return ChatOllama(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=0,
        )
    return ChatAnthropic(
        model=settings.synthesizer_model_cloud,
        api_key=settings.anthropic_api_key,
        temperature=0,
    )


async def run_critic(critic_input: dict) -> dict:
    """
    LangGraph node function. Called 3 times in parallel via Send().
    Each call gets a different critic_type.

    Returns {"critiques": [CritiqueOutput]} — the Annotated list reducer
    in ArbitrationState concatenates these across the three parallel calls.
    """
    critic_type: str = critic_input["critic_type"]  # "accuracy" | "logic" | "completeness"
    use_local: bool = critic_input.get("use_local", False)

    try:
        llm = get_critic_llm(use_local)
        # with_structured_output forces the LLM to return JSON matching CritiqueData
        structured_llm = llm.with_structured_output(CritiqueData)

        prompt = ChatPromptTemplate.from_messages([
            ("system", CRITIC_PROMPTS[critic_type]),
            ("human", "Provide your structured critique now."),
        ])

        chain = prompt | structured_llm
        critique_data: CritiqueData = await chain.ainvoke({
            "input_text": critic_input["input_text"],
            "original_question": critic_input.get("original_question") or "No specific question provided",
        })

        critique = CritiqueOutput(
            dimension=critic_type,
            score=critique_data.score,
            issues=critique_data.issues,
            confidence=critique_data.confidence,
            reasoning=critique_data.reasoning,
        )

    except Exception as e:
        # Resilient fallback: one critic failing won't break the whole arbitration
        critique = CritiqueOutput(
            dimension=critic_type,
            score=3,
            issues=[],
            confidence=0.0,
            reasoning=f"Critic could not complete evaluation: {str(e)}",
        )

    return {"critiques": [critique]}
