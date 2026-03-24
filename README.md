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

- `APP_ENV` (`development` locally, `production` on Render)
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ALLOW_LOCAL_MEDIA_FALLBACK`
- `MEDIA_BASE_URL`
- `LOCAL_MEDIA_DIR`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Notes:

- `DATABASE_URL` accepts Neon connection strings. Plain `postgresql://` values are normalized to `postgresql+asyncpg://` automatically.
- In deployed environments (`APP_ENV=production`), set `ALLOW_LOCAL_MEDIA_FALLBACK=false` so Cloudinary is the primary media backend.

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `BACKEND_INTERNAL_API_URL`
- `NEXT_PUBLIC_MEDIA_BASE_URL`

Notes:

- On Vercel, `NEXT_PUBLIC_API_BASE_URL` must point to your public Render backend URL (for example, `https://your-api.onrender.com/api/v1`).
- `BACKEND_INTERNAL_API_URL` is optional and intended for local Docker networking.

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

## Production Deployment (Vercel + Render + Neon + Cloudinary)

### 1) Backend on Render

This repository includes `render.yaml` for the API service.

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/v1/health`

Required Render environment variables:

- `APP_ENV=production`
- `DATABASE_URL=<your Neon connection string>`
- `JWT_SECRET_KEY=<strong-random-secret>`
- `CORS_ORIGINS=https://<your-vercel-domain>`
- `CLOUDINARY_CLOUD_NAME=<cloud name>`
- `CLOUDINARY_API_KEY=<api key>`
- `CLOUDINARY_API_SECRET=<api secret>`
- `CLOUDINARY_FOLDER=martyrs-archive`
- `ALLOW_LOCAL_MEDIA_FALLBACK=false`
- `MEDIA_BASE_URL=https://<your-render-domain>`
- `ADMIN_USERNAME=<admin username>`
- `ADMIN_PASSWORD=<admin password>`

After first deploy, run migrations:

```bash
alembic upgrade head
```

Then run seed (optional but recommended for initial admin account):

```bash
python -m app.scripts.seed
```

### 2) Database on Neon

- Create a Neon PostgreSQL project.
- Copy the connection string into Render `DATABASE_URL`.
- SSL is required by Neon and is handled automatically.

### 3) Frontend on Vercel

- Create a Vercel project from this repository.
- Set **Root Directory** to `frontend`.
- Add environment variables in Vercel:

  - `NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>`
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-render-domain>/api/v1`
  - `NEXT_PUBLIC_MEDIA_BASE_URL=https://res.cloudinary.com`

- Leave `BACKEND_INTERNAL_API_URL` unset on Vercel unless you have a private/internal API route.

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
4. In production (`APP_ENV=production`), Cloudinary should be configured and local media fallback disabled.
5. On upload/replace, the app stores `secure_url` and `public_id` in the database and deletes old media when removed.

### Local Upload Fallback (No Cloudinary)

If Cloudinary variables are empty, the app automatically uses local storage:

- files are saved to `backend/media/`
- files are served by the backend under `/media`
- related env vars:
  - `MEDIA_BASE_URL` (example: `http://localhost:8000`)
  - `LOCAL_MEDIA_DIR` (default: `media`)

For production deployments, keep this disabled with:

- `APP_ENV=production`
- `ALLOW_LOCAL_MEDIA_FALLBACK=false`

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
