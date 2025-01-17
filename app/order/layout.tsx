"use client";

import { Sidebar } from "@/components/sidebar";
import { MobileFooter } from "@/components/others/mobile-footer";
import { usePathname } from "next/navigation";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <Sidebar currentPath={pathname} />
      </div>
      <main className="md:pl-[72px] h-full">
        {children}
        <MobileFooter />
      </main>
    </div>
  );
}
