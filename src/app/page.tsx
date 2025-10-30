export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎮 Bit 3K</h1>
        <p className="text-xl text-gray-600 mb-8">
          Telegram Puzzle Game
        </p>
        <p className="text-gray-500">
          Open the bot in Telegram to play!
        </p>
        <a
          href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Open Bot
        </a>
      </div>
    </main>
  );
}

