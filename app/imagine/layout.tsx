import { Sidebar } from '@/components/sidebar';
import { MobileFooter } from '@/components/others/mobile-footer';

export const metadata = {
  title: 'FeludaAI Imagine - Your Ultimate Magajastra',
  description: 'Create with FeludaAI - Your Ultimate Magajastra',
  keywords: 'AI art, image generation, AI images, creative AI, digital art',
  icons: {
    icon: '/assets/ai-icon.png',
  },
};

export default function ImagineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50">
      <div className="flex flex-1">
        <Sidebar currentPath="/imagine" className="hidden md:block" />
        <main className="flex-1 md:ml-64 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileFooter className="md:hidden fixed bottom-0 w-full" />
    </div>
  );
}
