# Stage 1: Use official Python 3.11 minimal image
FROM python:3.11-slim

WORKDIR /app

# Install system packages needed to compile asyncpg (PostgreSQL C extensions)
# gcc = C compiler, libpq-dev = PostgreSQL client headers
# Clean up apt cache after install to keep image size small
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first — Docker caches this layer separately
# If only your code changes (not requirements), Docker skips pip install on rebuild
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application code
COPY . .

EXPOSE 8000

# Railway sets $PORT dynamically; fall back to 8000 for local Docker
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
