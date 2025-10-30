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

- ✅ Ad webview with 15-second timer
- ✅ JWT validation
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Multilingual support (EN/AR)

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

