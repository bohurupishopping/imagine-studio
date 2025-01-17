-- Create storage bucket for t-shirt designs
insert into storage.buckets (id, name, public)
values ('t-shirt-designs', 't-shirt-designs', true);

-- Set up RLS policies for storage bucket
create policy "Users can view their own designs"
on storage.objects for select
using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own designs"
on storage.objects for insert
with check (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own designs" 
on storage.objects for update
using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own designs"
on storage.objects for delete  
using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
