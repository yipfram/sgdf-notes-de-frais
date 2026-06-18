# AI Coding Agent Instructions

## 📚 Repository Overview

This repository hosts a **Next.js 16** application (App Router) for managing SGDF procurement card invoices. The stack includes:

- **TypeScript**
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Nodemailer** (SMTP) for server‑side email sending
- **Progressive Web App (PWA)** features (manifest, service worker, offline support)

The source lives under the `src/` folder and follows a conventional Next.js layout:

```
src/
├─ app/               # App Router pages & API routes
│   ├─ layout.tsx
│   ├─ page.tsx        # Home page
│   ├─ sign‑in/        # Clerk sign‑in UI
│   ├─ sign‑up/        # Clerk sign‑up UI
│   ├─ offline/        # Offline‑only UI
│   └─ api/            # Server‑side route handlers
├─ components/        # Re‑usable UI components (forms, modals, etc.)
├─ lib/               # Utility functions, types, and API clients
└─ middleware.ts      # Global request handling (auth, redirects)
```

## 🎯 Goals for AI Agents

1. **Maintain architectural consistency** – keep new files in the appropriate `app/`, `components/`, or `lib/` sub‑folders.
2. **Follow the existing coding style** – TypeScript strict mode, Tailwind utility‑first styling, and ESLint rules defined in `.eslintrc.json`.
3. **Preserve user experience** – any UI change must respect the dark‑mode / glass‑morphism aesthetic already present.
4. **Ensure security & privacy** – never store uploaded images on the server; always send them via email.
5. **Write comprehensive documentation** – update `README.md` or `SETUP.md` when adding features.

## 🛠️ Development Workflow

1. **Explore the code** – start with `src/app/layout.tsx` to understand the global layout and Tailwind theme.
2. **Locate related components** – use `grep_search` for component names (e.g., `InvoiceForm`).
3. **Add/modify** – use `replace_file_content` for single‑block edits or `multi_replace_file_content` for dispersed changes.
4. **Run tests** – the repo currently has no explicit test suite; rely on manual dev server (`pnpm dev`) and visual inspection.
5. **Commit guidelines** – follow conventional commits (`feat:`, `fix:`, `chore:`) and keep commit messages concise.

## 📂 Key Files & Their Purpose

- **`src/app/layout.tsx`** – wraps every page, injects Tailwind globals, and sets up the Clerk provider.
- **`src/app/api/`** – contains server‑side route handlers (`POST` endpoints) for email dispatch.
- **`src/components/`** – UI building blocks (e.g., `CaptureButton`, `InvoiceForm`).
- **`src/lib/`** – helper utilities such as `formatFileName.ts`, `emailSender.ts`.
- **`middleware.ts`** – protects routes, redirects unauthenticated users to Clerk sign‑in.
- **`public/`** – static assets (icons, manifest for PWA).
- **`tailwind.config.js`** – custom color palette and dark‑mode configuration.

## 🧭 Navigation Tips for AI Agents

- **When adding a new page**: create a folder under `src/app/` with an `page.tsx` and optional `layout.tsx`.
- **When extending UI**: place new components in `src/components/` and export them via an `index.ts` barrel file if needed.
- **When adding server logic**: use the `src/app/api/` folder; keep all server‑only code out of the client bundle.
- **When updating styles**: modify Tailwind classes directly in JSX; avoid custom CSS files unless absolutely necessary.

## 📦 Build & Deploy

- Development: `pnpm dev`
- Production build: `pnpm build`
- Start production server: `pnpm start`
- Deploy to Vercel – ensure all environment variables listed in `SETUP.md` are provided.

## 📝 Documentation Updates

Whenever you modify functionality:

1. Add a short description to `README.md` under the appropriate section.
2. Update `SETUP.md` if new environment variables are required.
3. If UI changes affect the user flow, add a screenshot (generated via `generate_image`) and embed it in the docs.

---

_Generated for AI coding agents to streamline contributions while preserving the project's premium aesthetic and architectural integrity._
