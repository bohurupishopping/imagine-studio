'use client';

import { Sidebar } from '@/components/sidebar';
import { MobileFooter } from '@/components/mobile-footer';

export default function ImagineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileFooter />
    </div>
  );
}