begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users(id,email) values
 ('81000000-0000-4000-8000-000000000001','posting-owner@example.test'),
 ('81000000-0000-4000-8000-000000000002','posting-member@example.test'),
 ('81000000-0000-4000-8000-000000000003','posting-outsider@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000001';
select public.create_space('82000000-0000-4000-8000-000000000001','Private circle','','restricted');
select public.create_space('82000000-0000-4000-8000-000000000002','Public circle','','public');
select public.change_space_membership('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','invite');

set local role anon;
set local request.jwt.claim.sub = '';
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','An anonymous thought')$$,'Visitors cannot submit');
select throws_ok($$select * from public.posting_spaces()$$,'Posting destinations require an account');

set local role authenticated;
set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000002';
select is((select count(*) from public.posting_spaces()),1::bigint,'Invitees see only Global as a posting destination');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','Private thought')$$,'Invitation alone does not authorize posting');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000002','Public thought')$$,'Public visibility alone does not authorize posting');
select lives_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','A Global thought')$$,'Members can submit to Global without joining');
select is((select status from public.posts where id = '83000000-0000-4000-8000-000000000001'),'pending_moderation','Global submission always awaits moderation');
select lives_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','A Global thought')$$,'Retry succeeds with the same ID');
select is((select count(*) from public.posts where id = '83000000-0000-4000-8000-000000000001'),1::bigint,'Retry creates no duplicate');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','A changed thought')$$,'Conflicting retry does not change the original post');

select public.change_space_membership('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','accept');
select lives_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','A private thought')$$,'Active member can submit to private Space');
select is((select space_id::text from public.posts where id = '83000000-0000-4000-8000-000000000002'),'82000000-0000-4000-8000-000000000001','Post goes only to selected private Space');
select is((select status from public.posts where id = '83000000-0000-4000-8000-000000000002'),'pending_moderation','Private submission also awaits moderation');
select is((select count(*) from public.posting_spaces()),2::bigint,'Active Space appears among posting destinations');
select public.change_space_membership('82000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000002','join');
select lives_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000002','A public circle thought')$$,'Joined public Space permits submission');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','A private thought')$$,'Retry cannot move a post to Global');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000004','82000000-0000-4000-8000-000000000002','   ')$$,'Empty submissions are rejected by database guard');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000004','82000000-0000-4000-8000-000000000002',repeat('x',1501))$$,'Oversized submissions are rejected by database guard');

set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000001';
select is((select count(*) from public.visible_posts where id::text like '83000000%'),0::bigint,'Even Space owner cannot read someone else''s unapproved submissions');
set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000003';
select is((select count(*) from public.posts where id::text like '83000000%'),0::bigint,'Other users see none of the unreviewed posts');
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','A Global thought')$$,'Another author cannot reuse a submission ID');

reset role;
delete from public.space_members where space_id = '82000000-0000-4000-8000-000000000001' and user_id = '81000000-0000-4000-8000-000000000002';
set local role authenticated;
set local request.jwt.claim.sub = '81000000-0000-4000-8000-000000000002';
select throws_ok($$select public.submit_space_post('83000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000001','A private thought')$$,'Membership is checked again on retries');

select * from finish();
rollback;
