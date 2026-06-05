# 👨‍💻 Development Guide

Common workflows and debugging tips for working on Devforge.

## Table of Contents

- [Getting Started](#getting-started)
- [Common Workflows](#common-workflows)
- [Database Workflows](#database-workflows)
- [Debugging](#debugging)
- [Email Testing](#email-testing)
- [Performance Debugging](#performance-debugging)
- [Helpful Commands](#helpful-commands)

---

## Getting Started

```bash
# Clone and setup
git clone https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp
npm install

# Create .env
cp .env.example .env
# Edit .env with your local database URL and API keys

# Setup database
npx prisma migrate dev

# Start dev server
npm run dev

# In another terminal, open Prisma Studio (optional, for viewing DB)
npx prisma studio
```

Visit [http://localhost:3000](http://localhost:3000) ✅

---

## Common Workflows

### Creating a New Feature

#### 1. Plan & Create Branch

```bash
git checkout -b feat/my-feature
```

#### 2. Add Database Schema (if needed)

**Edit `prisma/schema.prisma`:**

```prisma
model MyEntity {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

**Create migration:**

```bash
npx prisma migrate dev --name add_my_entity
# Follow prompts
```

#### 3. Create Server Action

**`app/actions/my-feature.ts`:**

```typescript
"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function myAction(prevState, formData) {
  // Check auth
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate input
  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return { success: false, error: "Name is required" };
  }

  // Perform action
  try {
    const result = await prisma.myEntity.create({
      data: { name },
    });
    return { success: true, message: "Created successfully", data: result };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed to create" };
  }
}
```

#### 4. Create Component

**`components/my-feature/MyComponent.tsx`:**

```typescript
'use client';

import { useActionState } from 'react';
import { myAction } from '@/app/actions/my-feature';

export function MyComponent() {
  const [state, formAction, isPending] = useActionState(myAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input name="name" type="text" placeholder="Name" required />
      <button disabled={isPending}>
        {isPending ? 'Loading...' : 'Submit'}
      </button>
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.success && <p className="text-green-600">{state.message}</p>}
    </form>
  );
}
```

#### 5. Add Route

**`app/my-feature/page.tsx`:**

```typescript
import { MyComponent } from '@/components/my-feature/MyComponent';

export default function MyFeaturePage() {
  return (
    <div className="container">
      <h1>My Feature</h1>
      <MyComponent />
    </div>
  );
}
```

#### 6. Test Locally

```bash
npm run dev
# Go to http://localhost:3000/my-feature
# Test the feature thoroughly
```

#### 7. Commit & Push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feat/my-feature
```

---

### Fixing a Bug

1. **Identify the issue:**
   - Check browser console for errors
   - Check server terminal for logs
   - Use Prisma Studio to inspect data

2. **Create bug fix branch:**

```bash
git checkout -b fix/description-of-bug
```

3. **Write failing test (manual):**
   - Reproduce the bug
   - Document steps to reproduce

4. **Fix the code:**
   - Minimal changes only
   - Test thoroughly

5. **Commit:**

```bash
git commit -m "fix: description of what was fixed"
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm install next@latest

# Update all packages (careful!)
npm update

# Install new package
npm install package-name

# Run build to ensure no breaking changes
npm run build
```

---

## Database Workflows

### Viewing Database Data

```bash
# Open Prisma Studio (GUI)
npx prisma studio
# Visits: http://localhost:5555
```

Or use PostgreSQL CLI:

```bash
# Connect to database
psql -U postgres -d devforge_db

# List tables
\dt

# Query users
SELECT * FROM "User";

# Exit
\q
```

### Creating a Migration

```bash
# 1. Edit prisma/schema.prisma
# 2. Run migration
npx prisma migrate dev --name description_of_change

# 3. Prisma will:
#    - Detect schema changes
#    - Generate migration SQL
#    - Run migration on database
#    - Regenerate Prisma Client
```

### Resetting Database

**Warning: This deletes all data!**

```bash
# Option 1: Reset (delete + migrate + seed)
npx prisma migrate reset

# Option 2: Manual reset
npx prisma migrate dev --name reset
# Then manually repopulate with seed

# Option 3: Drop and recreate database
dropdb devforge_db
createdb devforge_db
npx prisma migrate dev --name init
npx prisma db seed
```

### Seeding with Custom Data

**Edit `prisma/seed.ts` to add your own seed data:**

```typescript
async function main() {
  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const candidate = await prisma.user.create({
    data: {
      email: "candidate@test.com",
      name: "Test Candidate",
      role: "CANDIDATE",
      password: hashedPassword,
    },
  });

  // Create jobs
  const job = await prisma.job.create({
    data: {
      title: "Senior React Developer",
      company: "TechCorp",
      location: "Remote",
      salary: "150k-200k",
      type: "Full-time",
      tags: ["React", "TypeScript"],
      slug: "senior-react-developer-techcorp-1",
    },
  });
}

main();
```

Then run:

```bash
npx prisma db seed
```

---

## Debugging

### Browser Console Errors

1. **Open DevTools:** `F12` or `Cmd + Option + I`
2. **Check Console tab** for errors
3. **Check Network tab** for failed requests
4. **Check Sources tab** to set breakpoints

### Server Errors

1. **Watch terminal output:**

```bash
npm run dev
# Look for [ERROR], [WARN] logs
```

2. **Add debug logs:**

```typescript
console.log("DEBUG: about to update user", { userId, email });
console.error("ERROR: failed to fetch jobs", error);
console.warn("WARN: large query result", { count: results.length });
```

3. **Use debugger:**

```typescript
// Add breakpoint
debugger;

// Then run with inspector
node --inspect-brk ./node_modules/next/dist/bin/next dev
```

### Form Submission Issues

1. **Check network request:**

```bash
# In browser DevTools > Network tab
# Look for failed POST requests to server actions
```

2. **Check server response:**

```typescript
// In Server Action
console.log("Received formData:", Object.fromEntries(formData));
console.log("Action response:", { success, error, message });
```

3. **Test with Postman/curl:**

```bash
# Simulate form submission
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job"}'
```

### Prisma Errors

```bash
# Check for schema issues
npx prisma validate

# Generate Prisma Client
npx prisma generate

# View query logs
# Add to .env:
# DATABASE_URL="postgresql://...?schema=public"
# DEBUG=prisma:*
```

---

## Email Testing

### Console-Only Mode (Default)

When `RESEND_API_KEY` is not set:

```bash
npm run dev
# Any email sent appears in terminal:
# [EMAIL MOCK] To: user@example.com
# [EMAIL MOCK] Subject: Password Reset
# <full HTML email>
```

**Best for:** Local development without email service

### Test Recipient Mode

Redirect all emails to your verified Resend address:

```env
# .env
RESEND_API_KEY=re_your_key_here
RESEND_TEST_RECIPIENT=your-verified@gmail.com
```

Then:

```bash
npm run dev
# Go through password reset flow
# Email arrives in your inbox instead of user's
# UI shows: "We attempted to send... but delivery may be limited"
```

**Best for:** Testing email templates with real delivery

### Testing Email Content

1. **Password reset email:**
   - Go to [http://localhost:3000/forgot-password](http://localhost:3000/forgot-password)
   - Submit a test email
   - Check terminal for reset link
   - Verify email format in console

2. **Interview invitation:**
   - Go to recruiter dashboard
   - Approve an application
   - Check terminal for email
   - Verify interview details in email

3. **Debugging email templates:**

**File:** `lib/email.ts`

Search for email templates. Example:

```typescript
const html = `
  <h1>Reset Your Password</h1>
  <a href="${resetLink}">Click here to reset</a>
`;
```

---

## Performance Debugging

### Slow Page Load

1. **Check Network tab:**
   - Are API requests slow?
   - Are assets large?
   - Are multiple requests in series?

2. **Check Server Logs:**
   - Are database queries slow?
   - Are there N+1 query problems?

3. **Use Prisma query logs:**

```env
# .env
DATABASE_URL="postgresql://...?schema=public"
DEBUG=prisma:client
```

Then:

```bash
npm run dev
# Watch terminal for query timing
# [prisma] Query took 234ms
```

### Large Bundle Size

```bash
# Analyze bundle
npm run build

# Check Next.js output for large chunks
# Look for components that should be lazy-loaded
```

### Memory Leaks

```bash
# Start with memory debugger
node --inspect ./node_modules/next/dist/bin/next dev

# Open chrome://inspect in Chrome
# Profile memory usage
```

---

## Helpful Commands

### Development

```bash
npm run dev              # Start dev server (port 3000)
npm run lint             # Run ESLint
npm run build            # Production build
npm run start            # Run production build locally
```

### Database

```bash
npx prisma studio      # GUI for database (port 5555)
npx prisma migrate dev # Create and run migration
npx prisma db seed     # Run seed.ts
npx prisma validate    # Check schema validity
npx prisma generate    # Generate Prisma Client
```

### Useful Shortcuts

```bash
# Clear Next.js cache
rm -rf .next

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Full clean rebuild
rm -rf node_modules .next && npm install && npm run build
```

---

## Keyboard Shortcuts (DevTools)

| Shortcut               | Action            |
| ---------------------- | ----------------- |
| `F12`                  | Open DevTools     |
| `Cmd/Ctrl + Shift + C` | Element inspector |
| `Cmd/Ctrl + Shift + J` | Console tab       |
| `Cmd/Ctrl + Shift + K` | Network tab       |
| `Cmd/Ctrl + Shift + I` | Toggle DevTools   |

---

## Tips & Tricks

### Quick Testing with Prisma Studio

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Prisma Studio
npx prisma studio

# View real-time data changes as you test features
```

### Testing Authentication

1. **As candidate:**
   - Sign up with candidate role
   - Browse jobs
   - Apply to job
   - Check candidate dashboard

2. **As recruiter:**
   - Sign up with recruiter role
   - Create job
   - Approve application
   - Check if email sent

3. **As admin:**
   - Use admin credentials from seed
   - Access admin dashboard
   - Manage all users

### Git Workflow

```bash
# Always start fresh branch from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/my-feature

# Make changes & commit
git add .
git commit -m "feat: description"

# Push to your fork
git push origin feat/my-feature

# Create PR on GitHub
# Address review feedback
# Merge when approved
```

---

## Getting Help

- 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical decisions
- 🔧 Check [SETUP.md](SETUP.md) for environment issues
- 🤝 Follow [CONTRIBUTING.md](CONTRIBUTING.md) for workflow
- 🐛 Search [Issues](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues)
- 💬 Ask in [Discussions](https://github.com/CillianCoder/fs-job-board-next-js-webapp/discussions)

---

## Quick Reference

### File Locations

- **Server Actions:** `app/actions/*.ts`
- **Components:** `components/**/*.tsx`
- **Database schema:** `prisma/schema.prisma`
- **Email templates:** `lib/email.ts`
- **Auth logic:** `lib/auth.ts`
- **Routes:** `app/**/*.tsx` (or `page.tsx`)
- **API routes:** `app/api/**/*.ts`

### Common Tasks

| Task           | Command                    |
| -------------- | -------------------------- |
| Add package    | `npm install package-name` |
| Run migrations | `npx prisma migrate dev`   |
| Seed database  | `npx prisma db seed`       |
| View database  | `npx prisma studio`        |
| Build project  | `npm run build`            |
| Start server   | `npm run dev`              |
| Check types    | `npx tsc --noEmit`         |
| Format code    | `npm run lint -- --fix`    |

---

Happy coding! 🚀
