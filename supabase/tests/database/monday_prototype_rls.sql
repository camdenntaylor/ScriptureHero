begin;

create extension if not exists pgtap with schema extensions;
select plan(24);

insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'monday-saver@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'monday-author@example.test'),
  ('10000000-0000-4000-8000-000000000003', 'monday-outsider@example.test');

insert into public.posts (id, author_id, space_id, body, status) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-000000000001', 'A published thought.', 'published'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-000000000001', 'A future moderated thought.', 'pending_moderation');

insert into public.soul_questions (owner_id, question_text) values
  ('10000000-0000-4000-8000-000000000001', 'A private test question.');
insert into public.saved_posts (user_id, post_id) values
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001');
insert into public.hero_conversations (id, initiator_id, hero_id, origin_post_id) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001');
insert into public.hero_messages (conversation_id, sender_id, body) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Thank you.'),
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'Glad it helped.');

select ok((select bool_and(relrowsecurity) from pg_class where oid in (
  'public.profiles'::regclass, 'public.spaces'::regclass, 'public.posts'::regclass,
  'public.soul_questions'::regclass, 'public.saved_posts'::regclass,
  'public.hero_conversations'::regclass, 'public.hero_messages'::regclass
)), 'Every prototype table has RLS enabled');
select ok(not has_table_privilege('anon', 'public.soul_questions', 'SELECT'), 'Visitors cannot select questions');
select ok(not has_table_privilege('anon', 'public.saved_posts', 'SELECT'), 'Visitors cannot select saves');
select ok(not has_table_privilege('anon', 'public.hero_messages', 'SELECT'), 'Visitors cannot select messages');

set local role anon;
select is((select count(*) from public.posts), 1::bigint, 'Visitor sees only published Global posts');
select is((select count(*) from public.profiles), 3::bigint, 'Visitor can see public profiles');

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';
select is((select count(*) from public.soul_questions), 1::bigint, 'Owner sees their question');
select is((select count(*) from public.saved_posts), 1::bigint, 'Saver sees their save');
select is((select count(*) from public.hero_conversations), 1::bigint, 'Initiator sees conversation');
select is((select count(*) from public.hero_messages), 2::bigint, 'Initiator sees both messages');
select lives_ok(
  $$insert into public.soul_questions (owner_id, question_text)
    values ('10000000-0000-4000-8000-000000000001', 'Another private question.')$$,
  'Owner can add a question'
);
select throws_ok(
  $$insert into public.soul_questions (owner_id, question_text)
    values ('10000000-0000-4000-8000-000000000002', 'An impersonated question.')$$,
  'Owner cannot create another person''s question'
);
select lives_ok(
  $$insert into public.hero_messages (conversation_id, sender_id, body)
    values ('30000000-0000-4000-8000-000000000001',
            '10000000-0000-4000-8000-000000000001', 'A reply.')$$,
  'Initiator can reply'
);
select throws_ok(
  $$insert into public.hero_conversations (initiator_id, hero_id, origin_post_id)
    values ('10000000-0000-4000-8000-000000000001',
            '10000000-0000-4000-8000-000000000002',
            '20000000-0000-4000-8000-000000000002')$$,
  'Cannot message from an unsaved post'
);

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000002';
select is((select count(*) from public.soul_questions), 0::bigint, 'Author cannot see saver questions');
select is((select count(*) from public.saved_posts), 0::bigint, 'Author cannot see saver records');
select is((select count(*) from public.hero_conversations), 1::bigint, 'Hero sees chosen conversation');
select is((select count(*) from public.hero_messages), 3::bigint, 'Hero sees messages in conversation');
select lives_ok(
  $$insert into public.hero_messages (conversation_id, sender_id, body)
    values ('30000000-0000-4000-8000-000000000001',
            '10000000-0000-4000-8000-000000000002', 'A Hero reply.')$$,
  'Hero can reply'
);

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000003';
select is((select count(*) from public.soul_questions), 0::bigint, 'Outsider cannot see questions');
select is((select count(*) from public.saved_posts), 0::bigint, 'Outsider cannot see saves');
select is((select count(*) from public.hero_conversations), 0::bigint, 'Outsider cannot see conversation');
select is((select count(*) from public.hero_messages), 0::bigint, 'Outsider cannot see messages');
select throws_ok(
  $$insert into public.hero_messages (conversation_id, sender_id, body)
    values ('30000000-0000-4000-8000-000000000001',
            '10000000-0000-4000-8000-000000000003', 'Intrusion.')$$,
  'Outsider cannot send to conversation'
);

select * from finish();
rollback;
