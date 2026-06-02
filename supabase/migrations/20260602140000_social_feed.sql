---------------------------------------
-- SOCIAL FEED TABLES & POLICIES.
---------------------------------------

-- Enums
create type public.post_type as enum ('ACHIEVEMENT', 'RECOMMENDATION', 'FEEDBACK');
create type public.post_visibility_type as enum ('PUBLIC', 'FRIENDS_ONLY');

---------------------------------------
-- POSTS TABLE.
---------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  author_user_id uuid not null references public.users(id) on delete cascade,
  post_type public.post_type not null,
  visibility public.post_visibility_type not null default 'PUBLIC',
  title text,
  content text not null,
  media_url text,
  referenced_user_ids uuid[],
  referenced_session_id uuid references public.sessions(id) on delete set null
);

comment on table public.posts is 'Social feed posts (achievements, recommendations, feedback).';

create trigger enforce_posts_timestamps
  before insert or update on public.posts
  for each row execute function enforce_table_timestamps();

alter table public.posts enable row level security;

-- PUBLIC posts: readable by all authenticated users.
-- FRIENDS_ONLY posts: readable only by the author's friends.
create policy "Users can view public posts"
on public.posts
for select
to authenticated
using (
  visibility = 'PUBLIC'
  or author_user_id in (select id from public.users where auth_id = auth.uid())
  or (
    visibility = 'FRIENDS_ONLY'
    and (
      author_user_id in (
        select requestor_user_id from public.friend_pairs
        where receiver_user_id in (select id from public.users where auth_id = auth.uid())
      )
      or author_user_id in (
        select receiver_user_id from public.friend_pairs
        where requestor_user_id in (select id from public.users where auth_id = auth.uid())
      )
    )
  )
);

create policy "Users can create their own posts"
on public.posts
for insert
to authenticated
with check (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own posts"
on public.posts
for update
to authenticated
using (
  author_user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own posts"
on public.posts
for delete
to authenticated
using (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to posts"
on public.posts for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- POST LIKES TABLE.
---------------------------------------

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),

  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  constraint unique_post_like unique (post_id, user_id)
);

comment on table public.post_likes is 'Likes on posts (one per user per post).';

alter table public.post_likes enable row level security;

create policy "Authenticated users can view post_likes"
on public.post_likes for select to authenticated using ( true );

create policy "Users can like posts"
on public.post_likes for insert to authenticated
with check (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can unlike posts"
on public.post_likes for delete to authenticated
using (
  user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to post_likes"
on public.post_likes for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- POST COMMENTS TABLE.
---------------------------------------

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  post_id uuid not null references public.posts(id) on delete cascade,
  author_user_id uuid not null references public.users(id) on delete cascade,
  content text not null
);

comment on table public.post_comments is 'Comments on posts.';

create trigger enforce_post_comments_timestamps
  before insert or update on public.post_comments
  for each row execute function enforce_table_timestamps();

alter table public.post_comments enable row level security;

create policy "Authenticated users can view post_comments"
on public.post_comments for select to authenticated using ( true );

create policy "Users can create comments"
on public.post_comments for insert to authenticated
with check (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can update their own comments"
on public.post_comments for update to authenticated
using (
  author_user_id in (select id from public.users where auth_id = auth.uid())
)
with check (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own comments"
on public.post_comments for delete to authenticated
using (
  author_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to post_comments"
on public.post_comments for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );

---------------------------------------
-- POST SHARES TABLE.
---------------------------------------

create table public.post_shares (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),

  original_post_id uuid not null references public.posts(id) on delete cascade,
  sharing_user_id uuid not null references public.users(id) on delete cascade,
  comment text
);

comment on table public.post_shares is 'Shares/reposts of posts.';

alter table public.post_shares enable row level security;

create policy "Authenticated users can view post_shares"
on public.post_shares for select to authenticated using ( true );

create policy "Users can share posts"
on public.post_shares for insert to authenticated
with check (
  sharing_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Users can delete their own shares"
on public.post_shares for delete to authenticated
using (
  sharing_user_id in (select id from public.users where auth_id = auth.uid())
);

create policy "Admins have full access to post_shares"
on public.post_shares for all to authenticated
using ( public.is_user_admin() ) with check ( public.is_user_admin() );
