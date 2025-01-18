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

const MobileNavItem = memo(({ href, icon: Icon, label, isActive }: MobileNavItemProps) => {
  const isExternal = href.startsWith('http');
  
  const linkProps = {
    className: cn(
      'flex flex-col items-center justify-center p-2 rounded-2xl',
      'transition-all duration-200 ease-in-out',
      'text-muted-foreground hover:text-primary hover:bg-background/30',
      'active:scale-95 active:bg-background/50',
      isActive && 'bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-sm'
    ),
    'aria-current': isActive ? ('page' as const) : undefined,
    tabIndex: 0,
    'aria-label': label
  };

  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...linkProps}
    >
      <div className={cn(
        'rounded-xl p-2 transition-colors',
        isActive
          ? 'bg-violet-500/80 text-white shadow-sm'
          : 'text-muted-foreground bg-background/50'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[0.7rem] mt-0.5 font-medium">{label}</span>
    </a>
  ) : (
    <Link href={href} {...linkProps}>
      <div className={cn(
        'rounded-xl p-2 transition-colors',
        isActive
          ? 'bg-violet-500/80 text-white shadow-sm'
          : 'text-muted-foreground bg-background/50'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[0.7rem] mt-0.5 font-medium">{label}</span>
    </Link>
  );
});

MobileNavItem.displayName = 'MobileNavItem';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/imagine', icon: Image, label: 'Create Image' },
  { href: '/order', icon: History, label: 'Create Order' },
  { href: 'https://bohurupi.com/my-account/', icon: Settings, label: 'My Account' },
];

interface MobileFooterProps {
  className?: string;
}

export function MobileFooter({ className }: MobileFooterProps) {
  const pathname = usePathname();

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 md:hidden',
        'bg-background/95 backdrop-blur-lg',
        'border-t border-border/50 shadow-lg',
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 gap-1 p-2">
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
