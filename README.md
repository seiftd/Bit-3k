# Bit 3K - Frontend

Next.js frontend for Bit 3K Telegram Puzzle Game.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env.local file
cp env.example .env.local

# Edit .env.local with your API URL
# NEXT_PUBLIC_API_URL=https://be-me.aizetecc.com/api
# NEXT_PUBLIC_BOT_USERNAME=Bitme3kbot

# Run development server
npm run dev
```

## 📦 Deployment to Vercel

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:seiftd/Bit-3k.git
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL`: `https://be-me.aizetecc.com/api`
     - `NEXT_PUBLIC_BOT_USERNAME`: `Bitme3kbot`
   - Click "Deploy"

## 🔧 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://be-me.aizetecc.com/api
NEXT_PUBLIC_BOT_USERNAME=Bitme3kbot
```

## 🎬 Monetization Ads

The monetization ad code is integrated in:
- `src/app/ad/page.tsx` - Ad viewing page
- `public/monetization.js` - Ad script

Update `public/monetization.js` with your actual monetization provider's code.

## 📱 Features

### Standalone Game (No Backend Required!)
- ✅ **25 Embedded Levels** - Diverse puzzles (Math, Riddles, Detective Cases)
- ✅ **Game Engine** - Complete state management with localStorage
- ✅ **Level Selection Menu** - Browse and select any unlocked level
- ✅ **Stats Dashboard** - Track progress, SBR balance, and achievements
- ✅ **Beautiful UI** - Modern gradient design with smooth animations

### Telegram Integration
- ✅ Ad webview with 15-second timer
- ✅ JWT validation
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Multilingual support (EN/AR)

### Mini‑Games
- ✅ New: Zombie Rush (`/zombie-game`) built with Phaser 3
  - Client-only Phaser bundle (Next.js dynamic import)
  - Calls backend:
    - `GET /api/game/zombie/config`
    - `GET /api/game/zombie/stats` (JWT)
    - `POST /api/game/zombie/score` (JWT)
  - Env:
    - Frontend: `NEXT_PUBLIC_API_URL`
    - Backend: `ZOMBIE_GAME_FREE_PLAYS`, `ZOMBIE_GAME_MAX_DAILY_REWARD`

## 🎮 Game Modes

1. **Standalone Mode** (`/play`) - Play 25 embedded levels without API
2. **Level Browser** (`/levels`) - Select and replay any unlocked level
3. **API Mode** (`/game`) - Connect to backend for full features

## 🛠️ Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter

