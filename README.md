<div align="center">

# ⚡ Devforge

### The Modern Job Board for Tech Professionals

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A full-stack job board web application built with **Next.js 16 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL**. Devforge connects job seekers with software engineering opportunities through an intuitive, responsive interface with role-based dashboards for candidates, recruiters, and admins.

[🚀 Quick Start](#-quick-start) · [📚 Documentation](#-documentation) · [🤝 Contributing](CONTRIBUTING.md) · [🐛 Report Issue](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues) · [💡 Feature Request](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)

---

**Status:** MVP Complete ✅ | **Stage:** Learning Project | **Node:** 18+ | **DB:** PostgreSQL 14+

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📸 Preview](#-preview)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📖 Documentation](#-documentation)
- [🔐 Security](#-security)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

### 👥 For Job Seekers (Candidates)

- 🔍 **Advanced Job Search** — Full-text search by title, company, skills, or keywords
- 📍 **Smart Filtering** — Filter by location (city, state, remote), job type (full-time, part-time, contract), salary range
- 📄 **One-Click Apply** — Apply with drag-and-drop resume, LinkedIn/GitHub portfolio links, cover letter
- 💾 **Application Tracking** — View status of submitted applications in real-time
- 👤 **Candidate Profile** — Manage resume, LinkedIn, GitHub, professional experience
- 🔗 **SEO-Friendly URLs** — Human-readable job URLs (e.g., `/jobs/senior-react-engineer-technova-1`)
- 📱 **Responsive Design** — Perfect experience on desktop, tablet, mobile

### 👨‍💼 For Recruiters

- 💼 **Job Management** — Create, edit, and delete job postings
- 📊 **Application Dashboard** — View all applications with filtering and sorting
- ✅ **Application Status Tracking** — Update status (New → Reviewing → Approved/Rejected)
- 📧 **Interview Invitations** — Send interview details and recruiter notes via email
- 📝 **Bulk Operations** — Update multiple applications at once
- 📋 **Application Details** — View candidate resume, contact info, portfolio links
- 🔔 **Real-time Notifications** — Track application status changes

### 🛡️ For Administrators

- 👥 **User Management** — View and manage all users (candidates, recruiters, admins)
- 📋 **Application Management** — Full access to all applications across jobs
- 🏢 **Recruiter Management** — View all recruiter accounts and company profiles
- 👤 **Candidate Management** — View all candidate profiles and applications
- ⚙️ **System Settings** — Configure system parameters and email settings
- 📊 **Dashboard & Analytics** — Overview of system activity

### 🎨 User Experience

- 🌗 **Dark/Light Mode** — Respects system preference, user-selectable
- 💀 **Loading States** — Smooth skeleton loaders for lists and detail pages
- 🚫 **Custom 404 Pages** — Friendly error pages with helpful CTAs
- ♿ **Accessibility** — WCAG compliant with keyboard navigation, focus management, ARIA labels
- ⚡ **Performance** — Optimized bundle, incremental static regeneration, server-side rendering

### 🔐 Authentication & Security

- 🔑 **Secure Authentication** — JWT-based sessions in HTTP-only cookies
- 🛡️ **Password Security** — Bcryptjs hashing with 10 salt rounds
- 🔄 **Password Reset** — Secure token-based password reset via email
- 👤 **Role-Based Access** — Candidate, Recruiter, Admin roles with permission checks
- 🚫 **CSRF Protection** — Built-in CSRF protection on all forms
- 🔒 **Authorization** — Server-side permission validation on all operations

### 📧 Email System

- 📬 **Password Reset Emails** — Automated password recovery flow
- 📮 **Interview Invitations** — Send interview details with custom recruiter notes
- 🧪 **Development Mode** — Test emails with console logging or test recipient redirect
- ⚠️ **Honest Messaging** — Clear delivery status when limited to verified recipients

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────┐
│   Browser (React)   │
│   - Job listings    │
│   - Application form│
│   - User dashboards │
└──────────┬──────────┘
           │ HTTP
           ↓
┌──────────────────────────────┐
│  Next.js 16 (App Router)     │
│  - Server Components         │
│  - Server Actions            │
│  - API Routes                │
│  - Middleware (auth check)   │
└──────────┬───────────────────┘
           │ Prisma
           ↓
┌──────────────────────────────┐
│   PostgreSQL Database        │
│  - Users & Profiles          │
│  - Jobs & Applications       │
│  - Employer Companies        │
└──────────────────────────────┘
           ↓ (async)
      ┌─────────────┐
      │ Resend      │
      │ Email API   │
      └─────────────┘
```

### Data Model

**7 core entities:**

- **User** — Authentication, roles (CANDIDATE, EMPLOYER, ADMIN)
- **Job** — Job postings with description, location, salary, tags
- **Application** — Candidate applications with status tracking
- **Employer** — Company profiles for recruiters
- **CandidateProfile** — Candidate profiles with resume, portfolio links
- **Category** — Job categories for organization
- **Application Lifecycle:** NEW → REVIEWING → APPROVED (send email) / REJECTED

See [ARCHITECTURE.md](ARCHITECTURE.md) for full data model.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19 | UI library |
| | Next.js | 16.2.4 | Framework & App Router |
| | TypeScript | 5 | Type safety |
| | Tailwind CSS | v4 | Styling & responsiveness |
| | Lucide React | 1.8.0 | Icons |
| **Backend** | Node.js | 18+ | Runtime |
| | Next.js App Router | - | File-based routing |
| | Server Actions | - | Form mutations |
| | Middleware | - | Auth checks |
| **Database** | PostgreSQL | 14+ | RDBMS |
| | Prisma | 7.8.0 | ORM & migrations |
| | pg (driver) | 8.20.0 | DB connection |
| **Auth & Security** | bcryptjs | 3.0.3 | Password hashing |
| | jose | 6.2.3 | JWT signing/verification |
| **Email** | Resend | 6.12.3 | Transactional emails |
| **Dev Tools** | ESLint | 9 | Linting |
| | TypeScript | 5 | Type checking |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ (included with Node.js)
- **PostgreSQL** 14+ ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))

### 1. Clone & Install

```bash
git clone https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb devforge_db

# Copy environment template
cp .env.example .env

# Edit .env and update DATABASE_URL if needed
# DATABASE_URL="postgresql://postgres:password@localhost:5432/devforge_db"

# Run migrations
npx prisma migrate dev

# Seed with sample data
npx prisma db seed
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test Default Accounts (from seed)

```
Candidate:  candidate@example.com / password: candidate123456
Recruiter:  recruiter@example.com / password: recruiter123456
Admin:      admin@example.com / password: admin123456
```

**➡️ Full setup guide: [SETUP.md](SETUP.md)**

---

## 📖 Documentation

### 📚 Main Docs

| Document | Purpose |
|----------|---------|
| **[SETUP.md](SETUP.md)** | 🔧 Environment setup, database configuration, email setup |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 📐 Technical decisions, data model, API design, security |
| **[DEVELOPMENT.md](DEVELOPMENT.md)** | 👨‍💻 Development workflows, debugging, common tasks |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | 🤝 How to contribute, commit conventions, PR process |
| **[.env.example](.env.example)** | ⚙️ Environment variables template |

### 🗂️ Project Structure

```
fs-job-board-next-js-webapp/
├── app/                        # Next.js App Router
│   ├── actions/               # Server Actions (mutations)
│   │   ├── auth.ts            # Login, signup, password reset
│   │   ├── apply.ts           # Job application
│   │   ├── applications.ts    # Recruiter: manage applications
│   │   ├── create-job.ts      # Create job posting
│   │   ├── admin.ts           # Admin actions
│   │   └── settings.ts        # User settings
│   │
│   ├── api/                   # REST API routes
│   │   └── jobs/
│   │       ├── route.ts       # GET /api/jobs (search, filter, paginate)
│   │       └── [id]/route.ts  # GET /api/jobs/:id
│   │
│   ├── (auth)/                # Auth pages (route group)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── jobs/                  # Job listings & detail
│   │   ├── (list)/page.tsx    # /jobs (list with filters)
│   │   └── [slug]/page.tsx    # /jobs/[slug] (job detail)
│   │
│   ├── candidate-dashboard/   # Candidate role
│   │   ├── page.tsx           # Dashboard overview
│   │   └── profile/page.tsx   # Candidate profile
│   │
│   ├── recruiter-dashboard/   # Recruiter role
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── manage-jobs/       # List & manage jobs
│   │   └── manage-applications/ # List & manage applications
│   │
│   ├── admin-dashboard/       # Admin role
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── users/page.tsx     # All users
│   │   ├── applications/page.tsx
│   │   ├── candidates/page.tsx
│   │   ├── recruiters/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── globals.css            # Design tokens
│   └── loading.tsx            # Root skeleton loader
│
├── components/                # React components
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobsFilter.tsx
│   │   ├── JobsPagination.tsx
│   │   └── ApplyModal.tsx
│   ├── email/
│   │   └── EmailStatusBanner.tsx
│   ├── recruiter/
│   ├── admin/
│   └── ui/
│
├── lib/                       # Utilities & business logic
│   ├── prisma.ts             # Prisma Client
│   ├── auth.ts               # Password hashing, JWT, sessions
│   ├── email.ts              # Resend email service
│   ├── jobs.ts               # Job data access
│   └── application-status.ts # Status validation
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Sample data seeding
│   └── migrations/           # Database migrations
│
├── utils/
│   └── slugify.ts            # URL slug generation
│
├── public/
│   └── uploads/              # User uploads (resumes)
│
├── .env.example              # Environment template
├── SETUP.md                  # Setup guide
├── ARCHITECTURE.md           # Architecture decisions
├── DEVELOPMENT.md            # Development guide
├── CONTRIBUTING.md           # Contributing guide
├── README.md                 # This file
└── package.json              # Dependencies
```

---

## 🔐 Security

### Features

✅ **Password Security**
- Bcryptjs with 10 salt rounds
- Never stored in plain text
- Secure password reset via email tokens

✅ **Authentication**
- JWT sessions in HTTP-only cookies
- CSRF protection on all forms
- Automatic session expiry (1 hour default)

✅ **Authorization**
- Role-based access control (CANDIDATE, EMPLOYER, ADMIN)
- Server-side permission checks on every operation
- Users cannot access other users' data

✅ **Input Validation**
- Client-side validation for UX
- Server-side validation for security
- TypeScript type checking
- Prisma schema constraints

✅ **Email Security**
- Signed password reset tokens
- 1-hour token expiry
- Verification of token integrity

### Best Practices

1. **Environment Variables** — Never commit `.env`, use `.env.example`
2. **API Keys** — Keep Resend API key secret
3. **Database** — Use strong PostgreSQL password
4. **JWT Secret** — Change in production, at least 32 characters
5. **HTTPS** — Always use HTTPS in production
6. **Secrets Rotation** — Rotate JWT_SECRET and DB credentials periodically

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

Vercel is purpose-built for Next.js apps with zero-config deployment:

1. **Push code to GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project" → Select your repo**
4. **Vercel auto-detects Next.js configuration**
5. **Add environment variables:**
   - `DATABASE_URL` (PostgreSQL connection)
   - `RESEND_API_KEY` (Resend API key)
   - `JWT_SECRET` (Strong random string)
   - `NEXT_PUBLIC_SITE_URL` (Your domain)
6. **Click Deploy** — Done! 🎉

**Every push to `main` automatically deploys to production.**

### Deploy Elsewhere

Since Devforge is a standard Next.js app, it runs on any Node.js hosting:

```bash
npm run build
npm run start
```

Popular alternatives:
- Railway
- Fly.io
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Heroku

See [SETUP.md](SETUP.md#-deployment) for details.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, feature requests, or documentation improvements, your help is appreciated.

### Quick Start

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Make changes** and test thoroughly
4. **Commit** with descriptive message: `git commit -m "feat: add your feature"`
5. **Push** to your fork: `git push origin feat/your-feature`
6. **Open a Pull Request** on GitHub

### Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Write clear PR descriptions
- Test your changes locally before submitting
- Update documentation if needed
- Keep commits focused and atomic

**Full guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Ideas for Contributions

- [ ] Full-text search with PostgreSQL FTS or Elasticsearch
- [ ] Bookmark/save jobs feature
- [ ] Advanced filtering (experience level, company size, benefits)
- [ ] Real-time notifications with WebSockets
- [ ] Admin analytics dashboard
- [ ] Email template customization
- [ ] Two-factor authentication
- [ ] Resume parser (extract skills from resume)
- [ ] Job recommendations based on profile
- [ ] Interview scheduling system

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use this project for personal and commercial purposes
- ✅ Modify and distribute the code
- ✅ Use in private or public projects

You must:
- ✅ Include the license and copyright notice

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) — React framework
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Prisma](https://www.prisma.io/) — Database ORM
- [Resend](https://resend.com/) — Email service
- [PostgreSQL](https://www.postgresql.org/) — Database
- [TypeScript](https://www.typescriptlang.org/) — Type safety

---

## 📞 Support

### Getting Help

- 📖 Read the [documentation](#-documentation)
- 🐛 Search [existing issues](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)
- 💬 Open a [new issue](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues/new)
- 💡 Start a [discussion](https://github.com/CillianCoder/fs-job-board-next-js-webapp/discussions)

### Quick Links

- [Live Demo](#) (coming soon)
- [GitHub Repository](https://github.com/CillianCoder/fs-job-board-next-js-webapp)
- [Issues & Bugs](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)
- [Feature Requests](https://github.com/CillianCoder/fs-job-board-next-js-webapp/discussions)

---

<div align="center">

### 🌟 If you found this helpful, please give it a star! ⭐

Built with ❤️ using **Next.js** · **React** · **TypeScript** · **Tailwind CSS** · **PostgreSQL**

**Happy coding!** 🚀

</div>
