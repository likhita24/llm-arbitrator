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

# Document that the app listens on port 8000
EXPOSE 8000

# Start the FastAPI app with uvicorn
# --host 0.0.0.0 = accept connections from outside the container (required in Docker)
# --port 8000 = match EXPOSE above
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
