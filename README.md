# Martyrs Archive

Martyrs Archive is an Arabic-first (RTL) memorial platform dedicated to preserving the memory of martyrs from the villages and towns of the **Southern Aleppo countryside**.

The project is designed with a calm, respectful tone and production-oriented architecture.

## Project Overview

- **Public app (Next.js):** home page, martyrs listing, martyr profile page, about page, and correction/contact form.
- **Admin app (`/admin`):** JWT login, martyr management, village/town management, and submission review.
- **Backend API (FastAPI):** modular routers, schemas, services, repositories, JWT auth, OpenAPI docs.
- **Database (PostgreSQL):** `Martyr`, `Village`, `GalleryImage`, `Submission`, and `AdminUser` models.

## Architecture

```txt
frontend (Next.js App Router)
  -> consumes backend REST API
backend (FastAPI)
  -> service layer
  -> repository layer
  -> SQLAlchemy async
  -> PostgreSQL
  -> Cloudinary or local media fallback
```

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, SQLAlchemy 2.0 async
- Database: PostgreSQL
- Migrations: Alembic
- Auth: JWT (`python-jose` + `passlib/bcrypt`)
- Media: Cloudinary (with local fallback)
- Testing: pytest (backend), Vitest (frontend basic)
- Lint/format: ESLint + Prettier (frontend), Ruff + Black (backend)
- Containerization: Docker + Docker Compose

## Repository Structure

```txt
.
├─ frontend/
├─ backend/
├─ docker-compose.yml
└─ README.md
```

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`, then set values as needed:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `MEDIA_BASE_URL`
- `LOCAL_MEDIA_DIR`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `BACKEND_INTERNAL_API_URL`
- `NEXT_PUBLIC_MEDIA_BASE_URL`

## Run with Docker

1. Make sure Docker and Docker Compose are installed.
2. (Optional) create a root `.env` file if you want to override compose defaults.
3. Start services:

```bash
docker compose up --build
```

4. Access URLs:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - OpenAPI docs: `http://localhost:8000/docs` and `http://localhost:8000/redoc`

5. Run migrations and seed data inside containers:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.scripts.seed
```

## Database Migrations

From the `backend/` directory:

```bash
alembic upgrade head
```

Create and apply a new migration:

```bash
alembic revision --autogenerate -m "your message"
alembic upgrade head
```

## Seed Data

After migrations:

```bash
python -m app.scripts.seed
```

This creates:

- default admin user from `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- demo villages/towns from Southern Aleppo countryside
- demo martyr profiles with placeholder images

## Run Frontend and Backend Separately

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app.scripts.seed
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Admin Login

- Open: `http://localhost:3000/admin/login`
- Use credentials from `backend/.env`:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`

## Media Configuration

### Cloudinary

1. Create a Cloudinary account.
2. Copy these values from Cloudinary:
   - Cloud name
   - API key
   - API secret
3. Add them to `backend/.env`.
4. On upload/replace, the app stores `secure_url` and `public_id` in the database and deletes old media when removed.

### Local Upload Fallback (No Cloudinary)

If Cloudinary variables are empty, the app automatically uses local storage:

- files are saved to `backend/media/`
- files are served by the backend under `/media`
- related env vars:
  - `MEDIA_BASE_URL` (example: `http://localhost:8000`)
  - `LOCAL_MEDIA_DIR` (default: `media`)

## Key API Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/health`
- `GET /api/v1/martyrs`
- `GET /api/v1/martyrs/{slug}`
- `POST /api/v1/martyrs`
- `PATCH /api/v1/martyrs/{id}`
- `DELETE /api/v1/martyrs/{id}`
- `POST /api/v1/martyrs/{id}/gallery`
- `DELETE /api/v1/martyrs/{id}/gallery/{image_id}`
- `GET /api/v1/villages`
- `POST /api/v1/villages`
- `GET /api/v1/submissions`
- `POST /api/v1/submissions`
- `PATCH /api/v1/submissions/{id}/review`

## Testing and Quality

### Backend

```bash
cd backend
pytest
ruff check .
black --check .
```

### Frontend

```bash
cd frontend
npm run test
npm run lint
```

---

This project is structured as a scalable production base, while preserving a respectful memorial tone, clear UX, and reliable moderation workflows.
