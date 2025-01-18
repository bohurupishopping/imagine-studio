import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Get session and verify authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    redirect('/');
  }

  // Get user data from authenticated endpoint
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('User verification failed:', userError);
    redirect('/');
  }

  // Get profile data with role information
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Profile error:', profileError);
    redirect('/wp-admin/setup');
  }

  if (profile.role !== 'admin') {
    console.log('Not an admin:', profile);
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Administrator Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email:</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID:</label>
                <p className="text-lg">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role:</label>
                <p className="text-lg capitalize">{profile.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated:</label>
                <p className="text-lg">
                  {new Date(profile.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}