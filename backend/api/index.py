"""Vercel serverless function entry point."""

import sys
from pathlib import Path

# Add src/app to Python path for Vercel
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from app.main import app  # noqa: F401, E402
