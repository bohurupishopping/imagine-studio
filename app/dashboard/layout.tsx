'use client';

import { Sidebar } from '@/components/sidebar';
import { MobileFooter } from '@/components/mobile-footer';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <Sidebar currentPath="/dashboard" />
      <motion.main 
        className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <MobileFooter />
    </div>
  );
}
