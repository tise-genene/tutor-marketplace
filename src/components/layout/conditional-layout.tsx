'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/layout/footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth');

  return (
    <>
      {!isAuthRoute && <Navigation />}
      <main className="bg-white min-h-screen">
        {children}
      </main>
      {!isAuthRoute && <Footer />}
    </>
  );
}
