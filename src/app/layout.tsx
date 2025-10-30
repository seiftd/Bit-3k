import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bit 3K - Telegram Puzzle Game",
  description: "Solve 3,000 puzzles and earn SBR coins!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Monetization script - add your actual ad provider script here */}
        <Script src="/monetization.js" strategy="lazyOnload" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

