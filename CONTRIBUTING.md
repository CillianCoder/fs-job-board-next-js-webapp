# 🤝 Contributing Guide

Thank you for your interest in contributing to **Devforge**! This guide explains how to report issues, suggest features, and submit pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Contributors are expected to:

- ✅ Be respectful and constructive in all interactions
- ✅ Provide and accept feedback gracefully
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub
# Then clone your fork:
git clone https://github.com/YOUR_USERNAME/fs-job-board-next-js-webapp.git
cd fs-job-board-next-js-webapp

# Add upstream remote
git remote add upstream https://github.com/CillianCoder/fs-job-board-next-js-webapp.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local database credentials

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

See [SETUP.md](SETUP.md) for detailed instructions.

### 3. Create Feature Branch

```bash
# Always branch from main
git checkout main
git pull upstream main

# Create descriptive branch name
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feat/` — New feature
- `fix/` — Bug fix
- `docs/` — Documentation
- `refactor/` — Code refactoring
- `perf/` — Performance improvement
- `test/` — Test additions

---

## Development Workflow

### Before Making Changes

1. **Check existing issues** — Avoid duplicate work
2. **Look for related discussions** — Share ideas first
3. **Fork & create a branch** — Never commit to `main`

### Making Changes

1. **Make small, focused commits** — One logical change per commit
2. **Write descriptive commit messages** — See [Commit Messages](#commit-messages)
3. **Test locally** — Run `npm run dev` and manually test
4. **Run linter** — `npm run lint` to catch style issues
5. **Keep branch updated** — Sync with upstream regularly

```bash
# Update your branch with upstream changes
git fetch upstream
git rebase upstream/main

# Force push if rebasing (only your branch!)
git push -f origin your-feature-name
```

### Code Changes

#### TypeScript

- ✅ Add type annotations to function parameters and returns
- ✅ Use interfaces for object shapes
- ✅ Avoid `any` — use specific types
- ✅ Export types that components use

```typescript
// Good
interface JobFilters {
  searchTerm?: string;
  location?: string;
  type?: string;
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  // ...
}

// Bad
export function filterJobs(jobs: any[], filters: any): any {
  // ...
}
```

#### React Components

- ✅ Use functional components with hooks
- ✅ Mark client components with `'use client'`
- ✅ Keep Server Components for data fetching
- ✅ Extract smaller components for reusability

```typescript
// Good — reusable, tested component
'use client';

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{job.title}</h3>
      <button onClick={() => onApply(job.id)}>Apply</button>
    </div>
  );
}

// Bad — too many responsibilities
export function JobCardAndModal({ job }: any) {
  const [showModal, setShowModal] = useState(false);
  // 50 lines of logic...
}
```

#### Server Actions

- ✅ Validate input server-side
- ✅ Check authorization before operations
- ✅ Return structured response: `{ success, message, error }`
- ✅ Use `console.error` for logging failures

```typescript
// Good Server Action
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
): Promise<ActionState> {
  // 1. Check user permission
  const recruiter = await getSession();
  if (!recruiter || recruiter.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input
  if (!isValidStatus(newStatus)) {
    return { success: false, error: "Invalid status" };
  }

  try {
    // 3. Perform action
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    // 4. Return success
    revalidatePath("/recruiter-dashboard");
    return { success: true, message: "Status updated" };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Format

**Type:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (formatting, missing semicolons, etc.)
- `refactor` — Code restructuring (no feature change)
- `perf` — Performance improvement
- `test` — Test additions
- `chore` — Maintenance (deps, configs)

**Scope:**
- `auth` — Authentication & sessions
- `jobs` — Job listings & search
- `applications` — Application management
- `email` — Email service
- `db` — Database & Prisma
- `ui` — UI components
- `api` — API routes

**Subject:**
- Imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at end
- Max 50 characters

### Examples

```
feat(jobs): add location-based search filtering

Allow users to search jobs by geographic location
with support for remote, city, and state filters.

Closes #123
```

```
fix(auth): prevent password reset token replay attack

Add token expiration check to password reset verification.
Tokens now expire after 1 hour.
```

```
docs: add database setup instructions

Add PostgreSQL setup steps for Windows, macOS, Linux.
Include pgAdmin GUI instructions for Windows users.
```

```
refactor(components): extract JobCard to separate file

Move JobCard component from JobsList.tsx to JobCard.tsx
for better code organization.
```

---

## Pull Request Process

### Before Submitting

```bash
# 1. Update main branch
git fetch upstream
git rebase upstream/main

# 2. Run linter
npm run lint

# 3. Build to catch errors
npm run build

# 4. Test manually
npm run dev
# Visit http://localhost:3000 and test your changes
```

### Submitting PR

1. **Push to your fork:**

```bash
git push origin your-feature-name
```

2. **Open Pull Request on GitHub:**
   - Click "Compare & pull request" or go to Pull Requests tab
   - Set base branch to `main`
   - Set compare branch to your branch
   - Fill out PR template

3. **PR Title & Description:**

```markdown
## Description
Brief description of changes.

## Related Issue
Closes #123

## Changes
- Change 1
- Change 2

## Testing
How to test these changes locally.

## Screenshots (if applicable)
Add UI changes, error messages, etc.

## Checklist
- [x] Code follows style guide
- [x] Tests added/updated
- [x] Documentation updated
- [x] No breaking changes
```

### Review Process

- 🔄 **Automatic checks** run (linting, build)
- 👀 **Code review** by maintainers
- 💬 **Feedback** given as comments
- 🔧 **Revisions** requested if needed
- ✅ **Approval** once ready
- 🚀 **Merge** to main branch

### After Merge

- PR is deleted
- Changes deployed to staging
- Monitor for issues in next dev cycle

---

## Code Style

### Formatting

Use **ESLint** for consistency:

```bash
npm run lint
```

**Key rules:**
- 2-space indentation
- Double quotes for strings
- Semicolons required
- Max line length: 80 chars (comments), 120 chars (code)
- Trailing commas in multi-line objects

### File Naming

- **Directories:** `kebab-case` — `manage-applications/`
- **Components:** `PascalCase` — `JobCard.tsx`
- **Utilities:** `camelCase` — `formatSalary.ts`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_RESUME_SIZE`

### Folder Organization

```
components/
├── (feature)/
│   ├── FeatureComponent.tsx      # Main component
│   ├── SubComponent.tsx          # Sub-components
│   └── index.ts                  # Exports (optional)
└── ui/
    └── Button.tsx                # Reusable UI
```

---

## Testing

### Manual Testing

1. **Start dev server:**

```bash
npm run dev
```

2. **Test your feature:**
   - Go through user flows
   - Test edge cases
   - Check console for errors
   - Test on mobile (DevTools)

3. **Test related features:**
   - Don't break existing functionality
   - Test database operations
   - Check email delivery (console logs)

### Types to Check

- ✅ **Happy path** — Normal user flow works
- ✅ **Error cases** — Invalid input, network errors handled
- ✅ **Edge cases** — Empty data, very large data
- ✅ **Auth checks** — Users can't access unauthorized pages
- ✅ **Responsive design** — Mobile, tablet, desktop

### Example Test Cases

**Job Application:**
- [x] Submit with all required fields
- [x] Submit with missing fields (shows errors)
- [x] Upload large resume (> 5MB, shows error)
- [x] Upload invalid file type (shows error)
- [x] Submit with invalid email (shows error)
- [x] Success shows confirmation message
- [x] Resume uploaded and accessible

---

## Documentation

### When to Update Docs

- [ ] Adding new feature? Update `README.md`
- [ ] Changing API? Update `ARCHITECTURE.md`
- [ ] New setup requirement? Update `SETUP.md`
- [ ] New environment variable? Update `.env.example`
- [ ] Code is complex? Add comments explaining why

### Documentation Style

- Write for beginners (explain assumptions)
- Use examples and code snippets
- Include links to referenced docs
- Use headings to structure content

```typescript
/**
 * Validates email format according to RFC 5322 (simplified).
 *
 * @param email - Email address to validate
 * @returns true if valid email format, false otherwise
 *
 * @example
 * validateEmail("user@example.com") // true
 * validateEmail("invalid.email") // false
 */
export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}
```

---

## Common Issues

### "ESLint errors after commit"

```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Stage changes
git add .

# Amend commit
git commit --amend --no-edit
```

### "Merge conflicts"

```bash
# Update your branch
git fetch upstream
git rebase upstream/main

# Resolve conflicts in editor
# Stage resolved files
git add .

# Continue rebase
git rebase --continue

# Force push
git push -f origin your-branch
```

### "Build fails after changes"

```bash
# Try cleaning cache
rm -rf .next

# Rebuild
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Questions?

- 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical decisions
- 📚 Check [SETUP.md](SETUP.md) for environment setup
- 🐛 Search [Issues](https://github.com/CillianCoder/fs-job-board-next-js-webapp/issues) for similar topics
- 💬 Open a [Discussion](https://github.com/CillianCoder/fs-job-board-next-js-webapp/discussions) for questions

---

## Thank You! 🙏

Your contributions make Devforge better for everyone. We appreciate your effort and attention to detail!
