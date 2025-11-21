# 8px.app

A toolkit for streamlining web and UI development.
Features Tailwind CSS palette generation, high-precision image color extraction, SVG-compatible favicon generator, and SVG compression.
Eliminates the hassle between design and implementation.

## Project Structure

```
/
├── frontend/         # Next.js frontend
├── backend/          # FastAPI backend
└── ...
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 3
- **Backend**: FastAPI, Python 3.12, NumPy, Pillow

## Features

- **TW Palette Generator** - Automatically generate beautiful palettes that blend seamlessly with TailwindCSS color palettes, based on your specified colors like corporate colors. Smoothly integrates into your design system.
- **ImagePalette** - Extract color palettes from your favorite images. Uses perceptually accurate image analysis to capture your signature colors.
- **Favicon Generator** - Simply upload images (JPEG, PNG, WEBP) or SVG to generate all favicons and Apple Touch Icons needed for modern websites. Rounded corners and background color settings in one click.
- **SVG Optimizer** - Compress bloated SVG files while maintaining quality. A simple and reliable optimization tool for improving website performance.

## Getting Started

### Quick Start (Docker Compose - Recommended)

```bash
# Setup environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start development environment
./run-dev.sh
```

Visit:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>

### Manual Setup

#### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

#### Backend

```bash
cd backend
cp .env.example .env
python3.12 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
uvicorn src.app.main:app --reload
```

## Development

### Docker Compose (Recommended)

- Start: `./run-dev.sh`
- View logs: `docker compose logs -f`
- Stop: `docker compose down`

### Manual

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && source venv/bin/activate && uvicorn src.app.main:app --reload`

### Code Quality

- Frontend lint: `cd frontend && npm run lint`
- Frontend type check: `cd frontend && npm run type-check`
- Backend lint: `cd backend && source venv/bin/activate && ruff check src/`
- Backend type check: `cd backend && source venv/bin/activate && mypy src/`

## License

AGPL-3.0
