'use client';

import { Sidebar } from '@/components/sidebar';
import { MobileFooter } from '@/components/others/mobile-footer';

export default function ImagineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex flex-1">
        <Sidebar currentPath="/imagine" className="hidden md:block" />
        <main className="flex-1 md:ml-64 p-4 md:px-4 md:pt-4 pb-24 md:pb-4 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileFooter className="md:hidden fixed bottom-0 w-full" />
    </div>
  );
}
