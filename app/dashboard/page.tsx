'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sparkles, History, Settings } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-purple-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header Section */}
        <motion.div 
          className="flex justify-between items-center p-4 pb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-4 rounded-full border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <motion.div
              className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg group-hover:scale-110 transition-transform"
              whileHover={{ rotate: 15 }}
            >
              <Sparkles className="w-7 h-7 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <Button 
            onClick={handleSignOut}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Sign Out
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 flex-1 overflow-hidden mt-4">
          {/* Image Generation Card */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-gray-100 bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-2 p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:scale-105 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <Sparkles className="w-7 h-7 text-purple-600 hover:text-purple-700 transition-colors" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Image Generation
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-tight">
                      Create stunning images with AI
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 sm:p-6 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-600">Quick Generate</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create images with a single prompt
                    </p>
                    <Button 
                      className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      onClick={() => router.push('/imagine')}
                    >
                      Start Generating
                    </Button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-600">Recent Creations</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View your latest generated images
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg animate-pulse" />
                      <div className="h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* History Card */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-gray-100 bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-2 p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:scale-105 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <History className="w-7 h-7 text-blue-600 hover:text-blue-700 transition-colors" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      History
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-tight">
                      View your generated images
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 sm:p-6 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-600">Recent Activity</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your latest image generations
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg animate-pulse" />
                      <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg animate-pulse" />
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-600">Collections</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Organize your creations
                    </p>
                    <Button 
                      className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => router.push('/history')}
                    >
                      View Collections
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Card */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border border-gray-100 bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-2 p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:scale-105 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <Settings className="w-7 h-7 text-purple-600 hover:text-purple-700 transition-colors" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Settings
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-tight">
                      Manage your account preferences
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 sm:p-6 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-600">Account Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your profile and preferences
                    </p>
                    <Button 
                      className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      onClick={() => router.push('/settings')}
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-600">Preferences</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Customize your experience
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                        <span className="text-sm text-gray-700">Dark Mode</span>
                        <div className="w-10 h-6 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full p-1">
                          <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                        <span className="text-sm text-gray-700">Notifications</span>
                        <div className="w-10 h-6 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full p-1">
                          <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-white/95 backdrop-blur-lg flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-100 shadow-2xl">
              <motion.div
                className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Signing out...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
