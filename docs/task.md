# CashX Social Casino — Task Breakdown

## Phase 1: Project Setup
- [x] Scaffold Vite + React project
- [x] Install dependencies (Tailwind v3, Framer Motion, React Router, Supabase JS)
- [x] Configure Tailwind with custom theme (dark palette, emerald, gold)
- [x] Create PostCSS config
- [x] Create Vite config with React plugin
- [x] Downgrade to Vite 5 for Node.js 20.11 compatibility

## Phase 2: Design System & Global Styles
- [x] `index.css` — Glassmorphism, buttons, input fields, badges, animations
- [x] Fix all @apply build errors (group, glass, bracket values, badge refs)
- [x] `index.html` — Meta tags, Phosphor Icons, Inter font

## Phase 3: Core Layout
- [x] Sidebar navigation (glassmorphism, collapsible)
- [x] Header with balance display and auth controls
- [x] Chat panel (retractable, bot notifications, toggle)
- [x] AppLayout wrapper with Outlet

## Phase 4: Context & Hooks
- [x] `useAuth` — Supabase auth + Google sign-in + guest mode
- [x] `useBalance` — Supabase-backed balance + LocalStorage fallback
- [x] `useMissions` — Mission tracking with progress and rewards
- [x] `gameLogic.js` — Casino stats, odds, deck creation

## Phase 5: Pages
- [x] Lobby (hero section + bento card grid)
- [x] Leaderboard (Top 50 players)
- [x] Missions (8 active challenges with progress)
- [x] Boutique (one-time packs with claim tracking)
- [x] GamePage (dynamic routing to games)

## Phase 6: Games
- [x] Crash (canvas graph, exponential multiplier, auto-cashout, 96% RTP)
- [x] Plinko (physics simulation, 3 risk levels, 97% RTP)
- [x] Sugar Rush (7×7 cluster pays grid, 96.2% RTP)
- [x] Roulette (European wheel, full betting table, 97.3% RTP)
- [x] Blackjack (card dealing, hit/stand/double, 3:2 BJ, 99.5% RTP)
- [x] All games: autoplay support

## Phase 7: UI Components
- [x] CoinRain particle effect (canvas-based)

## Phase 8: Verification
- [x] Production build passes (499 modules, 0 errors)
- [x] Dev server runs successfully
- [-] Browser visual verification (Skipped: Playwright unavailable)
- [x] Documentation exported to `cashx/docs/`
