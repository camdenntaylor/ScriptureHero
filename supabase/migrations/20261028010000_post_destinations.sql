begin;

-- Eligibility is evaluated before pagination. Invitations and pending requests
-- never authorize posting. Everyone with an account can submit to Global.
create function public.posting_spaces() returns setof public.spaces
language sql stable security invoker set search_path = '' as $$
  select s.* from public.spaces s
  where s.id = '00000000-0000-4000-8000-000000000001'
    or public.is_space_member(s.id);
$$;
revoke all on function public.posting_spaces() from public;
grant execute on function public.posting_spaces() to authenticated;

-- This is the composer write path. It always starts moderation; the client
-- cannot supply an author, status, or a second destination. Locking the Space
-- serializes authorization with the membership-changing RPC.
create function public.submit_space_post(p_id uuid, p_space uuid, p_body text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_post public.posts%rowtype;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_id is null or p_body is null or char_length(btrim(p_body)) not between 1 and 1500 then raise check_violation; end if;
  perform 1 from public.spaces where id = p_space for update;
  if not found then raise no_data_found; end if;
  if p_space <> '00000000-0000-4000-8000-000000000001' and not public.is_space_member(p_space) then raise insufficient_privilege; end if;

  insert into public.posts(id, author_id, space_id, body, status)
  values(p_id, auth.uid(), p_space, btrim(p_body), 'pending_moderation')
  on conflict(id) do nothing;

  select * into v_post from public.posts where id = p_id;
  if v_post.author_id <> auth.uid() or v_post.space_id <> p_space or v_post.body <> btrim(p_body)
    or v_post.title is not null or v_post.scripture_reference is not null then raise unique_violation; end if;
  return jsonb_build_object('id', v_post.id, 'status', v_post.status);
end;
$$;
revoke all on function public.submit_space_post(uuid,uuid,text) from public;
grant execute on function public.submit_space_post(uuid,uuid,text) to authenticated;

commit;
