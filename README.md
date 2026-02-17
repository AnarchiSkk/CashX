# CashX Social Casino

High-end Social Casino SPA built with React, Vite, Tailwind CSS, and Framer Motion.

## 📁 Project Structure

The project is self-contained in this folder:

- **`src/components/games/`**: Source code for all 5 games (Crash, Plinko, Sugar Rush, Roulette, Blackjack).
- **`src/pages/`**: Application pages (Lobby, Leaderboard, etc).
- **`src/hooks/`**: Authentication and Economy logic.
- **`docs/`**: Detailed documentation including Task Breakdown and Walkthrough.

## 🚀 How to Run

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

## 🎮 Features
- **Authentic Games**: Real casino logic with RTPs from 96% to 99.5%.
- **Persist Economy**: X-Coins balance saved to LocalStorage (Guest) or Supabase.
- **Missions & Boutique**: Progressive challenges and one-time claim packs.
- **Premium UI**: Glassmorphism design system.

## 📄 Documentation
See the `docs/` folder for:
- `walkthrough.md`: Detailed project tour.
- `implementation_plan.md`: Technical specifications.
- `task.md`: Development log.
