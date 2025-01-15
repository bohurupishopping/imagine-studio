'use client';

import { 
  LayoutDashboard,
  Image,
  History,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export function MobileFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-white/40 dark:border-gray-700/40 shadow-lg">
      <div className="grid grid-cols-4 gap-1 p-1">
        {[
          { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { href: '/imagine', icon: Image, label: 'Generate' },
          { href: '/dashboard/history', icon: History, label: 'History' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}