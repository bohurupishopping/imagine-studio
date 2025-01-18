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
      <main className="md:pl-[72px] h-[calc(100dvh-4rem)] overflow-y-auto pb-0">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
      <div className="fixed bottom-0 w-full md:hidden h-16">
        <MobileFooter />
      </div>
    </div>
  );
}
