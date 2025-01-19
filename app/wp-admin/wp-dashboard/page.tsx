'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User as UserIcon, Shield, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email?: string;
  created_at?: string;
}

interface Profile {
  user_id: string;
  role: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Session error');
        }

        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User verification failed');
        }

        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          throw new Error('Invalid admin profile');
        }

        setUserData(user);
        setProfileData(profile);
      } catch (error) {
        console.error('Admin dashboard error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

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
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Admin Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Orders Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card 
              className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200 cursor-pointer"
              onClick={() => router.push('/wp-admin/orders')}
            >
              <CardHeader className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      View Orders
                    </CardTitle>
                    <p className="text-sm text-gray-600">Manage and track customer orders</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">View and manage all customer orders, track their status, and handle order fulfillment.</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={() => router.push('/wp-admin/orders')}
                  >
                    View Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Designs Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card 
              className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200 cursor-pointer"
              onClick={() => router.push('/wp-admin/designs')}
            >
              <CardHeader className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Manage Designs
                    </CardTitle>
                    <p className="text-sm text-gray-600">View and manage customer designs</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">View and manage all customer designs, edit details, and handle design management.</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={() => router.push('/wp-admin/designs')}
                  >
                    Manage Designs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Profile Card */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
              <CardHeader className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Admin Profile
                    </CardTitle>
                    <p className="text-sm text-gray-600">Your account information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{userData?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium capitalize">{profileData?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium">
                      {profileData?.updated_at ? new Date(profileData.updated_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Features
            </h2>
            <p className="mt-2 text-gray-600">Key features for managing your store</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <span className="text-purple-600 font-bold">1</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Order Management
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    View, track, and manage all customer orders in one place
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      User Management
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Manage user accounts, roles, and permissions
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-purple-600">
                      Analytics
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    View sales data and platform analytics
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="h-full border border-white/40 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border-purple-200">
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-blue-600">
                      Settings
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600">
                    Configure platform settings and preferences
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
