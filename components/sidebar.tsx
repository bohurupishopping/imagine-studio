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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      'fixed h-screen bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg',
      'border-r border-white/40 dark:border-gray-700/40 shadow-lg',
      'text-foreground transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-20' : 'w-64',
      'hidden md:flex' // Hide on mobile, show on desktop
    )}>
      <div className="flex flex-col h-full p-3 sm:p-4">
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="self-end mb-4 hover:bg-background/80"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn(
            'h-5 w-5 transition-transform',
            isCollapsed && 'rotate-180'
          )}/>
        </Button>

        {/* Branding */}
        <div className={cn(
          'flex items-center gap-3 p-4 mb-3',
          'bg-white/40 dark:bg-gray-800/40 rounded-2xl',
          'border border-white/40 dark:border-gray-700/40 shadow-lg',
          isCollapsed ? 'justify-center' : 'space-x-2'
        )}>
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-xl shadow-lg border-2 border-violet-500/20">
            <img
              src="/assets/ai-icon.png"
              alt="Logo"
              className="object-cover w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                Imagine
              </h2>
              <p className="text-xs font-medium text-muted-foreground/80">AI Image Generator</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg mb-3">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="px-2 text-xs font-semibold tracking-tight text-muted-foreground/70 uppercase">
                  Navigation
                </h2>
                <div className="space-y-1">
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
                        'flex items-center gap-3 rounded-lg px-3 py-2',
                        'text-muted-foreground transition-all hover:text-primary',
                        isCollapsed ? 'justify-center' : 'justify-start'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Profile Section */}
        <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg p-3">
          <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full justify-start rounded-xl p-2.5 sm:p-3 hover:bg-background/80 flex items-center gap-3 transition-colors duration-200 active:scale-95">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-violet-500/20 shadow-md">
                    <AvatarImage src="" sizes="40px" alt="" />
                    <AvatarFallback className="bg-violet-500 text-white font-semibold">
                      U
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold line-clamp-1">
                        User
                      </span>
                      <span className="text-xs text-muted-foreground/80 line-clamp-1">
                        user@example.com
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] rounded-xl" align="start" sideOffset={8}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg py-3">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600 rounded-lg py-3"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Footer */}
          <div className="mt-4">
            <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-3">
              <p className="text-xs text-muted-foreground/70 text-center font-medium">
                © 2024 Imagine App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
