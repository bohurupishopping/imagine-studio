'use client';

import { 
  LayoutDashboard,
  Image,
  History,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface MobileNavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const MobileNavItem = memo(({ href, icon: Icon, label, isActive }: MobileNavItemProps) => (
  <Link
    href={href}
    className={cn(
      'flex flex-col items-center justify-center p-2 rounded-lg',
      'transition-all duration-150',
      'text-muted-foreground hover:text-primary hover:bg-background/30',
      isActive && 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
    )}
    aria-current={isActive ? 'page' : undefined}
    tabIndex={0}
    aria-label={label}
  >
    <div className={cn(
      'rounded-lg p-1.5 transition-colors',
      isActive
        ? 'bg-violet-500/80 text-white'
        : 'text-muted-foreground bg-background/50'
    )}>
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-[0.7rem] mt-0.5 font-medium">{label}</span>
  </Link>
));

MobileNavItem.displayName = 'MobileNavItem';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/imagine', icon: Image, label: 'Generate' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function MobileFooter() {
  const pathname = usePathname();

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 md:hidden',
        'bg-background/90 backdrop-blur-md',
        'border-t border-border/50 shadow-sm'
      )}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 gap-0.5 p-1.5">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}
