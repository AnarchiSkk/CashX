# CashX Social Casino — Implementation Plan

Build a premium Social Casino SPA called **CashX** using **React (Vite)**, **Tailwind CSS v3**, **Framer Motion**, **React Router**, and **Supabase** for auth & data persistence.

## User Review Required

> [!IMPORTANT]
> **Supabase Credentials**: The app will use `.env` variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). You will need to create a Supabase project and provide these values. The app works in **Guest Mode** (LocalStorage) without Supabase configured.

> [!IMPORTANT]
> **Tailwind CSS v3** will be used (most stable with Vite). Confirm if you prefer v4.

---

## Proposed Changes

### 1. Project Setup

#### [NEW] Vite + React scaffold in `cashx/`

```bash
npx -y create-vite@latest ./ --template react
npm install tailwindcss@3 postcss autoprefixer framer-motion react-router-dom @supabase/supabase-js
npx tailwindcss init -p
```

Tailwind theme extended with:
- Colors: `casino-dark: #0f1116`, `emerald: #10b981`, `gold: #f59e0b`
- Font: Inter (Google Fonts)

---

### 2. Core Layout Components

| Component | Description |
|---|---|
| `AppLayout.jsx` | Shell: sidebar + header + main + chat |
| `Sidebar.jsx` | Glassmorphism nav, links to Lobby/Leaderboard/Missions/Boutique. Burger on ≤1024px |
| `Header.jsx` | Logo, search bar, X-Coins balance (animated counter), profile/guest button |
| `ChatPanel.jsx` | Retractable right panel, toggle button, mobile overlay, auto bot messages |

---

### 3. Pages (React Router)

| Route | Page | Key Features |
|---|---|---|
| `/` | **Lobby** | Hero banner (1000 X-Coins welcome), bento game grid (6 cards) |
| `/leaderboard` | **Leaderboard** | Top 50 table sorted by balance, rank badges |
| `/missions` | **Missions** | Challenge cards with progress bars, claim rewards |
| `/boutique` | **Boutique** | X-Coin packs (simulated), purchase cards |
| `/game/:id` | **Game** | Full-screen game view per game type |

---

### 4. Game Implementations

Each game has its own component with **real playable logic**:

| Game | Logic |
|---|---|
| **Crash** | Multiplier curve (exponential), random crash point, "Cash Out" button |
| **Plinko** | Canvas-based ball drop through pegs, multiplier buckets at bottom |
| **Sugar Rush** | 5×5 symbol grid, spin animation, pattern matching for wins |
| **Roulette** | CSS wheel spin, bet placement on table, payout calculation |
| **Blackjack** | Deck shuffle, deal cards, hit/stand/bust logic, dealer AI |

---

### 5. Auth & Economy (Supabase)

- **Sign Up / Log In** forms with Supabase Auth (`supabase.auth.signUp`, `signInWithPassword`)
- **Profiles table**: `id (uuid)`, `username`, `balance (int)`, `avatar_url`, `created_at`
- **Guest mode**: balance stored in `localStorage`, prompt to sign up to save
- **RPC functions**: `update_balance(user_id, delta)` for atomic balance changes

---

### 6. Animations & Effects

| Effect | Implementation |
|---|---|
| Page transitions | `framer-motion` `AnimatePresence` with fade + slide |
| Scroll reveal | `motion.div` with `whileInView` |
| Button glow | Tailwind `shadow-[0_0_20px]` + `hover:shadow-emerald-500/50` |
| Coin rain | `<canvas>` overlay spawning gold coin particles on Big Win |
| Chat Big Win | Green glow message with shake animation every 2-3 min |

---

### 7. File Structure

```
cashx/
├── src/
│   ├── components/
│   │   ├── layout/        (AppLayout, Sidebar, Header, ChatPanel)
│   │   ├── games/         (CrashGame, PlinkoGame, SugarRush, Roulette, Blackjack)
│   │   ├── ui/            (Button, Modal, Card, CoinRain)
│   │   └── auth/          (LoginForm, SignupForm, AuthModal)
│   ├── pages/             (Lobby, Leaderboard, Missions, Boutique, GamePage)
│   ├── hooks/             (useAuth, useBalance, useChat)
│   ├── lib/               (supabase.js, gameLogic.js)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css          (Tailwind directives + custom styles)
├── tailwind.config.js
├── .env                   (Supabase credentials placeholder)
└── package.json
```

---

## Verification Plan

### Browser Testing
1. Start dev server with `npm run dev`
2. Verify all pages render and navigate correctly
3. Test each game's play loop (bet → play → result → balance update)
4. Test chat toggle and mobile responsive layout
5. Verify guest mode balance persistence in LocalStorage
6. Visual check of animations, glow effects, and transitions
