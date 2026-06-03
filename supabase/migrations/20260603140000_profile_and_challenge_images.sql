---------------------------------------
-- PROFILE & CHALLENGE IMAGES
--
-- User avatars (self-upload) and challenge artwork (admin upload).
-- Public storage buckets with RLS on write paths.
---------------------------------------

alter table public.users
  add column if not exists avatar_url text;

comment on column public.users.avatar_url is 'Public URL of the user profile photo in storage bucket avatars.';

alter table public.challenges
  add column if not exists image_url text;

comment on column public.challenges.image_url is 'Public URL of challenge artwork in storage bucket challenge-images.';

-- Allow any authenticated user to view completed challenges on profile pages.
create policy "Authenticated users can view completed user_challenges"
on public.user_challenges
for select
to authenticated
using ( status = 'COMPLETED' );

---------------------------------------
-- STORAGE BUCKETS
---------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'challenge-images',
    'challenge-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

---------------------------------------
-- STORAGE POLICIES: avatars
---------------------------------------

create policy "Public read avatars"
on storage.objects
for select
to public
using ( bucket_id = 'avatars' );

create policy "Users can insert own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (
    select id::text from public.users where auth_id = auth.uid()
  )
);

create policy "Users can update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (
    select id::text from public.users where auth_id = auth.uid()
  )
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (
    select id::text from public.users where auth_id = auth.uid()
  )
);

create policy "Users can delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (
    select id::text from public.users where auth_id = auth.uid()
  )
);

---------------------------------------
-- STORAGE POLICIES: challenge-images (admin write)
---------------------------------------

create policy "Public read challenge images"
on storage.objects
for select
to public
using ( bucket_id = 'challenge-images' );

create policy "Admins can insert challenge images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'challenge-images'
  and public.is_user_admin()
);

create policy "Admins can update challenge images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'challenge-images'
  and public.is_user_admin()
)
with check (
  bucket_id = 'challenge-images'
  and public.is_user_admin()
);

create policy "Admins can delete challenge images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'challenge-images'
  and public.is_user_admin()
);
