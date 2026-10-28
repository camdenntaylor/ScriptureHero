begin;

alter table public.spaces add column description text not null default '' check (char_length(description) <= 500);
alter table public.spaces add column owner_id uuid references public.profiles(id) on delete restrict;
alter table public.spaces add constraint space_name_length check (char_length(btrim(name)) between 1 and 80);
create index spaces_owner_idx on public.spaces(owner_id);
create index spaces_directory_idx on public.spaces(created_at desc, id desc);
create index profiles_directory_idx on public.profiles(created_at desc, id desc);
create index posts_space_feed_idx on public.posts(space_id, created_at desc, id desc) where status = 'published';

create table public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('active', 'requested', 'invited')),
  created_at timestamptz not null default now(),
  primary key(space_id, user_id)
);
create index space_members_user_idx on public.space_members(user_id, space_id, status);
create index space_members_manage_idx on public.space_members(space_id, created_at desc, user_id desc);
alter table public.space_members enable row level security;
revoke all on public.space_members from anon, authenticated;
grant select on public.space_members to authenticated;

-- Helpers take only a Space ID and always use the verified caller's identity.
create function public.is_space_member(p_space uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.space_members where space_id = p_space and user_id = auth.uid() and status = 'active');
$$;
create function public.owns_space(p_space uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.spaces where id = p_space and owner_id = auth.uid());
$$;
revoke all on function public.is_space_member(uuid), public.owns_space(uuid) from public;
grant execute on function public.is_space_member(uuid), public.owns_space(uuid) to anon, authenticated;

create policy "Members see only their own membership or owners manage" on public.space_members
  for select to authenticated using(user_id = (select auth.uid()) or public.owns_space(space_id));

-- The directory intentionally exposes name/description/visibility, never private
-- posts, membership lists, or Soul Question-derived data. Do not put secrets in
-- a Space's name or description.
drop policy "Global Space is public" on public.spaces;
create policy "Space directory is discoverable" on public.spaces for select to anon, authenticated using(true);

drop policy "Published Global posts and own posts are readable" on public.posts;
create policy "Approved visible posts or own visible drafts" on public.posts for select to anon, authenticated using (
  (status = 'published' or author_id = (select auth.uid()))
  and exists(select 1 from public.spaces s where s.id = space_id and (s.visibility = 'public' or public.is_space_member(s.id)))
);

-- Security-invoker means callers retain their own RLS restrictions. Keep
-- private content filtered before pagination, even on the owner's profile.
create view public.visible_posts with (security_invoker = true) as
select p.*, coalesce(p.title, '') || ' ' || p.body || ' ' || coalesce(p.scripture_reference, '') as search_text
from public.posts p
where exists(select 1 from public.spaces s where s.id = p.space_id and (s.visibility = 'public' or public.is_space_member(s.id)));
grant select on public.visible_posts to anon, authenticated;

create function public.my_spaces() returns setof public.spaces
language sql stable security invoker set search_path = '' as $$
  select s.* from public.spaces s where s.slug = 'global' or exists (
    select 1 from public.space_members m where m.space_id = s.id and m.user_id = auth.uid()
  );
$$;
revoke all on function public.my_spaces() from public;
grant execute on function public.my_spaces() to authenticated;

-- Creation and the owner's membership commit together. Only these guarded
-- functions can write memberships; direct table INSERT/UPDATE is not granted.
create function public.create_space(p_id uuid, p_name text, p_description text, p_visibility text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_name is null or p_description is null or p_visibility is null or char_length(btrim(p_name)) not between 1 and 80 or char_length(p_description) > 500 or p_visibility not in ('public', 'restricted') then
    raise check_violation;
  end if;
  insert into public.spaces(id, slug, name, description, visibility, owner_id)
  values(p_id, p_id::text, btrim(p_name), btrim(p_description), p_visibility, auth.uid())
  on conflict(id) do nothing;
  select owner_id into v_owner from public.spaces where id = p_id for update;
  if v_owner is distinct from auth.uid() then raise insufficient_privilege; end if;
  insert into public.space_members(space_id, user_id, status) values(p_id, auth.uid(), 'active') on conflict do nothing;
end;
$$;

create function public.change_space_membership(p_space uuid, p_user uuid, p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid; v_visibility text; v_status text; v_next text;
begin
  if auth.uid() is null or p_user is null or p_action is null then raise insufficient_privilege; end if;
  select owner_id, visibility into v_owner, v_visibility from public.spaces where id = p_space for update;
  if not found then raise no_data_found; end if;
  if not exists(select 1 from public.profiles where id = p_user) then raise no_data_found; end if;
  select status into v_status from public.space_members where space_id = p_space and user_id = p_user;
  if p_action in ('invite', 'approve') then
    if v_owner is distinct from auth.uid() then raise insufficient_privilege; end if;
  elsif p_action in ('join', 'accept') then
    if p_user <> auth.uid() then raise insufficient_privilege; end if;
  elsif p_action = 'decline' then
    if p_user <> auth.uid() and v_owner is distinct from auth.uid() then raise insufficient_privilege; end if;
    if p_user = v_owner then raise check_violation; end if;
    delete from public.space_members where space_id = p_space and user_id = p_user and status <> 'active';
    return;
  else raise check_violation;
  end if;
  if p_action = 'join' then
    v_next := case when v_status in ('active', 'invited') or v_visibility = 'public' then 'active' else 'requested' end;
  elsif p_action = 'accept' then
    if v_status is null or v_status not in ('invited', 'active') then raise check_violation; end if;
    v_next := 'active';
  elsif p_action = 'invite' then
    v_next := case when v_status = 'active' then 'active' else 'invited' end;
  elsif p_action = 'approve' then
    if v_status is null or v_status not in ('requested', 'active') then raise check_violation; end if;
    v_next := 'active';
  end if;
  insert into public.space_members(space_id, user_id, status) values(p_space, p_user, v_next)
  on conflict(space_id, user_id) do update set status = excluded.status;
end;
$$;
revoke all on function public.create_space(uuid,text,text,text), public.change_space_membership(uuid,uuid,text) from public;
grant execute on function public.create_space(uuid,text,text,text), public.change_space_membership(uuid,uuid,text) to authenticated;

commit;
