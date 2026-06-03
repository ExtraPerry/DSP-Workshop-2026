---------------------------------------
-- DIRECT MESSAGES (friend-only DMs).
---------------------------------------

alter type public.notification_type add value if not exists 'DIRECT_MESSAGE';

---------------------------------------
-- Helper: membership in a friend pair.
---------------------------------------

create or replace function public.is_user_in_friend_pair(pair_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friend_pairs fp
    where fp.id = pair_id
      and (
        fp.requestor_user_id in (
          select id from public.users where auth_id = auth.uid()
        )
        or fp.receiver_user_id in (
          select id from public.users where auth_id = auth.uid()
        )
      )
  );
$$;

---------------------------------------
-- direct_conversations
---------------------------------------

create table public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  friend_pair_id uuid not null unique references public.friend_pairs(id) on delete cascade
);

comment on table public.direct_conversations is 'One direct-message thread per confirmed friendship (friend_pair).';

create trigger enforce_direct_conversations_timestamps
  before insert or update on public.direct_conversations
  for each row execute function enforce_table_timestamps();

alter table public.direct_conversations enable row level security;

create policy "Users can view their own direct_conversations"
on public.direct_conversations
for select
to authenticated
using ( public.is_user_in_friend_pair(friend_pair_id) );

create policy "Users can create their own direct_conversations"
on public.direct_conversations
for insert
to authenticated
with check ( public.is_user_in_friend_pair(friend_pair_id) );

create policy "Admins have full access to direct_conversations"
on public.direct_conversations
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

---------------------------------------
-- direct_messages
---------------------------------------

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0)
);

comment on table public.direct_messages is 'Messages within a friend direct-message conversation.';

create trigger enforce_direct_messages_timestamps
  before insert or update on public.direct_messages
  for each row execute function enforce_table_timestamps();

alter table public.direct_messages enable row level security;

create policy "Users can view messages in their conversations"
on public.direct_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.direct_conversations dc
    where dc.id = conversation_id
      and public.is_user_in_friend_pair(dc.friend_pair_id)
  )
);

create policy "Users can send messages in their conversations"
on public.direct_messages
for insert
to authenticated
with check (
  sender_user_id in (select id from public.users where auth_id = auth.uid())
  and exists (
    select 1
    from public.direct_conversations dc
    where dc.id = conversation_id
      and public.is_user_in_friend_pair(dc.friend_pair_id)
  )
);

create policy "Admins have full access to direct_messages"
on public.direct_messages
for all
to authenticated
using ( public.is_user_admin() )
with check ( public.is_user_admin() );

---------------------------------------
-- Notify recipient on new direct message.
---------------------------------------

create or replace function public.format_user_notification_label(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when u.first_name is not null and btrim(u.first_name) <> ''
         and u.last_name is not null and btrim(u.last_name) <> '' then
      btrim(u.first_name) || '.' || upper(left(btrim(u.last_name), 1))
    when u.first_name is not null and btrim(u.first_name) <> '' then
      btrim(u.first_name)
    when u.last_name is not null and btrim(u.last_name) <> '' then
      '.' || upper(left(btrim(u.last_name), 1))
    else
      coalesce(split_part(u.email, '@', 1), 'Unknown')
  end
  from public.users u
  where u.id = target_user_id;
$$;

create or replace function public.notify_direct_message_recipient()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_id uuid;
  requestor_id uuid;
  receiver_id uuid;
  sender_label text;
begin
  select fp.requestor_user_id, fp.receiver_user_id
  into requestor_id, receiver_id
  from public.direct_conversations dc
  join public.friend_pairs fp on fp.id = dc.friend_pair_id
  where dc.id = new.conversation_id;

  if new.sender_user_id = requestor_id then
    recipient_id := receiver_id;
  else
    recipient_id := requestor_id;
  end if;

  sender_label := public.format_user_notification_label(new.sender_user_id);

  insert into public.notifications (
    recipient_user_id,
    sender_user_id,
    notification_type,
    title_key,
    body_key,
    reference_id,
    reference_type
  ) values (
    recipient_id,
    new.sender_user_id,
    'DIRECT_MESSAGE',
    'Notifications.directMessage.title',
    sender_label,
    new.conversation_id,
    'direct_conversation'
  );

  return new;
end;
$$;

create trigger on_direct_message_insert_notify
  after insert on public.direct_messages
  for each row execute function public.notify_direct_message_recipient();

---------------------------------------
-- Realtime publication
---------------------------------------

alter publication supabase_realtime add table public.direct_conversations;
alter publication supabase_realtime add table public.direct_messages;
