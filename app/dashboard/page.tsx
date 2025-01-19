'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sparkles, History, LayoutDashboard, Image } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-[calc(100vh-4rem)] relative bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100dvh-4rem)] relative z-10 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div
          className="py-6 md:py-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
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
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >

          {/* Create Image Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
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
                  <p className="text-sm text-gray-600">Create stunning AI-generated images for your t-shirts with our advanced image generation tools.</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => router.push('/imagine')}
                  >
                    Start Creating
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Order Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
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
                  <p className="text-sm text-gray-600">Convert your AI-generated designs into custom merchandise. Place orders easily.</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={() => router.push('/order')}
                  >
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* My Designs Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <CardHeader className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <Image className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      My Designs
                    </CardTitle>
                    <p className="text-sm text-gray-600">View and manage your designs</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Access all your created designs, edit text, and manage your design library.</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => router.push('/my-designs')}
                  >
                    View Designs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Order Steps Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="mt-2 text-gray-600">Simple steps to create your custom t-shirt</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <span className="text-purple-600 font-bold">1</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Place Order
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Complete your t-shirt order on bohurupi.com and get your order ID via email
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      Sign Up
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Create your account on studio.bohurupi.com to start designing
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Create Design
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Use our AI tools to create your perfect design and add custom text
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      Complete Order
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Enter your order ID, select your design, and place your order
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6 bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-12 rounded-2xl border border-white/40 shadow-2xl backdrop-blur-md hover:border-purple-200/50 transition-all duration-300"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <div className="h-16 w-16 rounded-full border-4 border-purple-600/30 border-t-purple-600" />
                </motion.div>
              </div>
              <div className="space-y-2 text-center">
                <motion.h3
                  className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Signing out...
                </motion.h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
