'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sparkles, History, LayoutDashboard, Image } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="h-full p-2 sm:p-4">
      <div className="max-w-7xl mx-auto flex flex-col">
        <header className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            Sign Out
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Dashboard Overview Card */}
          <Card className="border border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="space-y-1 p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <LayoutDashboard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-purple-600">
                    Dashboard Overview
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage and monitor your AI creations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Track your generated images, manage orders, and view analytics all in one place.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  onClick={() => router.push('/dashboard')}
                >
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Image Card */}
          <Card className="border border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="space-y-1 p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-blue-600">
                    Create Image
                  </CardTitle>
                  <p className="text-sm text-gray-600">Generate AI-powered designs</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Create stunning AI-generated images for your t-shirts and merchandise with our advanced image generation tools.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => router.push('/imagine')}
                >
                  Start Creating
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Order Card */}
          <Card className="border border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="space-y-1 p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-purple-600">
                    Create Order
                  </CardTitle>
                  <p className="text-sm text-gray-600">Turn designs into products</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Convert your AI-generated designs into custom merchandise. Place orders and track their progress easily.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  onClick={() => router.push('/order')}
                >
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/90 shadow-lg border border-purple-100">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-600 border-t-transparent" />
              <p className="text-lg font-semibold text-purple-600">
                Signing out...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
