<div align="center">

# ⚡ Devforge

### The Job Board for Software Engineers

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A modern, full-featured job board web application built with the **Next.js 16 App Router**, designed exclusively for software engineering roles. Devforge helps developers discover curated opportunities, filter by skill or location, and apply — all in a premium, responsive UI.

[🔗 Live Demo](#) · [🐛 Report a Bug](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues) · [💡 Request a Feature](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📐 Architecture Decisions](#-architecture-decisions)
- [🔌 API Reference](#-api-reference)
- [📄 Environment Variables](#-environment-variables)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

### For Job Seekers
- 🔍 **Full-text search** — search by job title, company name, or tech stack tags
- 📍 **Location filtering** — filter by city, state, or "Remote"
- 📋 **Job type filtering** — Full-time, Part-time, Contract
- 📄 **Paginated listings** — 9 jobs per page with clean pagination controls
- 🔗 **SEO-friendly URLs** — human-readable slugs (e.g. `/jobs/senior-fullstack-engineer-technova-1`)
- 📬 **Apply Now modal** — in-page application form with:
  - Dual-layer validation (client-side on blur + server-side via Server Action)
  - Drag-and-drop resume upload (PDF / DOC / DOCX, max 5 MB)
  - LinkedIn & GitHub portfolio fields
  - Animated success confirmation screen

### UX & Design
- 💀 **Skeleton loading states** — shimmer loaders for both job list and detail pages
- 🚫 **Custom 404 pages** — branded, contextual "job not found" page with helpful CTAs
- 🌗 **Dark / light mode** — respects system preference via CSS media queries
- 📱 **Fully responsive** — mobile-first layout with Tailwind CSS v4
- ♿ **Accessible** — focus trapping, `aria-*` attributes, keyboard navigation throughout

### Developer Experience
- ⚡ **App Router** — file-based routing with layouts, loading, and not-found conventions
- 🧩 **Server Actions** — form mutations without REST boilerplate (`useActionState`)
- 📐 **TypeScript** — strict typing throughout the entire codebase
- 🎨 **Design tokens** — CSS custom properties for a consistent, themeable design system

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16.2.4](https://nextjs.org/) — App Router |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | [Geist Sans & Geist Mono](https://vercel.com/font) via `next/font` |
| **Form Handling** | React 19 `useActionState` + Next.js Server Actions |
| **Linting** | ESLint with `eslint-config-next` |

---

## 🗂️ Project Structure

```
fs-job-board-next-js-webapp/
│
├── app/                            # Next.js App Router
│   ├── actions/
│   │   └── apply.ts                # Server Action — job application form handler
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts            # GET /api/jobs — filtered & paginated jobs
│   │       └── [id]/               # GET /api/jobs/:id — single job
│   ├── jobs/
│   │   ├── (list)/                 # Route group (no layout nesting)
│   │   │   ├── page.tsx            # /jobs — listings with filter & pagination
│   │   │   └── loading.tsx         # Skeleton loader for job list
│   │   └── [slug]/                 # Dynamic route for job detail
│   │       ├── page.tsx            # /jobs/[slug] — full job detail view
│   │       ├── loading.tsx         # Skeleton loader for job detail
│   │       └── not-found.tsx       # Custom 404 for missing/deleted jobs
│   ├── layout.tsx                  # Root layout — Header, Footer, fonts
│   ├── page.tsx                    # Home page — Hero, Featured Jobs, CTA
│   ├── loading.tsx                 # Root-level skeleton loader
│   └── globals.css                 # Design tokens & global styles
│
├── components/
│   ├── home/
│   │   └── HomeSearch.tsx          # Hero search bar (client)
│   ├── jobs/
│   │   ├── ApplyModal.tsx          # Apply Now modal — form, validation, states
│   │   ├── JobCard.tsx             # Job listing card
│   │   ├── JobsFilter.tsx          # Filter sidebar (search / location / type)
│   │   └── JobsPagination.tsx      # Pagination controls
│   ├── layout/
│   │   ├── Header.tsx              # Sticky site header & nav
│   │   └── Footer.tsx              # Site footer
│   └── ui/
│       └── CustomSelect.tsx        # Reusable styled select dropdown
│
├── data/
│   └── jobs.ts                     # Static dataset — 20 job listings + Job type
│
├── lib/
│   └── jobs.ts                     # Data access layer — getJobs, getJobById, getAllJobs
│
└── utils/
    └── slugify.ts                  # SEO slug generator & ID extractor
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or yarn / pnpm)

### 1 — Clone the repository

```bash
git clone https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads on every file save.

### 4 — Other useful scripts

```bash
npm run build      # Production build
npm run start      # Run production build locally
npm run lint       # Run ESLint
```

---

## 📐 Architecture Decisions

### App Router & Route Groups
The jobs listing uses a **route group** `(list)` (`app/jobs/(list)/`) to isolate its `loading.tsx` skeleton from the job detail route, preventing skeleton mismatches when navigating between the two.

### Server Actions for Forms
The **Apply Now** form uses a Next.js **Server Action** (`app/actions/apply.ts`) wired through React 19's `useActionState`. This means:
- No manual `fetch()` or JSON serialization required
- `FormData` (including file uploads) is handled natively
- Validation runs **twice** — client-side on blur for instant UX, and server-side inside the action before any processing

### SEO-Friendly Slugs
Job URLs are generated as `/{job-title}-{company-name}-{id}` (e.g. `/jobs/senior-full-stack-engineer-technova-1`). The ID suffix ensures uniqueness even when titles are similar, and is extracted by `utils/slugify.ts` for data lookups.

### Data Layer
`lib/jobs.ts` provides a clean async interface (`getJobs`, `getJobById`, `getAllJobs`) over the static dataset in `data/jobs.ts`. All functions simulate async calls, making them trivially swappable for a real database (e.g. Prisma + PostgreSQL).

---

## 🔌 API Reference

### `GET /api/jobs`

Returns a filtered, paginated list of jobs.

| Query Param | Type | Description |
|---|---|---|
| `q` | `string` | Full-text search (title, company, tags) |
| `location` | `string` | Filter by location string |
| `type` | `string` | Filter by employment type (e.g. `Full-time`) |
| `page` | `number` | Page number (default: `1`) |
| `limit` | `number` | Results per page (default: `9`) |

**Example:**
```
GET /api/jobs?q=react&location=remote&page=1
```

**Response:**
```json
{
  "jobs": [...],
  "totalJobs": 5,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### `GET /api/jobs/:id`

Returns a single job by its numeric ID.

**Response:** A single `Job` object, or `404` if not found.

---

## 📄 Environment Variables

This project runs fully on static/in-memory data and requires **no environment variables** to get started.

When you add a real database, email service, or auth provider, create a `.env.local` file:

```env
# Example — add your own values
DATABASE_URL="postgresql://user:pass@localhost:5432/devforge"
EMAIL_FROM="no-reply@devforge.io"
NEXT_PUBLIC_SITE_URL="https://devforge.io"
```

> **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

## 🚢 Deployment

### Deploy to Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CillianCoder/fs-job-board-next-js-webapp)

1. Click the button above or import the repo in the [Vercel dashboard](https://vercel.com/new)
2. Vercel auto-detects Next.js — no configuration needed
3. Add any environment variables in the Vercel project settings
4. Every push to `main` triggers an automatic production deployment

### Other platforms

This is a standard Next.js app and can be deployed anywhere that supports Node.js:

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to your branch: `git push origin feat/your-feature-name`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Ideas for contributions
- [ ] Real database integration (Prisma + PostgreSQL)
- [ ] Authentication (NextAuth.js)
- [ ] Job posting / employer dashboard
- [ ] Email confirmation on application
- [ ] Bookmark / saved jobs feature
- [ ] Admin panel for managing listings

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ using [Next.js](https://nextjs.org/) · [React](https://react.dev/) · [Tailwind CSS](https://tailwindcss.com/)

⭐ If you found this project helpful, please give it a star!

</div>
