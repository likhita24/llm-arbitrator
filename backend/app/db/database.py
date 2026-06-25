import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ArbitrationRecord(Base):
    __tablename__ = "arbitrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    input_text = Column(Text, nullable=False)
    original_question = Column(Text, nullable=True)
    # JSONB lets us store the full nested verdict + critiques without extra tables
    verdict = Column(JSON, nullable=False)
    critiques = Column(JSON, nullable=False)
    model_used = Column(String(150))
    duration_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
