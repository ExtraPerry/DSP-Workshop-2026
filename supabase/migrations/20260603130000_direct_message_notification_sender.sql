---------------------------------------
-- DIRECT MESSAGE NOTIFICATIONS: include sender as first_name.L
-- (first_name + dot + first initial of last_name).
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
