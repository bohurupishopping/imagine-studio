import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bohurupi Shopping Studio | Bengali Graphic T-Shirts & AI T-Shirt Printing',
  description: 'Discover best unique Bengali graphic T-shirts with Bohurupi Shopping Studio. Specializing in AI-driven T-shirt printing, we bring you vibrant Bangla T-shirts that showcase culture and creativity. Perfect for every occasion!',
  icons: {
    icon: '/assets/ai-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
