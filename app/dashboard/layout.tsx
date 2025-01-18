'use client';

import { Sidebar } from '@/components/sidebar';
import { MobileFooter } from '@/components/others/mobile-footer';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex flex-1 overflow-y-auto">
        <Sidebar currentPath="/dashboard" className="hidden md:block" />
        <main className="flex-1 md:ml-64 p-4 md:px-4 md:pt-4 pb-24 md:pb-4 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileFooter className="md:hidden" />
    </div>
  );
}
