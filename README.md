# PYQwithMe

PYQwithMe is a full-stack previous year question paper platform. Students can search, view, download, and upload papers without creating an account. A single admin account reviews every upload before it appears publicly.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Redux Toolkit, React Router DOM
- Backend: Node.js, Express.js, MongoDB, Mongoose
- File storage: Cloudinary raw PDF uploads
- Auth: JWT-based admin-only authentication
- Deployment: Vercel frontend, Render backend, MongoDB Atlas database, Cloudinary files

## Folder Structure

```text
PYQwithMe/
  backend/
    src/
      config/            MongoDB and Cloudinary setup
      controllers/       Auth, paper, admin, analytics controllers
      middleware/        Auth, upload, validation, error handling
      models/            Paper, Admin, Visitor, UploadAnalytics, SearchAnalytics
      routes/            Express route modules
      scripts/           Admin seed script
      services/          Cloudinary upload/delete service
      utils/             Async and password helpers
    .env.example
    package.json
  frontend/
    src/
      api/               Axios API client
      components/        Layout, cards, search filters, reusable UI
      pages/             Public and admin pages
      routes/            App router and protected routes
      store/             Redux Toolkit slices
      styles/            Tailwind entry CSS
    .env.example
    package.json
  docs/
    ARCHITECTURE.md
```

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

For local MongoDB with Docker:

```bash
docker compose up -d mongo
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Backend:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/pyqwithme
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@pyqwithme.com
ADMIN_PASSWORD=change-this-before-seeding
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

Frontend:

```env
VITE_API_URL=https://your-render-api.onrender.com/api
```

## API List

Public:

- `GET /api/health`
- `GET /api/papers` with `examName`, `year`, `month`, `week`, `shift`, `subject`, `page`, `limit`
- `GET /api/papers/:id`
- `POST /api/papers` multipart upload with `pdf`
- `POST /api/papers/:id/download`
- `POST /api/papers/:id/verify-owner`
- `PATCH /api/papers/:id/owner`
- `DELETE /api/papers/:id/owner`
- `POST /api/analytics/visitors`
- `GET /api/analytics/public-stats`
- `GET /api/analytics/popular-exams`

Admin:

- `POST /api/auth/admin/login`
- `GET /api/auth/admin/me`
- `GET /api/admin/stats`
- `GET /api/admin/papers`
- `PATCH /api/admin/papers/:id`
- `PATCH /api/admin/papers/:id/approve`
- `PATCH /api/admin/papers/:id/reject`
- `DELETE /api/admin/papers/:id`

## Deployment

Frontend on Vercel:

1. Set root directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add `VITE_API_URL`.

Backend on Render:

1. Set root directory to `backend`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add backend environment variables.
5. Run `npm run seed:admin` once with production env configured.

MongoDB Atlas:

1. Create a cluster and database named `pyqwithme`.
2. Add the Render outbound IP or use the appropriate network access rule.
3. Put the connection string in `MONGODB_URI`.

Cloudinary:

1. Use authenticated API credentials.
2. PDFs are uploaded as raw assets under `pyqwithme/papers`.

## Security Notes

- There is no user login or signup.
- Admin routes require JWT auth.
- Uploads are PDF-only and capped at 15 MB.
- Express Helmet, CORS, compression, rate limiting, and centralized error handling are enabled.
- Upload passwords are generated per paper and shown once after upload.
- Store strong production secrets outside source control.
