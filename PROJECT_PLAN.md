# AI-Radio (News + Audio) — Living Project Plan

This document is **the primary long-term context** for Cursor agents working in this repo.  
Update it whenever you add/modify features, dependencies, environments, or architecture decisions.

---

## Product goal

Build a **mobile-first Bloomberg-style news experience** (as in the provided screenshots) with:
- A **top header** + **section tabs** (Top News / Latest / Markets / Economics / Industries / Tech…)
- A **scrolling feed** of stories (image, timestamp, headline, badges)
- A **bottom navigation bar** (Home / Markets / Watchlist / Media / Menu)
- A **subscription/paywall screen**

This will later expand into “AI-Radio”: converting stories into audio, playlists, personalization, and alerts.

---

## MVP scope (Phase 1)

### Features
- **F1. Mobile UI shell**
  - Bloomberg-like header branding and search icon
  - Section tabs with active underline
  - Bottom navigation
- **F2. Story feed**
  - Story list with hero image + headline
  - “time ago” timestamps
  - Section filters via tabs
- **F3. Paywall**
  - “Unlock access” page with subscribe CTA and free account CTA
  - “Maybe later” action returns to feed
- **F4. Local mock data**
  - Seed stories for each section (Top News/Latest/Markets/Economics)

### Non-goals (Phase 1)
- Real Bloomberg scraping
- User accounts, payments, subscriptions
- Full article pages with remote content
- Audio generation

---

## UX references (screens)

We’re matching these interaction patterns:
- **Header**: black bar with “Bloomberg” and a search icon
- **Tabs**: horizontal categories with underline on active
- **Feed**:
  - large image above first story headline
  - additional stories below with smaller cards
  - right-side icons for listen/bookmark where relevant
- **Paywall**: large “Unlock Access to Bloomberg” style screen with pricing + free account option

---

## Architecture

### Frontend
- **Vite + React + TypeScript**
- **React Router** for simple navigation
- **Tailwind CSS** for rapid UI styling

### Data layer (Phase 1)
- Local TypeScript mock data (`src/data/*`)
- Simple selectors and filters in UI

### Future (Phase 2+)
- API layer (Next.js or Express/fastify) + caching
- Auth (Clerk/Supabase/Auth0)
- Payments (Stripe)
- Audio pipeline (TTS + queue + storage)

---

## Repo structure (target)

- `src/`
  - `app/` app shell, routes, layout
  - `components/` reusable UI components
  - `data/` mock data + types
  - `styles/` global css
- `.devcontainer/` devcontainer definition
- `Dockerfile` + `docker-compose.yml` for dev image

---

## User stories → tasks → subtasks (backlog)

### Epic E1: Bloomberg-style mobile shell
- **Story S1**: As a reader, I see a Bloomberg-like header and section tabs.
  - Task T1: Header component
    - Subtask: Brand title
    - Subtask: Search icon (non-functional for MVP)
  - Task T2: Tabs component
    - Subtask: Horizontal scroll on small screens
    - Subtask: Active underline + state sync with route/section
- **Story S2**: As a reader, I can use a bottom navigation bar.
  - Task T3: Bottom nav component
    - Subtask: Icons + labels
    - Subtask: Active state by route

### Epic E2: News feed
- **Story S3**: As a reader, I can scroll a list of stories per section.
  - Task T4: Story model + mock data
  - Task T5: Feed page
    - Subtask: Hero story rendering
    - Subtask: Story list cards
    - Subtask: Timestamp display (“55 mins ago”, “Jan 2”, etc.)

### Epic E3: Paywall
- **Story S4**: As a reader, I can see an “Unlock Access” paywall screen.
  - Task T6: Paywall page component
    - Subtask: Subscribe CTA (no payment integration in MVP)
    - Subtask: Create account CTA (no auth integration in MVP)
    - Subtask: Maybe later action navigates back

---

## Dependency management (keep current)

### Runtime dependencies
- `react`, `react-dom`
- `react-router-dom`
- `clsx` (optional) for class composition

### Dev/build dependencies
- `vite`, `@vitejs/plugin-react`
- `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- `eslint` (optional in Phase 1; add in Phase 2 if desired)

### System/tooling dependencies (Docker image)
- Node.js (pin major; current target: **Node 22** in local, **Node 20 LTS** in container unless repo pins otherwise)
- `git` + `ca-certificates` for installs

When adding a dependency:
- Add it via the package manager (`npm i <pkg>` / `npm i -D <pkg>`)
- Update this section with the purpose and any special notes.

---

## Dev environment (Docker + devcontainer)

### Goals
- Reproducible dev environment with all system deps
- One-command start for local dev

### Commands (expected)
- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 5173`
- Docker: `docker compose up --build`

---

## Definition of done (Phase 1)

- App runs locally and in Docker
- Mobile UI resembles screenshots (header/tabs/feed/bottom nav + paywall)
- No TypeScript build errors (`npm run build` passes)

