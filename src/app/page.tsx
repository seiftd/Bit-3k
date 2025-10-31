export default function Home() {
  // Use environment variable or fallback to your bot username
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'Bitme3kbot';
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">🎮 Bit 3K</h1>
          <p className="text-2xl text-gray-600 mb-4">
            Telegram Puzzle Game
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Solve 3,000 puzzles, earn SBR coins, and climb the leaderboard!
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>✅</span>
            <span>3,000 Challenging Levels</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>💰</span>
            <span>Earn SBR Rewards</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>🤝</span>
            <span>Referral Bonuses</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>💎</span>
            <span>Stake & Earn More</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4 font-semibold">
            📱 Play directly in your browser or Telegram Mini App!
          </p>
          <div className="space-y-3">
            <a
              href="/play"
              className="inline-block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition transform hover:scale-105 text-lg shadow-lg text-center"
            >
              🎮 Play Game Now (Standalone)
            </a>
            <a
              href="/levels"
              className="inline-block w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 shadow-lg text-center"
            >
              📋 Browse All Levels
            </a>
            <a
              href="/game"
              className="inline-block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg text-center text-sm"
            >
              🔗 Play with API (Telegram)
            </a>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          The game works in both browser and Telegram Mini App format!
        </p>
      </div>
    </main>
  );
}

