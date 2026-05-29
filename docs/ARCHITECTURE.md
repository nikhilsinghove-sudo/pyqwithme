# PYQwithMe Architecture

## Backend Architecture

The backend follows an MVC-style Express structure:

- Models: Mongoose schemas for `Paper`, `Admin`, `Visitor`, `UploadAnalytics`, and `SearchAnalytics`.
- Controllers: Request logic for uploads, search, admin moderation, authentication, and analytics.
- Routes: Thin route modules that connect middleware to controllers.
- Middleware: JWT admin protection, PDF upload handling, validation, rate limiting, and errors.
- Services: Cloudinary raw-file upload and deletion.

## MongoDB Schemas

Paper:

- `examName`
- `examLogo`
- `year`
- `month`
- `week`
- `shift`
- `subject`
- `pdfUrl`
- `pdfPublicId`
- `uploadedEmail`
- `uploadPassword`
- `status`
- `rejectionReason`
- `downloads`
- `views`
- `duplicateFingerprint`
- `createdAt`

Admin:

- `email`
- `password`
- `name`
- `lastLoginAt`

Visitor:

- `visitorId`
- `ipHash`
- `userAgent`
- `path`
- `lastSeenAt`

UploadAnalytics:

- `paper`
- `examName`
- `status`
- `uploadedEmail`

SearchAnalytics:

- `query`
- `examName`
- `filters`
- `resultCount`

## Frontend Architecture

- `routes`: Public and protected admin routing.
- `api`: Central Axios instance with admin token injection.
- `store`: Redux Toolkit slices for papers, admin auth/stats, and UI mode.
- `components/layout`: Sticky navbar, footer, admin sidebar.
- `components/papers`: Reusable paper card.
- `components/search`: Debounced filter UI.
- `components/ui`: Buttons, skeleton loaders, loader.
- `pages`: Home, search, details, upload, manage upload, admin login, dashboard, pending uploads, analytics, 404.

## Upload Flow

1. User opens `/upload`.
2. User enters email, exam metadata, subject, and PDF.
3. Frontend sends multipart form data to `POST /api/papers`.
4. Backend validates fields and PDF MIME type.
5. Backend generates a duplicate fingerprint from exam metadata.
6. Backend uploads PDF to Cloudinary as a raw PDF asset.
7. Backend generates a unique upload password.
8. Backend stores paper metadata with `status: pending`.
9. Frontend shows success message, paper ID, and generated password.
10. Admin reviews the upload from `/admin/pending`.

## Search Flow

1. User opens `/search`.
2. Filters update local state.
3. A 350 ms debounce triggers `GET /api/papers`.
4. Backend returns approved papers only with pagination.
5. Backend records a `SearchAnalytics` document.
6. Frontend renders skeleton loaders while fetching and paginated paper cards after fetch.

## Admin Panel Structure

- `/admin/login`: JWT admin login.
- `/admin/dashboard`: Upload counts, visitor counts, active users, most downloaded papers, most searched exams.
- `/admin/pending`: Pending upload moderation with approve, reject, and delete actions.
- `/admin/analytics`: Focused analytics views.

Only one admin account is intended. Create it with `npm run seed:admin`.

## Analytics System

- Visitor tracking stores a local visitor ID in the browser and posts visits to `/api/analytics/visitors`.
- Download counts increment through `POST /api/papers/:id/download`.
- Search analytics are saved every time public search runs.
- Admin dashboard aggregates:
  - Total uploads
  - Total approved papers
  - Total pending papers
  - Total visitors
  - Active users today
  - Most downloaded papers
  - Most searched exams

## Duplicate Detection

The backend computes a SHA-256 fingerprint from:

```text
examName | year | month | week | shift | subject
```

If a non-rejected paper already exists with the same fingerprint, the upload is still accepted but returned with `possibleDuplicate: true` for admin review.

## Production Best Practices

- Use a strong `JWT_SECRET`.
- Keep `.env` files out of git.
- Rotate admin password after first deployment.
- Restrict MongoDB Atlas network access for production.
- Use HTTPS-only deployment URLs.
- Keep Cloudinary API secret only on the backend.
- Consider adding malware scanning for uploaded PDFs before heavy public use.
- Consider hashing `uploadPassword` at rest before launch if owner recovery is not required.
