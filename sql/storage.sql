-- Create storage bucket for t-shirt designs if it doesn't exist
do $$
begin
  if not exists (
    select 1 from storage.buckets
    where id = 't-shirt-designs'
  ) then
    insert into storage.buckets (id, name, public)
    values ('t-shirt-designs', 't-shirt-designs', true);
  end if;
end $$;

-- Set up RLS policies for storage bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can view their own designs'
  ) then
    create policy "Users can view their own designs"
    on storage.objects for select
    using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own designs'
  ) then
    create policy "Users can upload their own designs"
    on storage.objects for insert
    with check (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own designs'
  ) then
    create policy "Users can update their own designs"
    on storage.objects for update
    using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own designs'
  ) then
    create policy "Users can delete their own designs"
    on storage.objects for delete
    using (bucket_id = 't-shirt-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  -- Admin policies
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can view all designs'
  ) then
    create policy "Admins can view all designs"
    on storage.objects for select
    using (
      bucket_id = 't-shirt-designs' AND
      exists (
        select 1 from profiles
        where profiles.user_id = auth.uid() AND profiles.role = 'admin'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload designs'
  ) then
    create policy "Admins can upload designs"
    on storage.objects for insert
    with check (
      bucket_id = 't-shirt-designs' AND
      exists (
        select 1 from profiles
        where profiles.user_id = auth.uid() AND profiles.role = 'admin'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update any design'
  ) then
    create policy "Admins can update any design"
    on storage.objects for update
    using (
      bucket_id = 't-shirt-designs' AND
      exists (
        select 1 from profiles
        where profiles.user_id = auth.uid() AND profiles.role = 'admin'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete any design'
  ) then
    create policy "Admins can delete any design"
    on storage.objects for delete
    using (
      bucket_id = 't-shirt-designs' AND
      exists (
        select 1 from profiles
        where profiles.user_id = auth.uid() AND profiles.role = 'admin'
      )
    );
  end if;
end $$;
