# Pile Tracker

PDF markup application for construction project managers to track foundation pile status.

## Features

- Upload and view PDF foundation plans
- Place color-coded pile markers on plans
- Track pile attributes (installed, date, NCR, repairs, etc.)
- Export annotated PDFs with markers

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, PyMuPDF
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Project Structure

```
pile-tracker/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities and Supabase clients
│   │   └── types/     # TypeScript types
│   └── package.json
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── services/  # Business logic
│   │   └── core/      # Configuration
│   └── requirements.txt
└── supabase/          # Database migrations
    └── migrations/
```

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to Storage and create a bucket named `plans` (set as private)
4. Add the storage policies mentioned in the SQL file
5. Copy your project URL and keys from Settings > API

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=your-project-url
# SUPABASE_SERVICE_KEY=your-service-role-key

# Start development server
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

## Usage

1. Open http://localhost:3000
2. Sign up with email/password
3. Upload a PDF foundation plan
4. Click "Add Pile" to enter placement mode
5. Click on the PDF to place a pile marker
6. Select a color for the marker
7. Edit pile attributes in the right panel
8. Export the annotated PDF when done

## API Endpoints

### Frontend (Next.js API Routes)
- `POST /api/auth/callback` - Supabase auth callback
- Database operations use Supabase client directly

### Backend (FastAPI)
- `GET /health` - Health check
- `POST /pdf/export/{plan_id}` - Export annotated PDF
- `GET /pdf/info/{plan_id}` - Get PDF information

## Development

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend - use Docker or deploy to Railway/Render
```

## License

MIT
