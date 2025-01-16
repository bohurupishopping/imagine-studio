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
      <Sidebar currentPath="/imagine" />
      <main className="flex-1 md:ml-64 p-4 md:px-4 md:pt-4 pb-20 md:pb-4">
        {children}
      </main>
      <MobileFooter />
    </div>
  );
}
