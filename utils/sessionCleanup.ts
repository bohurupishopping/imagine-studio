import { createClient } from './supabase/server';

export async function cleanupExpiredSessions() {
  const supabase = await createClient();
  
  try {
    // Delete sessions older than 7 days
    const { error } = await supabase
      .from('sessions')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);