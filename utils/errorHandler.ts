export const handleError = (error: unknown, toast: any) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
  console.error(error);
};

export const handleSupabaseError = (error: any, toast: any) => {
  const message = error?.message || 'Database operation failed';
  toast({
    title: 'Database Error',
    description: message,
    variant: 'destructive',
  });
  console.error('Supabase error:', error);
};
