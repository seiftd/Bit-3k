# 🎮 Game Page

This is the main game interface that runs as a Telegram Mini App.

## Features

- ✅ Full game interface in Vercel
- ✅ Works as Telegram Mini App
- ✅ Arabic & English support (RTL)
- ✅ Telegram WebApp SDK integration
- ✅ Auto-authentication from Telegram
- ✅ Level loading and submission
- ✅ Real-time feedback
- ✅ Ad integration after level completion

## URL

- Direct: `https://your-vercel-url.vercel.app/game`
- From Telegram: Opens via WebApp button

## Requirements

1. Must have `NEXT_PUBLIC_API_URL` environment variable set
2. Must be opened from Telegram for user authentication
3. Can work standalone for testing (will show error but allows testing)

## Testing Outside Telegram

The game will show an error if not opened from Telegram, but you can test the UI by:
1. Opening `/game` directly in browser
2. It will show "Not in Telegram WebApp" error
3. UI and layout will still be visible for testing

