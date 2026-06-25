from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # API Keys
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Ollama (local models)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"

    # Cloud model config
    # Critics use cheaper/faster model; synthesizer uses smarter model
    critic_model_cloud: str = "claude-haiku-4-5-20251001"
    synthesizer_model_cloud: str = "claude-sonnet-4-6"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/arbitrator"

    # Store as plain string — pydantic-settings v2 tries to JSON-decode List[str]
    # fields before validators run, which breaks "http://localhost:3000" (not valid JSON).
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
