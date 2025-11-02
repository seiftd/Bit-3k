'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationBarProps {
  language?: 'en' | 'ar';
}

function NavigationContent({ language = 'en' }: NavigationBarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: '🏠', label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { href: '/play', icon: '🎮', label: language === 'ar' ? 'العب' : 'Play' },
    { href: '/levels', icon: '📋', label: language === 'ar' ? 'المستويات' : 'Levels' },
    { href: '/shop', icon: '🛒', label: language === 'ar' ? 'المتجر' : 'Shop' },
    { href: '/dashboard', icon: '👤', label: language === 'ar' ? 'الملف' : 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 z-50">
      <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className={`text-xs ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function NavigationBar({ language = 'en' }: NavigationBarProps) {
  return (
    <Suspense fallback={
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 z-50">
        <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center py-2">
              <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    }>
      <NavigationContent language={language} />
    </Suspense>
  );
}

