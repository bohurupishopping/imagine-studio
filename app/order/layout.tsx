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
    <div className="min-h-screen flex flex-col">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <Sidebar currentPath={pathname} />
      </div>
      <main className="md:pl-[72px] flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <div className="fixed bottom-0 w-full md:hidden">
        <MobileFooter />
      </div>
    </div>
  );
}
