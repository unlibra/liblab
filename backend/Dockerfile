FROM python:3.12-slim

WORKDIR /app

# Copy source code first (needed for installation)
COPY . .

# Install dependencies (remove -e flag as source is already copied)
RUN pip install --no-cache-dir ".[dev]"

# Expose port
EXPOSE 8000

# Run with hot reload
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
