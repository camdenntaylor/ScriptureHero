-- Monday prototype: Global text posts, private questions/saves, and Hero messages.
-- This is for a new Supabase project. Publishing immediately is temporary; add
-- moderation before a broader release.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Scripture Hero'
    check (char_length(btrim(display_name)) between 1 and 80),
  bio text check (bio is null or char_length(bio) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  visibility text not null check (visibility in ('public', 'restricted')),
  created_at timestamptz not null default now()
);

-- Stable ID keeps the Monday client and API on the same Global Space.
insert into public.spaces (id, slug, name, visibility)
values ('00000000-0000-4000-8000-000000000001', 'global', 'Global', 'public');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete restrict,
  space_id uuid not null references public.spaces (id) on delete restrict,
  title text check (title is null or char_length(btrim(title)) between 1 and 160),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  scripture_reference text check (
    scripture_reference is null or char_length(btrim(scripture_reference)) between 1 and 120
  ),
  status text not null default 'published' check (
    status in ('draft', 'pending_moderation', 'needs_review', 'published', 'rejected', 'hidden')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, author_id)
);

create table public.soul_questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  question_text text not null check (char_length(btrim(question_text)) between 1 and 10000),
  label text check (label is null or char_length(btrim(label)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A save has no Soul Question reference. That relationship must never leak to
-- post authors through a save, message, or public response.
create table public.saved_posts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.hero_conversations (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles (id) on delete cascade,
  hero_id uuid not null references public.profiles (id) on delete cascade,
  origin_post_id uuid not null,
  created_at timestamptz not null default now(),
  constraint hero_is_post_author foreign key (origin_post_id, hero_id)
    references public.posts (id, author_id) on delete restrict,
  constraint no_self_conversation check (initiator_id <> hero_id),
  constraint one_conversation_per_saved_post unique (initiator_id, origin_post_id)
);

create table public.hero_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.hero_conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index posts_global_feed_idx on public.posts (created_at desc, id desc)
  where space_id = '00000000-0000-4000-8000-000000000001' and status = 'published';
create index posts_author_idx on public.posts (author_id, created_at desc, id desc);
create index soul_questions_owner_idx on public.soul_questions (owner_id, updated_at desc, id desc);
create index saved_posts_recent_idx on public.saved_posts (user_id, created_at desc, post_id);
create index saved_posts_post_idx on public.saved_posts (post_id);
create index hero_conversations_hero_idx on public.hero_conversations (hero_id, created_at desc, id desc);
create index hero_conversations_post_idx on public.hero_conversations (origin_post_id);
create index hero_messages_thread_idx on public.hero_messages (conversation_id, created_at, id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute function private.set_updated_at();
create trigger soul_questions_updated_at before update on public.soul_questions
  for each row execute function private.set_updated_at();

-- The trigger creates only public profile fields. Never copy email or question
-- content into profiles or public metadata.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 80), ''),
      nullif(left(btrim(new.raw_user_meta_data ->> 'full_name'), 80), ''),
      'Scripture Hero'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- In case Auth users were created before this first application migration.
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(left(btrim(u.raw_user_meta_data ->> 'display_name'), 80), ''),
    nullif(left(btrim(u.raw_user_meta_data ->> 'full_name'), 80), ''),
    'Scripture Hero'
  )
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.posts enable row level security;
alter table public.soul_questions enable row level security;
alter table public.saved_posts enable row level security;
alter table public.hero_conversations enable row level security;
alter table public.hero_messages enable row level security;

-- Supabase projects can have broad default grants in public. Start closed.
revoke all on table public.profiles, public.spaces, public.posts,
  public.soul_questions, public.saved_posts, public.hero_conversations,
  public.hero_messages from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (display_name, bio) on public.profiles to authenticated;
grant select on public.spaces to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert (author_id, space_id, title, body, scripture_reference) on public.posts to authenticated;
grant update (title, body, scripture_reference) on public.posts to authenticated;
grant select on public.soul_questions to authenticated;
grant insert (owner_id, question_text, label) on public.soul_questions to authenticated;
grant update (question_text, label) on public.soul_questions to authenticated;
grant delete on public.soul_questions to authenticated;
grant select on public.saved_posts to authenticated;
grant insert (user_id, post_id) on public.saved_posts to authenticated;
grant delete on public.saved_posts to authenticated;
grant select on public.hero_conversations to authenticated;
grant insert (initiator_id, hero_id, origin_post_id) on public.hero_conversations to authenticated;
grant select on public.hero_messages to authenticated;
grant insert (conversation_id, sender_id, body) on public.hero_messages to authenticated;

create policy "Public profiles are readable" on public.profiles
  for select to anon, authenticated using (true);
create policy "Owners edit public profile fields" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Global Space is public" on public.spaces
  for select to anon, authenticated
  using (id = '00000000-0000-4000-8000-000000000001');

create policy "Published Global posts and own posts are readable" on public.posts
  for select to anon, authenticated
  using (
    (space_id = '00000000-0000-4000-8000-000000000001' and status = 'published')
    or (author_id = (select auth.uid()))
  );
create policy "Authors publish Global text posts" on public.posts
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and space_id = '00000000-0000-4000-8000-000000000001'
    and status = 'published'
  );
create policy "Authors edit their Global posts" on public.posts
  for update to authenticated
  using (author_id = (select auth.uid()) and space_id = '00000000-0000-4000-8000-000000000001')
  with check (author_id = (select auth.uid()) and space_id = '00000000-0000-4000-8000-000000000001');

create policy "Owners read Soul Questions" on public.soul_questions
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create Soul Questions" on public.soul_questions
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners edit Soul Questions" on public.soul_questions
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Owners remove Soul Questions" on public.soul_questions
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Owners read saved posts" on public.saved_posts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owners save published Global posts" on public.saved_posts
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.space_id = '00000000-0000-4000-8000-000000000001'
        and p.status = 'published'
    )
  );
create policy "Owners unsave posts" on public.saved_posts
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Participants read Hero conversations" on public.hero_conversations
  for select to authenticated
  using (initiator_id = (select auth.uid()) or hero_id = (select auth.uid()));
create policy "Savers start conversations with post authors" on public.hero_conversations
  for insert to authenticated
  with check (
    initiator_id = (select auth.uid())
    and exists (
      select 1 from public.saved_posts s
      where s.user_id = initiator_id and s.post_id = origin_post_id
    )
  );

create policy "Participants read Hero messages" on public.hero_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.hero_conversations c
      where c.id = conversation_id
        and (c.initiator_id = (select auth.uid()) or c.hero_id = (select auth.uid()))
    )
  );
create policy "Participants send Hero messages" on public.hero_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.hero_conversations c
      where c.id = conversation_id
        and (c.initiator_id = (select auth.uid()) or c.hero_id = (select auth.uid()))
    )
  );

commit;
