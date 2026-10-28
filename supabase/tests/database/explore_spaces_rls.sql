begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users(id,email) values
 ('71000000-0000-4000-8000-000000000001','space-owner@example.test'),
 ('71000000-0000-4000-8000-000000000002','space-member@example.test'),
 ('71000000-0000-4000-8000-000000000003','space-outsider@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000001';
select lives_ok($$select public.create_space('72000000-0000-4000-8000-000000000001','Private garden','Discoverable description','restricted')$$,'Owner creates private Space');
select lives_ok($$select public.create_space('72000000-0000-4000-8000-000000000001','Private garden','Discoverable description','restricted')$$,'Creation is retryable');
select is((select count(*) from public.space_members),1::bigint,'Creation includes exactly one active owner');
select lives_ok($$select public.create_space('72000000-0000-4000-8000-000000000002','Public garden','','public')$$,'Owner creates public Space');
select throws_ok($$insert into public.space_members(space_id,user_id,status) values('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003','active')$$,'Direct membership writes denied even to owner');

reset role;
insert into public.posts(id,author_id,space_id,body,status) values
 ('73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','Private published post','published'),
 ('73000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','Private pending post','pending_moderation'),
 ('73000000-0000-4000-8000-000000000003','71000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000002','Public published post','published');
insert into public.soul_questions(owner_id,question_text) values('71000000-0000-4000-8000-000000000001','Private fixture question');

set local role anon;
set local request.jwt.claim.sub = '';
select is((select count(*) from public.spaces where id::text like '72000000%'),2::bigint,'Visitors can discover Space metadata');
select is((select count(*) from public.posts where id::text like '73000000%'),1::bigint,'Visitors see only approved public content');
select is((select count(*) from public.visible_posts where id::text like '73000000%'),1::bigint,'Security-invoker view preserves RLS');
select throws_ok($$select public.create_space('72000000-0000-4000-8000-000000000004','Forged','','public')$$,'Visitors cannot create');
select throws_ok($$select * from public.space_members$$,'Visitors cannot read memberships');

set local role authenticated;
set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000002';
select throws_ok($$select public.create_space('72000000-0000-4000-8000-000000000001','Taken','','public')$$,'Another user cannot claim creation ID');
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','join')$$,'Private join becomes request');
select is((select status from public.space_members where space_id = '72000000-0000-4000-8000-000000000001'),'requested','Requester is not active');
select is((select count(*) from public.visible_posts where space_id = '72000000-0000-4000-8000-000000000001'),0::bigint,'Requester cannot read private posts');
select is((select count(*) from public.space_members),1::bigint,'Requester cannot enumerate other memberships');
select throws_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','approve')$$,'Requester cannot approve themself');
select throws_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','accept')$$,'A request cannot be accepted as an invitation');
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000002','join')$$,'Public Space joins immediately');
select is((select status from public.space_members where space_id = '72000000-0000-4000-8000-000000000002'),'active','Public join is active');

set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000001';
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','approve')$$,'Owner approves');
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003','invite')$$,'Owner invites');
select throws_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','decline')$$,'Owner cannot remove their membership');
select is((select count(*) from public.visible_posts where space_id = '72000000-0000-4000-8000-000000000001'),2::bigint,'Owner can review own unpublished posts');

set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000003';
select is((select count(*) from public.visible_posts where space_id = '72000000-0000-4000-8000-000000000001'),0::bigint,'Invitation alone reveals no private posts');
select is((select count(*) from public.my_spaces() where id = '72000000-0000-4000-8000-000000000001'),1::bigint,'Invitee sees Space in their own list');
select throws_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','join')$$,'Invitee cannot join for someone else');
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003','accept')$$,'Invitee accepts');
select lives_ok($$select public.change_space_membership('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003','accept')$$,'Acceptance is retryable');
select is((select count(*) from public.visible_posts where space_id = '72000000-0000-4000-8000-000000000001'),1::bigint,'Active member sees only approved private posts');
select is((select count(*) from public.soul_questions),0::bigint,'Space membership never reveals Soul Questions');

reset role;
delete from public.space_members where space_id = '72000000-0000-4000-8000-000000000001' and user_id = '71000000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '71000000-0000-4000-8000-000000000001';
select is((select count(*) from public.visible_posts where space_id = '72000000-0000-4000-8000-000000000001'),0::bigint,'Even authors without active membership cannot read restricted posts');

select * from finish();
rollback;
