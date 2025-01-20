'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: { 
              remember_me: rememberMe,
              display_name: displayName 
            },
          },
        });
        if (error) throw error;
        toast.success('Check your email for confirmation!');
      }
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
        initial="hidden"
        animate="visible"
        variants={cardVariants}
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
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="relative p-2 bg-gradient-to-r from-purple-50/70 to-blue-50/70 rounded-lg hover:scale-105 transition-transform backdrop-blur-md border border-white/40"
                  whileHover={{ rotate: 10 }}
                >
                  <img 
                    src="/assets/ai-icon.png"
                    alt="AI Icon"
                    className="w-10 h-10 object-contain"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full border border-white/40">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                </motion.div>
                
                <div className="text-center space-y-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {isLogin ? 'Bohurupi Studio' : 'Create Account'}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600/90">
                    {isLogin ? 'Sign in to continue' : 'Get started with our service'}
                  </CardDescription>
                </div>
              </div>
            </motion.div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <GoogleOneTap />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
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
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600/90 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        This usually takes a few seconds
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={!isLogin}
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </motion.div>
              )}

              {!isMagicLinkMode && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(!!checked)}
                          className="border-gray-300"
                        />
                        <Label htmlFor="remember-me">Remember me</Label>
                      </div>
                      {isLogin && (
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                {!isMagicLinkMode ? (
                  <>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isLogin ? (
                        'Sign In with Password'
                      ) : (
                        'Sign Up'
                      )}
                    </Button>

                    {isLogin && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => setIsMagicLinkMode(true)}
                          className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-600 border border-purple-200 hover:border-purple-300 transition-all duration-300"
                        >
                          Sign In with Magic Link
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="magic-email">Email</Label>
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleMagicLinkLogin}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                        disabled={magicLinkLoading}
                      >
                        {magicLinkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Send Magic Link'
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setIsMagicLinkMode(false)}
                        className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-600 border border-purple-200 hover:border-purple-300 transition-all duration-300"
                      >
                        Back to Password Login
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </form>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center text-sm"
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
