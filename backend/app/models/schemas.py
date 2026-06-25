from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class Issue(BaseModel):
    quote: str = Field(description="The exact text from the response that is problematic")
    problem: str = Field(description="What is wrong with this part")
    severity: Literal["low", "medium", "high"] = Field(description="How serious this issue is")


# Used for structured LLM output — no dimension field so the LLM doesn't have to guess it
class CritiqueData(BaseModel):
    score: int = Field(ge=1, le=5, description="Quality score: 1=very poor, 3=acceptable, 5=excellent")
    issues: List[Issue] = Field(default_factory=list, description="Specific issues found. Empty list if none.")
    confidence: float = Field(ge=0.0, le=1.0, description="Your confidence in this critique (0 to 1)")
    reasoning: str = Field(description="1-2 sentence explanation of your score")


# Full critique with dimension label — stored in DB and returned in API responses
class CritiqueOutput(BaseModel):
    dimension: Literal["accuracy", "logic", "completeness"]
    score: int = Field(ge=1, le=5)
    issues: List[Issue]
    confidence: float
    reasoning: str


class VerdictOutput(BaseModel):
    overall_score: float = Field(ge=0, le=100, description="Overall quality 0-100")
    confidence: float = Field(ge=0, le=1)
    summary: str = Field(description="2-3 sentence summary of the verdict")
    key_issues: List[str] = Field(description="Top 3 most important issues across all critics")
    recommendation: Literal["approved", "review_needed", "rejected"]


class ArbitrateRequest(BaseModel):
    input_text: str = Field(min_length=10, description="The LLM-generated text to arbitrate")
    original_question: Optional[str] = Field(None, description="The original prompt that generated the text")
    use_local: bool = Field(False, description="True = Ollama (free/private), False = Claude (cloud)")


class ArbitrationResult(BaseModel):
    id: str
    input_text: str
    original_question: Optional[str]
    verdict: VerdictOutput
    critiques: List[CritiqueOutput]
    model_used: str
    duration_ms: int
    created_at: datetime


class ArbitrationSummary(BaseModel):
    id: str
    input_text_preview: str
    overall_score: float
    recommendation: str
    model_used: str
    created_at: datetime
