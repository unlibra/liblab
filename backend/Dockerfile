FROM python:3.12-slim

WORKDIR /app

# Copy source code first (needed for installation)
COPY . .

# Install only runtime dependencies (not dev tools like mypy/ruff)
RUN pip install --no-cache-dir "."

# Expose port
EXPOSE 8000

# Run without reload for production
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
