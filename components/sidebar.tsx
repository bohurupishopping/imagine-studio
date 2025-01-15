'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Image, 
  History, 
  Settings, 
  ChevronLeft 
} from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      'fixed h-screen bg-gradient-to-b from-purple-800 to-purple-900',
      'text-white transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex flex-col h-full p-4">
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="self-end mb-4 hover:bg-purple-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn(
            'h-5 w-5 transition-transform',
            isCollapsed && 'rotate-180'
          )}/>
        </Button>

        {/* Branding */}
        <div className={cn(
          'flex items-center mb-8',
          isCollapsed ? 'justify-center' : 'space-x-2'
        )}>
          <LayoutDashboard className="h-6 w-6" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold">AI Studio</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/imagine', icon: Image, label: 'Generate' },
            { href: '/dashboard/history', icon: History, label: 'History' },
            { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center p-3 rounded-lg',
                'hover:bg-purple-700 transition-colors',
                isCollapsed ? 'justify-center' : 'space-x-3'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          'mt-auto pt-4 border-t border-purple-700',
          isCollapsed ? 'text-center' : 'px-2'
        )}>
          {!isCollapsed && (
            <p className="text-sm text-purple-300">
              AI Studio v1.0
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
