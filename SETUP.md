# 🚀 Setup Guide

This guide covers all steps needed to get **Devforge** running locally for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Database Setup](#database-setup)
- [Email Configuration](#email-configuration)
- [Authentication Setup](#authentication-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 14+ ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))
- **Code editor** — [VS Code](https://code.visualstudio.com/) (recommended)

### Verify installations

```bash
node --version    # Should be ≥ 18.x
npm --version     # Should be ≥ 9.x
psql --version    # Should be ≥ 14.x
git --version
```

---

## Quick Start (5 minutes)

For a **local development environment with dummy data**:

```bash
# 1. Clone and install
git clone https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp
npm install

# 2. Create database
createdb devforge_db

# 3. Set up environment
cp .env.example .env

# 4. Update .env with your local database URL
# Edit .env and change:
# DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/devforge_db"

# 5. Migrate & seed database
npx prisma migrate dev --name init
npx prisma db seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

---

## Detailed Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- **Next.js 16.2.4** — React framework
- **Prisma 7.8.0** — Database ORM
- **PostgreSQL adapter** — DB connection
- **Resend** — Email service
- **Tailwind CSS v4** — Styling
- **TypeScript** — Type safety
- **ESLint** — Code linting

### Step 3: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# Database connection string
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/devforge_db"

# Email service (optional for local dev)
# RESEND_API_KEY=your_api_key_here

# JWT secret (change in production!)
JWT_SECRET=devforge-secret-key-change-me

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Redirect all emails to a test address during development
# RESEND_TEST_RECIPIENT=your-email@example.com
```

> ⚠️ **Never commit `.env` to git.** It's already in `.gitignore`.

---

## Database Setup

### Create PostgreSQL Database

#### On macOS/Linux:

```bash
# Create database
createdb devforge_db

# Verify it was created
psql -l | grep devforge_db
```

#### On Windows (using psql):

```bash
psql -U postgres

# Inside psql prompt:
CREATE DATABASE devforge_db;
\l  # List all databases to verify
\q  # Exit psql
```

#### Using GUI (pgAdmin):

1. Right-click **Databases** → **Create** → **Database**
2. Name: `devforge_db`
3. Click **Save**

---

### Run Migrations

Prisma migrations set up the database schema:

```bash
# Run all pending migrations
npx prisma migrate dev --name init
```

This will:
1. Create all tables (User, Job, Application, etc.)
2. Set up relationships and indexes
3. Generate Prisma Client

### Seed Database (Optional)

Populate with sample data:

```bash
npx prisma db seed
```

This creates:
- 3 admin users
- 5 recruiter companies
- 20 job listings
- Sample applications

**Seed credentials** (after seeding, check console output for passwords)

---

## Email Configuration

### Option 1: Console-Only (Development Default)

If `RESEND_API_KEY` is not set, emails are logged to console:

```bash
# In .env, leave RESEND_API_KEY commented out or empty
# RESEND_API_KEY=

npm run dev
# When an email is sent:
# [EMAIL MOCK] To: user@example.com
# [EMAIL MOCK] Subject: Password Reset
# <full email HTML>
```

**Best for:** Local development without email service costs

---

### Option 2: With Resend (Email Delivery)

1. **Get API key:**
   - Sign up at [resend.com](https://resend.com)
   - Go to **API Keys** → Create **Production API Key**
   - Copy the key (starts with `re_`)

2. **Update .env:**

```env
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM_NAME=Devforge
```

3. **⚠️ Important:** Resend in development mode only sends to **verified recipients**
   - You must verify your email in Resend dashboard first
   - OR set `RESEND_TEST_RECIPIENT` to redirect all emails to your verified email:

```env
RESEND_TEST_RECIPIENT=your-verified-email@gmail.com
```

When `RESEND_TEST_RECIPIENT` is set:
- All user emails are redirected to your verified email
- Users see: _"We attempted to send... but delivery may be limited"_
- Good for: Testing email flows in development without actual delivery

---

## Authentication Setup

### Default Test Accounts

After running `npm run db seed`:

```
Email: admin@example.com
Password: admin123456

Email: recruiter@example.com
Password: recruiter123456

Email: candidate@example.com
Password: candidate123456
```

These credentials are created by `prisma/seed.ts`.

### JWT Secret

The JWT secret in `.env` is used to sign session tokens:

```env
JWT_SECRET=devforge-super-secret-key-change-me-in-production
```

⚠️ **Change in production!** Never use default values in live environments.

---

## Running the Application

### Development Server

```bash
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000)

Features:
- Hot reload on file changes
- Incremental builds with Turbopack
- Server Actions enabled

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

---

## Verify Setup is Complete

Check all is working:

```bash
# 1. Test database connection
npx prisma studio

# 2. Verify environment variables
cat .env

# 3. Check Node modules
ls node_modules | grep -E "next|react|prisma"

# 4. Start dev server
npm run dev
```

Then:

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the **Devforge** homepage
3. Try signing up or logging in
4. Check terminal for email logs

---

## Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not running or connection string wrong

**Fix:**
```bash
# Start PostgreSQL
brew services start postgresql    # macOS
sudo systemctl start postgresql   # Linux
# or use Windows Services GUI

# Verify connection string in .env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/devforge_db"
```

### "relation 'User' does not exist"

**Cause:** Database not migrated

**Fix:**
```bash
npx prisma migrate dev --name init
```

### "RESEND_API_KEY not configured"

**Cause:** Email service not set up

**Fix:**
1. Leave it blank for console-only emails (development default), OR
2. Get key from [resend.com](https://resend.com) and add to `.env`

### "Unexpected token < in JSON"

**Cause:** Using wrong environment variable (PUBLIC_ prefix missing)

**Fix:**
- Use `NEXT_PUBLIC_SITE_URL` (not `SITE_URL`)
- Public env vars need `NEXT_PUBLIC_` prefix to be accessible in browser

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
# or kill process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Prisma schema conflicts after git pull

```bash
# Regenerate Prisma Client
npx prisma generate

# Run any new migrations
npx prisma migrate dev
```

---

## Next Steps

After setup completes:

1. **Read** [ARCHITECTURE.md](ARCHITECTURE.md) to understand project structure
2. **Review** [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. **Check** [DEVELOPMENT.md](DEVELOPMENT.md) for common workflows

---

## Need Help?

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 🗄️ [Prisma Docs](https://www.prisma.io/docs/)
- 📧 [Resend Docs](https://resend.com/docs)
- 🐛 [Open an Issue](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)
