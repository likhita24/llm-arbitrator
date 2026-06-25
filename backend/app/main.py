import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import ArbitrationRecord, get_db, init_db
from app.graph.arbitration import arbitration_graph
from app.models.schemas import (
    ArbitrateRequest,
    ArbitrationResult,
    ArbitrationSummary,
    CritiqueOutput,
    VerdictOutput,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup if they don't exist
    await init_db()
    yield


app = FastAPI(title="LLM Arbitrator API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "critic_model": settings.critic_model_cloud,
        "synthesizer_model": settings.synthesizer_model_cloud,
        "ollama_model": settings.ollama_model,
    }


@app.post("/api/arbitrate", response_model=ArbitrationResult)
async def arbitrate(request: ArbitrateRequest, db: AsyncSession = Depends(get_db)):
    start_time = time.time()

    result = await arbitration_graph.ainvoke({
        "input_text": request.input_text,
        "original_question": request.original_question or "",
        "use_local": request.use_local,
        "critiques": [],
        "verdict": None,
    })

    duration_ms = int((time.time() - start_time) * 1000)
    model_used = (
        f"ollama/{settings.ollama_model}"
        if request.use_local
        else f"anthropic/{settings.critic_model_cloud}+{settings.synthesizer_model_cloud}"
    )

    record = ArbitrationRecord(
        input_text=request.input_text,
        original_question=request.original_question,
        verdict=result["verdict"].model_dump(),
        critiques=[c.model_dump() for c in result["critiques"]],
        model_used=model_used,
        duration_ms=duration_ms,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return ArbitrationResult(
        id=str(record.id),
        input_text=record.input_text,
        original_question=record.original_question,
        verdict=result["verdict"],
        critiques=result["critiques"],
        model_used=model_used,
        duration_ms=duration_ms,
        created_at=record.created_at,
    )


@app.get("/api/arbitrations", response_model=list[ArbitrationSummary])
async def list_arbitrations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ArbitrationRecord)
        .order_by(desc(ArbitrationRecord.created_at))
        .limit(50)
    )
    records = result.scalars().all()
    return [
        ArbitrationSummary(
            id=str(r.id),
            input_text_preview=r.input_text[:120] + "..." if len(r.input_text) > 120 else r.input_text,
            overall_score=r.verdict["overall_score"],
            recommendation=r.verdict["recommendation"],
            model_used=r.model_used,
            created_at=r.created_at,
        )
        for r in records
    ]


@app.get("/api/arbitrations/{arbitration_id}", response_model=ArbitrationResult)
async def get_arbitration(arbitration_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ArbitrationRecord).where(ArbitrationRecord.id == arbitration_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Arbitration not found")

    return ArbitrationResult(
        id=str(record.id),
        input_text=record.input_text,
        original_question=record.original_question,
        verdict=VerdictOutput(**record.verdict),
        critiques=[CritiqueOutput(**c) for c in record.critiques],
        model_used=record.model_used,
        duration_ms=record.duration_ms,
        created_at=record.created_at,
    )
