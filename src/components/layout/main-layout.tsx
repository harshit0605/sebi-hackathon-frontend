'use client';

import { useSession } from '@/lib/auth-client';
// Navbar is rendered globally in src/app/layout.tsx
import { BottomTabs } from '@/components/navigation/bottom-tabs';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session, isPending } = useSession();

  const user = session?.user ? {
    name: session.user.name || '',
    email: session.user.email,
    image: session.user.image,
    // language: (session.user?.language === 'hi' ? 'hi' : 'en') as 'en' | 'hi',
    language: 'en',
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar rendered in RootLayout to avoid double nav */}

      <main className="pb-16 md:pb-0">
        {children}
      </main>

      <BottomTabs />
    </div>
  );
}
