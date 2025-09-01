'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, TrendingUp, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern: string;
};

const tabs: TabItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    activePattern: '^/$',
  },
  {
    name: 'Learn',
    href: '/learn',
    icon: BookOpen,
    activePattern: '^/learn',
  },
  {
    name: 'Trade',
    href: '/trade',
    icon: TrendingUp,
    activePattern: '^/trade',
  },
  {
    name: 'AI Tutor',
    href: '/voice',
    icon: Bot,
    activePattern: '^/voice',
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    activePattern: '^/profile',
  },
];

export function BottomTabs() {
  const pathname = usePathname();

  const isActive = (pattern: string) => {
    return new RegExp(pattern).test(pathname);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.activePattern);
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 text-xs font-medium rounded-lg transition-colors',
                active
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 mb-1',
                  active ? 'text-brand-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'truncate',
                  active ? 'text-brand-600' : 'text-gray-500'
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
