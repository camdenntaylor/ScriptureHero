begin;

alter table public.profiles
  add column location text check (location is null or char_length(location) <= 80),
  add column avatar_path text check (avatar_path is null or char_length(avatar_path) <= 160);

grant update (location, avatar_path) on public.profiles to authenticated;
grant insert (id) on public.soul_questions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Users upload avatars in their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and storage.extension(name) in ('jpg', 'png', 'webp')
  );

commit;
