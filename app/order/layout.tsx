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
      <main className="md:pl-[72px] flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>
      <div className="fixed bottom-0 w-full md:hidden h-16">
        <MobileFooter />
      </div>
    </div>
  );
}
