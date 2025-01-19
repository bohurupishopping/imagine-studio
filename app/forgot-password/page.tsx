'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/confirm`,
      });

      if (error) throw error;
      
      toast.success('Password reset email sent! Check your inbox.');
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-white/40 bg-white/90 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:border-purple-200/50 rounded-xl">
          <CardHeader className="space-y-1 p-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                className="p-2 bg-gradient-to-r from-purple-50/70 to-blue-50/70 rounded-lg hover:scale-105 transition-transform backdrop-blur-md border border-white/40"
                whileHover={{ rotate: 10 }}
              >
                <Mail className="w-7 h-7 text-purple-600 hover:text-purple-700 transition-colors" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center text-gray-600/90">
                Enter your email to reset your password
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleResetPassword} className="space-y-4">
              {loading && (
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
                        Sending reset email...
                      </motion.h3>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-center text-sm"
            >
              Remember your password?{' '}
              <Link
                href="/"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
