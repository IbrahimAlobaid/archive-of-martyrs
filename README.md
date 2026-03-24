# Martyrs Archive

منصة تذكارية عربية (RTL) مخصصة لشهداء القرى والبلدات في **ريف حلب الجنوبي**، مع واجهة عامة سريعة ولوحة إدارة آمنة.

## Project Overview

- **Public app (Next.js):** الصفحة الرئيسية، قائمة الشهداء، صفحة الشهيد، صفحة عن المنصة، صفحة إرسال تصحيح.
- **Admin app (Next.js /admin):** تسجيل دخول JWT، إدارة الشهداء، إدارة القرى والبلدات، مراجعة التصحيحات.
- **Backend API (FastAPI):** بنية معيارية (routers/services/repositories/schemas)، JWT auth، Cloudinary uploads، OpenAPI.
- **Database (PostgreSQL):** نماذج Martyr / Village / GalleryImage / Submission / AdminUser.

## Architecture

```
frontend (Next.js App Router)
  -> calls backend REST API
backend (FastAPI)
  -> services layer
  -> repositories layer
  -> SQLAlchemy async
  -> PostgreSQL
  -> Cloudinary (media)
```

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, SQLAlchemy 2.0 async
- DB: PostgreSQL
- Migrations: Alembic
- Auth: JWT (python-jose + passlib/bcrypt)
- Media: Cloudinary
- Testing: pytest (backend) + Vitest (frontend basic)
- Lint/format: ESLint + Prettier (frontend), Ruff + Black (backend)
- Containerization: Docker + docker-compose

## Repository Structure

```
.
├─ frontend/
├─ backend/
├─ docker-compose.yml
└─ README.md
```

## Environment Variables

### Backend (`backend/.env`)

ابدأ بنسخ `backend/.env.example` إلى `backend/.env` ثم عدّل القيم:

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

ابدأ بنسخ `frontend/.env.example` إلى `frontend/.env`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `BACKEND_INTERNAL_API_URL`
- `NEXT_PUBLIC_MEDIA_BASE_URL`

## Run With Docker

1. تأكد من وجود Docker و Docker Compose.
2. (اختياري) أنشئ ملف `.env` في الجذر إذا أردت override للمتغيرات.
3. شغّل الخدمات:

```bash
docker compose up --build
```

4. الروابط:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - OpenAPI docs: `http://localhost:8000/docs` و `http://localhost:8000/redoc`

5. نفّذ المايجريشن والـ seed داخل الحاويات:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.scripts.seed
```

## DB Migrations

داخل مجلد `backend/`:

```bash
alembic upgrade head
```

للإنشاء Migration جديدة:

```bash
alembic revision --autogenerate -m "your message"
alembic upgrade head
```

## Seed Data

بعد تنفيذ migrations:

```bash
python -m app.scripts.seed
```

سيتم إنشاء:

- مستخدم إدارة افتراضي من قيم `ADMIN_USERNAME` و `ADMIN_PASSWORD`
- قرى وبلدات تجريبية من ريف حلب الجنوبي
- سجلات شهداء تجريبية مع صور placeholder

## Running Frontend and Backend Separately

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

- افتح: `http://localhost:3000/admin/login`
- استخدم بيانات الإدارة من `backend/.env`:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`

## Cloudinary Configuration

1. أنشئ حساب Cloudinary.
2. من لوحة Cloudinary انسخ:
   - Cloud name
   - API key
   - API secret
3. ضع القيم في `backend/.env`.
4. عند رفع/استبدال الصور:
   - يتم تخزين `secure_url` و `public_id` في قاعدة البيانات.
   - يتم حذف الصورة القديمة من Cloudinary عند الاستبدال أو الحذف.

### Local Upload Fallback (بدون Cloudinary)

- إذا كانت قيم Cloudinary فارغة، سيعمل النظام تلقائيًا بوضع **رفع محلي**.
- تُحفَظ الصور داخل `backend/media/` وتُخدَّم عبر المسار `/media` من الـ API.
- المتغيرات المرتبطة:
  - `MEDIA_BASE_URL` (مثل `http://localhost:8000`)
  - `LOCAL_MEDIA_DIR` (افتراضيًا `media`)

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

هذا المشروع مُعد كقاعدة إنتاجية قابلة للتوسعة، مع مراعاة الطابع الإنساني الهادئ، والوضوح، والاحترام.
