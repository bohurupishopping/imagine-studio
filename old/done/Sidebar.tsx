'use client';

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/app/global/ui/scroll-area";
import { Separator } from "@/app/global/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/app/global/ui/sheet";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { LogOut, User, Menu, } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/global/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/global/ui/avatar";
import Image from "next/image";
import { memo, useCallback } from "react";

interface SidebarProps {
  mainItems: Array<{
    title: string;
    href: string;
    icon: React.ReactNode;
  }>;
  supportItems: Array<{
    title: string;
    href: string;
    icon: React.ReactNode;
  }>;
  currentPath: string;
  className?: string;
}

interface NavItemProps {
  item: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  };
  currentPath: string;
}

// Memoize the NavItem component
const NavItem = memo(({ item, currentPath }: NavItemProps) => (
  <Link href={item.href} className="block w-full">
    <button
      className={cn(
        "w-full justify-start rounded-xl",
        "transition-colors duration-200 ease-in-out", // Reduced transition properties
        "hover:bg-violet-500/10", // Simplified hover effect
        "flex items-center gap-3 px-3 sm:px-4 py-3",
        "active:scale-95", // Removed touch manipulation for simplicity
        currentPath === item.href
          ? "bg-violet-500/20 text-violet-700 dark:text-violet-300" // Simplified active state
          : "text-muted-foreground"
      )}
    >
      {item.icon && (
        <div className={cn(
          "rounded-xl p-2 transition-colors duration-200", // Reduced transition properties
          currentPath === item.href
            ? "bg-violet-500 text-white" // Simplified active state
            : "text-muted-foreground bg-background/80"
        )}>
          {item.icon}
        </div>
      )}
      <span className="font-medium">{item.title}</span>
    </button>
  </Link>
));

NavItem.displayName = 'NavItem';

// Memoize the SidebarContent component
const SidebarContent = memo(({ mainItems, supportItems, currentPath, className }: SidebarProps) => {
  const { user, logout } = useAuth();

  // Use useCallback for the handleLogout function
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-[100dvh] p-3 sm:p-4", // Removed relative positioning
      className
    )}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-4 sm:p-6 mb-3 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg">
        <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-xl shadow-lg border-2 border-violet-500/20">
          <Image
            src="/assets/ai-icon.png"
            alt="Bohurupi Logo"
            width={44}
            height={44}
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            Bohurupi
          </h2>
          <p className="text-xs font-medium text-muted-foreground/80">Admin Dashboard</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg mb-3">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h2 className="px-2 text-xs font-semibold tracking-tight text-muted-foreground/70 uppercase">
                Navigation
              </h2>
              <div className="space-y-1">
                {mainItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    currentPath={currentPath}
                  />
                ))}
              </div>
            </div>

            <Separator className="mx-1 opacity-50" />

            {/* Support Section */}
            <div className="space-y-2">
              <h2 className="px-2 text-xs font-semibold tracking-tight text-muted-foreground/70 uppercase">
                Support
              </h2>
              <div className="space-y-1">
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
      <div className="bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg p-3">
        <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full justify-start rounded-xl p-2.5 sm:p-3 hover:bg-background/80 flex items-center gap-3 transition-colors duration-200 active:scale-95">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-violet-500/20 shadow-md">
                  {/* Optimize by providing sizes and removing unnecessary alt if image fails to load */}
                  <AvatarImage src={user?.photoURL || ''} sizes="40px" alt="" />
                  <AvatarFallback className="bg-violet-500 text-white font-semibold">
                    {user?.email ? getInitials(user.email.split('@')[0]) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold line-clamp-1">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground/80 line-clamp-1">
                    {user?.email || ''}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px] rounded-xl" align="start" sideOffset={8}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/admin/profile">
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg py-3">
                  <User className="h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 rounded-lg py-3"
                onClick={handleLogout}
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
              © 2024 Bohurupi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

SidebarContent.displayName = 'SidebarContent';

export function Sidebar({ mainItems, supportItems, currentPath, }: SidebarProps) {
  return (
    <>
      {/* Mobile Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="fixed left-4 top-4 z-50 rounded-xl bg-white/40 dark:bg-gray-800/40 p-3 shadow-lg border border-white/40 dark:border-gray-700/40 lg:hidden hover:shadow-xl transition-colors duration-200 active:scale-95"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[280px] p-0 border-none z-50"
        >
          {/* Use lighter gradients and less blur for mobile */}
          <div className="h-full bg-white/40 dark:bg-gray-800/40">
            <SidebarContent
              mainItems={mainItems}
              supportItems={supportItems}
              currentPath={currentPath}
              className="bg-transparent"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[280px] z-30">
        <div className="fixed h-screen">
          <div className="h-full">
            {/* Reduce the intensity of the backdrop blur for desktop */}
            <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/10" />

            <div className="relative h-full">
              <SidebarContent
                mainItems={mainItems}
                supportItems={supportItems}
                currentPath={currentPath}
                className="bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}