'use client';

import { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LayoutDashboard, 
  Image,
  History, 
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  currentPath: string;
}

interface NavItemProps {
  item: {
    href: string;
    icon: React.ReactNode;
    label: string;
  };
  currentPath: string;
}

const NavItem = memo(({ item, currentPath }: NavItemProps) => (
  <Link
    href={item.href}
    className={cn(
      'flex items-center gap-5 rounded-xl px-5 py-4',
      'text-muted-foreground transition-all',
      'hover:text-primary hover:bg-background/50',
      'active:scale-95 active:bg-background/70',
      'justify-start',
      currentPath === item.href && 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
    )}
  >
    <div className={cn(
      'rounded-xl p-2 transition-colors',
      currentPath === item.href
        ? 'bg-violet-500 text-white'
        : 'text-muted-foreground bg-background/80'
    )}>
      {item.icon}
    </div>
    <span className="text-base font-semibold">{item.label}</span>
  </Link>
));

NavItem.displayName = 'NavItem';

interface SidebarContentProps {
  currentPath: string;
}

const SidebarContent = memo(({ currentPath }: SidebarContentProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
      toast({
        title: 'Logged out successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [supabase, router, toast]);

  const getInitials = useCallback((email: string) => {
    return email
      .split('@')[0]
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, []);

  const mainItems = [
    { href: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" />, label: 'Dashboard' },
    { href: '/imagine', icon: <Image className="h-6 w-6" />, label: 'Generate' },
    { href: '/order', icon: <History className="h-6 w-6" />, label: 'View Order' },
  ];

  const supportItems = [
    { href: '/dashboard/settings', icon: <Settings className="h-6 w-6" />, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      {/* Branding */}
      <div className={cn(
        'flex items-center gap-4 p-5 mb-4',
        'bg-white/40 dark:bg-gray-800/40 rounded-2xl',
        'border border-white/40 dark:border-gray-700/40 shadow-lg',
        'space-x-3',
        'hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors'
      )}>
        <div className="relative h-12 w-12 overflow-hidden rounded-xl shadow-lg border-2 border-violet-500/20">
          <img
            src="/assets/ai-icon.png"
            alt="Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            Imagine
          </h2>
          <p className="text-xs font-medium text-muted-foreground/80">AI Image Generator</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg mb-4">
        <ScrollArea className="h-full px-5 py-5">
          <div className="space-y-8">
            {/* Main Navigation */}
            <div className="space-y-3">
              <h2 className="px-3 text-sm font-semibold tracking-tight text-muted-foreground/70 uppercase">
                Navigation
              </h2>
              <div className="space-y-2">
                {mainItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    currentPath={currentPath}
                  />
                ))}
              </div>
            </div>

            <Separator className="my-4 opacity-50" />

            {/* Support Navigation */}
            <div className="space-y-3">
              <h2 className="px-3 text-sm font-semibold tracking-tight text-muted-foreground/70 uppercase">
                Support
              </h2>
              <div className="space-y-2">
                {supportItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    currentPath={currentPath}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Profile Section */}
      <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg p-4">
        <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-full justify-start rounded-xl p-3 hover:bg-background/80 flex items-center gap-4 transition-colors duration-200 active:scale-95"
                disabled={isLoggingOut}
              >
                <Avatar className="h-11 w-11 border-2 border-violet-500/20 shadow-md">
                  <AvatarImage src="" sizes="40px" alt="" />
                  <AvatarFallback className="bg-violet-500 text-white font-semibold">
                    {getInitials('user@example.com')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold line-clamp-1">
                    User
                  </span>
                  <span className="text-sm text-muted-foreground/80 line-clamp-1">
                    user@example.com
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[260px] rounded-xl" align="start" sideOffset={8}>
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
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer */}
        <div className="mt-4">
          <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4">
            <p className="text-sm text-muted-foreground/70 text-center font-medium">
              © 2024 Imagine App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

SidebarContent.displayName = 'SidebarContent';

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className={cn(
      'fixed h-screen w-72 bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg',
      'border-r border-white/40 dark:border-gray-700/40 shadow-lg',
      'text-foreground',
      'hidden lg:block' // Hide on mobile, show on desktop (lg breakpoint)
    )}>
      <SidebarContent currentPath={currentPath} />
    </aside>
  );
}
