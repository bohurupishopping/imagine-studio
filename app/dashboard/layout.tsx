import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <Sidebar />
        <main className={cn(
          'flex-1 p-6 transition-all duration-300',
          'ml-0 lg:ml-64' // Adjust margin based on sidebar width
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
