---------------------------------------
-- PROFILE & SOCIAL ACCESS POLICIES.
--
-- The initial schema only let users read their own `users` row and never
-- granted write access to friend_requests / friend_pairs. SkillSwap is a
-- social product: authenticated students must be able to discover each other
-- and manage friendships. This migration broadens those policies.
---------------------------------------

-- Allow every authenticated user to view other students' profiles so that
-- profile pages, matching, the social feed, and member lists work.
create policy "Authenticated users can view all profiles"
on public.users
for select
to authenticated
using ( true );

---------------------------------------
-- FRIEND REQUESTS: write access for the involved users.
---------------------------------------

-- A user can send a friend request only as the requestor.
create policy "Users can send their own friend_requests"
on public.friend_requests
for insert
to authenticated
with check (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
);

-- A user can cancel a request they sent, or reject one they received.
create policy "Users can delete their own friend_requests"
on public.friend_requests
for delete
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or receiver_user_id in (select id from public.users where auth_id = auth.uid())
);

---------------------------------------
-- FRIEND PAIRS: write access for the involved users.
---------------------------------------

-- A friendship is created when the receiver accepts a request, so the current
-- user must be one of the two sides of the pair being inserted.
create policy "Users can create their own friend_pairs"
on public.friend_pairs
for insert
to authenticated
with check (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or receiver_user_id in (select id from public.users where auth_id = auth.uid())
);

-- Either side of a friendship can remove it.
create policy "Users can delete their own friend_pairs"
on public.friend_pairs
for delete
to authenticated
using (
  requestor_user_id in (select id from public.users where auth_id = auth.uid())
  or receiver_user_id in (select id from public.users where auth_id = auth.uid())
);
