# 📐 Architecture Guide

This document outlines the technical decisions, system design, and code organization of Devforge.

## Table of Contents

- [System Overview](#system-overview)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)
- [API Design](#api-design)
- [Email System](#email-system)
- [File Structure](#file-structure)
- [Key Technologies](#key-technologies)
- [Performance Considerations](#performance-considerations)
- [Security](#security)

---

## System Overview

Devforge is a **full-stack job board** built with:

- **Frontend:** React 19 + Next.js 16 App Router + Tailwind CSS
- **Backend:** Node.js (Next.js Server Actions + API routes)
- **Database:** PostgreSQL + Prisma ORM
- **Email:** Resend service
- **Authentication:** JWT sessions with secure cookies

### Architecture Diagram

```
┌─────────────────┐
│   Browser       │
│  (React 19)     │
└────────┬────────┘
         │
         ↓ useActionState / fetch
┌─────────────────────────────────────┐
│     Next.js 16 App Router           │
│  ├─ Server Components               │
│  ├─ Server Actions                  │
│  ├─ API Routes                      │
│  └─ Middleware                      │
└────────────┬────────────────────────┘
             │
             ↓ Prisma Client
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  ├─ Users (candidates, recruiters)  │
│  ├─ Jobs & Applications             │
│  ├─ Companies & Profiles            │
│  └─ Categories                      │
└─────────────────────────────────────┘
```

---

## Data Model

### Entities

#### User

```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  name               String?
  role               String    @default("CANDIDATE")  // CANDIDATE, EMPLOYER, ADMIN
  password           String?
  passwordChangedAt  DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  employer           Employer?
  candidate          CandidateProfile?
}
```

**Roles:**

- `CANDIDATE` — Can browse jobs, apply, manage profile
- `EMPLOYER` — Can post jobs, manage applications
- `ADMIN` — Full access to all system functions

#### Job

```prisma
model Job {
  id           String        @id @default(cuid())
  title        String
  company      String
  location     String        // "Remote", "San Francisco, CA", etc.
  salary       String        // "100k-150k", "Negotiable", etc.
  type         String        // "Full-time", "Part-time", "Contract"
  tags         String[]      // ["React", "TypeScript", "Node.js"]
  slug         String        @unique  // SEO-friendly URL
  postedAt     DateTime      @default(now())
  description  String?

  employerId   String?
  employer     Employer?

  categoryId   String?
  category     Category?

  applications Application[]
}
```

#### Application

```prisma
model Application {
  id              String   @id @default(cuid())
  jobId           String
  job             Job

  name            String
  email           String
  phone           String?
  resumeUrl       String        // S3 or local storage path
  linkedin        String?
  github          String?
  coverLetter     String?

  status          String   @default("NEW")    // NEW, REVIEWING, APPROVED, REJECTED
  statusChangedAt DateTime @default(now()) @updatedAt
  notes           String?       // Recruiter notes (sent to candidate if approved)

  appliedAt       DateTime @default(now())
}
```

**Status Flow:**

```
NEW → REVIEWING → APPROVED → (send interview email)
      REVIEWING → REJECTED
```

#### Employer & CandidateProfile

```prisma
model Employer {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User
  name        String
  logoUrl     String?
  website     String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  jobs        Job[]
}

model CandidateProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User
  name        String
  phone       String?
  resumeUrl   String?
  linkedin    String?
  github      String?
  experience  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Database Indexes

Strategic indexes for performance:

```prisma
// On Application model
@@index([jobId])              // Lookups by job
@@index([status])             // Filtering by application status
@@index([appliedAt])          // Sorting by application date
@@index([jobId, status])      // Combined queries (job + status)
```

These prevent O(n) table scans on common queries.

---

## Authentication & Authorization

### Session Flow

#### Sign Up

```
1. User submits email + password
2. Server validates input
3. Hash password with bcryptjs
4. Create User record in database
5. Set JWT session cookie
6. Redirect to role-specific dashboard
```

#### Login

```
1. User submits email + password
2. Server finds user by email
3. Compare submitted password with stored hash
4. If match: Set JWT session cookie
5. If mismatch: Return error
```

#### Password Reset

```
1. User requests password reset with email
2. Server generates signed JWT token (1-hour expiry)
3. Send reset link via Resend email service
4. User clicks link, submits new password
5. Server verifies token signature and expiry
6. Hash and update password in database
7. Redirect to login
```

### JWT Session

**Token payload:**

```json
{
  "userId": "user_123abc",
  "role": "CANDIDATE",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Storage:** Secure HTTP-only cookie (`__session`)

**Features:**

- ✅ Signed with JWT Secret (in `.env`)
- ✅ HTTP-only (not accessible from JavaScript)
- ✅ Configurable expiry (default: 1 hour)
- ✅ Cleared on logout

**Security:**

- Never store in localStorage (vulnerable to XSS)
- Always use HTTPS in production
- Rotate JWT_SECRET periodically

---

## API Design

### REST API Routes

#### Job Listings

```
GET /api/jobs
  ?q=react              # Full-text search
  &location=remote      # Location filter
  &type=Full-time       # Employment type
  &page=1               # Pagination
  &limit=9              # Results per page

Response:
{
  "jobs": [ { id, title, company, location, salary, type, tags, slug } ],
  "totalJobs": 150,
  "totalPages": 17,
  "currentPage": 1
}
```

#### Single Job

```
GET /api/jobs/:id

Response:
{
  "id": "cuid123",
  "title": "Senior React Engineer",
  "company": "TechCorp",
  "description": "...",
  "salary": "140k-180k",
  "tags": ["React", "TypeScript"],
  ...
}
```

### Server Actions (Form Mutations)

Server Actions replace traditional REST endpoints for mutations:

#### Apply to Job

```typescript
// Client
const [state, formAction, isPending] = useActionState(applyToJobAction, {});

return (
  <form action={formAction}>
    <input name="jobId" />
    <input name="email" />
    <textarea name="coverLetter" />
    <input name="resume" type="file" />
    <button disabled={isPending}>Apply</button>
  </form>
);

// Server (app/actions/apply.ts)
export async function applyToJobAction(prevState, formData) {
  // 1. Validate inputs
  // 2. Check job exists
  // 3. Store file (resume)
  // 4. Create Application record
  // 5. Return { success, message, error }
}
```

**Advantages over REST:**

- ✅ No JSON serialization needed
- ✅ FormData and file uploads work natively
- ✅ Type-safe (TypeScript)
- ✅ Automatic CSRF protection
- ✅ Can call db directly (Prisma)

---

## Email System

### Resend Integration

Emails are sent via [Resend](https://resend.com) — a transactional email service optimized for developers.

#### Email Templates

**1. Password Reset**

```
To: user@example.com
Subject: Reset your password

Hi {name},
Click here to reset your password: {resetLink}
This link expires in 1 hour.
```

**2. Interview Invitation**

```
To: candidate@example.com
Subject: Interview Invitation - {jobTitle} at {company}

Hi {name},
Congratulations! {company} would like to interview you.
Interview date: {interviewDate}
Join video call: {videoLink}

Recruiter note: {notes}
```

### Email Delivery Modes

#### Development (API Key not configured)

```typescript
// When RESEND_API_KEY is not set:
- Emails logged to console
- No external service calls
- Perfect for local development
```

#### Development with Test Recipient

```env
RESEND_TEST_RECIPIENT=your-verified-email@gmail.com
```

All emails redirect to your verified address. UI shows:

> "We attempted to send... but delivery may be limited. This is a test environment."

#### Production

All emails delivered to real recipients.

### Delivery Warnings

The `formatDeliveryWarning()` helper provides honest messaging:

```typescript
// If email is mocked or redirected:
"We attempted to send the interview invitation to {email},
but delivery may be limited in this test environment."

// If email sent successfully:
"Interview invitation sent to {email}."
```

This prevents false promises when email delivery is limited.

---

## File Structure

### `app/` — Next.js App Router

```
app/
├── layout.tsx                    # Root layout (providers, global styles)
├── page.tsx                      # Home page (hero, featured jobs)
├── loading.tsx                   # Root loading skeleton
├── globals.css                   # Design tokens, global styles
│
├── api/                          # REST API routes
│   └── jobs/
│       ├── route.ts              # GET /api/jobs
│       └── [id]/route.ts         # GET /api/jobs/:id
│
├── actions/                      # Server Actions (form mutations)
│   ├── auth.ts                   # Login, signup, password reset
│   ├── apply.ts                  # Job application
│   ├── applications.ts           # Recruiter: manage applications
│   ├── create-job.ts             # Recruiter: create job
│   ├── edit-job.ts               # Recruiter: edit job
│   ├── delete-job.ts             # Recruiter: delete job
│   ├── admin.ts                  # Admin actions
│   └── settings.ts               # User settings
│
├── (auth)/                       # Auth pages (route group)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── jobs/                         # Job listings
│   ├── (list)/page.tsx           # /jobs (list + filters)
│   ├── (list)/loading.tsx        # Skeleton loader
│   └── [slug]/page.tsx           # /jobs/[slug] (job detail)
│
├── candidate-dashboard/          # Candidate role pages
│   ├── page.tsx                  # Overview
│   └── profile/page.tsx          # Profile settings
│
├── recruiter-dashboard/          # Recruiter role pages
│   ├── page.tsx                  # Overview
│   ├── manage-jobs/page.tsx      # List recruiter's jobs
│   └── manage-applications/page.tsx  # List applications
│
└── admin-dashboard/              # Admin role pages
    ├── page.tsx                  # Overview
    ├── users/page.tsx            # All users
    ├── candidates/page.tsx       # All candidates
    ├── recruiters/page.tsx       # All recruiters
    └── settings/page.tsx         # System settings
```

### `components/` — React Components

```
components/
├── layout/
│   ├── Header.tsx                # Site header + navigation
│   ├── Footer.tsx                # Site footer
│   └── SessionActions.tsx        # Login/logout menu
│
├── home/
│   └── HomeSearch.tsx            # Hero search bar
│
├── jobs/
│   ├── JobCard.tsx               # Job listing card
│   ├── JobsFilter.tsx            # Filter sidebar
│   ├── JobsPagination.tsx        # Pagination controls
│   └── ApplyModal.tsx            # Apply form modal
│
├── recruiter/
│   ├── RecruiterNav.tsx          # Recruiter sidebar nav
│   ├── CreateJobForm.tsx         # Job creation form
│   ├── ManageJobsClient.tsx      # Jobs list client component
│   └── manage-applications/      # Application management
│       └── ApplicationStatusModal.tsx
│
├── admin/
│   ├── AdminNav.tsx              # Admin sidebar nav
│   └── ...                        # Admin components
│
├── email/
│   └── EmailStatusBanner.tsx     # Centralized email status display
│
├── ui/
│   ├── CustomSelect.tsx          # Styled select dropdown
│   ├── ThemeProvider.tsx         # Dark/light mode provider
│   └── ThemeToggle.tsx           # Theme toggle button
│
└── applications/
    └── ApplicationStatusBadge.tsx # Status badge display
```

### `lib/` — Utilities & Helpers

```
lib/
├── prisma.ts                     # Prisma Client singleton
├── auth.ts                       # Password hashing, JWT, sessions
├── email.ts                      # Resend email service wrapper
├── jobs.ts                       # Job data access layer
├── salary.ts                     # Salary formatting utilities
├── application-status.ts         # Status validation
└── (public)/
    └── (helpers shared with client)
```

### `prisma/` — Database

```
prisma/
├── schema.prisma                 # Data model definitions
├── seed.ts                       # Seed script for sample data
└── migrations/                   # Database migration history
    ├── 20260502012626_init/
    ├── 20260503003445_add_user_employer_category/
    └── ...
```

### `public/` — Static Assets

```
public/
└── uploads/
    └── resumes/                  # Uploaded resume files
```

---

## Key Technologies

| Layer         | Technology             | Purpose                    |
| ------------- | ---------------------- | -------------------------- |
| **Frontend**  | React 19               | UI library                 |
|               | Next.js 16             | Framework, App Router, SSR |
|               | TypeScript 5           | Type safety                |
|               | Tailwind CSS v4        | Styling                    |
|               | Lucide React           | Icons                      |
| **Backend**   | Node.js                | Runtime                    |
|               | Next.js Server Actions | Form mutations             |
|               | Next.js API Routes     | REST endpoints             |
| **Database**  | PostgreSQL 14+         | RDBMS                      |
|               | Prisma 7.8.0           | ORM, migrations            |
| **Auth**      | bcryptjs               | Password hashing           |
|               | jose                   | JWT signing                |
| **Email**     | Resend                 | Transactional email        |
| **Dev Tools** | ESLint 9               | Linting                    |
|               | TypeScript             | Type checking              |

---

## Performance Considerations

### 1. Database Queries

**✅ Optimized:**

- Prisma relation loading with `include: { ... }`
- Strategic indexes on frequently queried columns
- Pagination limits (9 jobs per page)

**❌ Avoid:**

- N+1 queries (load related data eagerly)
- Unbounded result sets

```typescript
// Good: Eager load related data
const applications = await prisma.application.findMany({
  include: { job: true },  // Load job in one query
});

// Bad: N+1 problem
const applications = await prisma.application.findMany();
for (const app of applications) {
  const job = await prisma.job.findUnique(...);  // Query per app!
}
```

### 2. Caching

**Response caching:**

- Job listings cached by Vercel's ISR (Incremental Static Regeneration)
- User dashboard data bypasses cache (always fresh)

```typescript
export const revalidate = 3600; // Cache for 1 hour
```

### 3. Images & Assets

- No heavy images on critical paths
- Icons from Lucide React (SVG, ~1KB each)
- Resume uploads stored in `/public/uploads/resumes/`

### 4. Bundle Size

- Tree-shaking enabled for unused code removal
- Dynamic imports for admin dashboard (loaded on demand)
- Next.js automatic code splitting per route

---

## Security

### 1. Authentication

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens signed with SECRET key
- ✅ Sessions in HTTP-only secure cookies
- ✅ CSRF protection built into Server Actions

### 2. Authorization

- ✅ Role-based access control (CANDIDATE, EMPLOYER, ADMIN)
- ✅ Server-side permission checks before operations
- ✅ Users can't access other users' data

```typescript
// Example: Only recruiter can update their own jobs
const recruiter = await getSession();
if (recruiter.role !== "EMPLOYER") {
  return { error: "Unauthorized" };
}

const job = await prisma.job.findUnique({
  where: { id: jobId },
  include: { employer: true },
});

if (job.employer.userId !== recruiter.userId) {
  return { error: "Unauthorized" };
}
```

### 3. Input Validation

- ✅ Client-side validation (UX)
- ✅ Server-side validation (security)
- ✅ TypeScript type checking
- ✅ Prisma schema constraints (unique, required)

```typescript
// Validate email format
if (!EMAIL_RE.test(email)) {
  return { error: "Invalid email" };
}

// Validate resume file size
if (file.size > 5 * 1024 * 1024) {
  return { error: "Resume must be < 5MB" };
}
```

### 4. File Uploads

- ✅ Stored in `/public/uploads/` with unique filename
- ✅ File type restricted to PDF, DOC, DOCX
- ✅ File size limited to 5MB
- ✅ Original filename sanitized

### 5. Environment Variables

- ✅ API keys in `.env` (never committed)
- ✅ JWT Secret rotated in production
- ✅ Database credentials encrypted
- ✅ Public env vars prefixed with `NEXT_PUBLIC_`

### 6. SQL Injection Prevention

- ✅ Using Prisma parameterized queries (not raw SQL)
- ✅ Input sanitization at ORM level

---

## Future Improvements

- [ ] Add Redis caching for job listings
- [ ] Implement full-text search with PostgreSQL FTS or Elasticsearch
- [ ] Add vector embeddings for job recommendations (ML)
- [ ] Implement rate limiting on API endpoints
- [ ] Add audit logging for admin actions
- [ ] Set up automated backups for PostgreSQL
- [ ] Add monitoring & error tracking (Sentry)
- [ ] Implement webhook system for external integrations

---

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Resend Docs](https://resend.com/docs)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance.html)
- [OWASP Security Best Practices](https://owasp.org/www-project-top-ten/)
