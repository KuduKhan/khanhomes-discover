-- KhanHomes Discover v0.3: gated private seeker journey.
-- Apply ONLY to a separate, explicitly approved Discover Supabase project.
-- This migration is NOT installed in the existing KhanHomes operations database.
begin;

create table public.discovery_seeker_requests(
 id uuid primary key,
 seeker_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid not null references public.discovery_listings(id) on delete restrict,
 kind text not null check(kind in ('viewing','enquiry')),
 preferred_at timestamptz,
 message text not null check(char_length(btrim(message)) between 20 and 500),
 consent_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','reviewing','confirmed','declined','cancelled','expired')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check ((kind='viewing' and preferred_at is not null) or (kind='enquiry' and preferred_at is null))
);
create index discovery_requests_by_seeker on public.discovery_seeker_requests(seeker_id,created_at desc);
create index discovery_requests_by_listing on public.discovery_seeker_requests(listing_id,status,created_at desc);
create index discovery_requests_pending on public.discovery_seeker_requests(status,created_at desc)
 where status in ('pending','reviewing');

alter table public.discovery_seeker_requests enable row level security;
revoke all on public.discovery_seeker_requests from public,anon,authenticated;
grant select on public.discovery_seeker_requests to authenticated;
grant select,insert,update,delete on public.discovery_seeker_requests to service_role;
create policy seeker_reads_only_own_requests on public.discovery_seeker_requests
 for select to authenticated using (seeker_id=(select auth.uid()));

-- No browser INSERT / UPDATE policy is granted. The trusted API verifies
-- the Bearer token against Supabase Auth and invokes this service-role-only RPC.
create or replace function public.submit_discover_seeker_request(
 p_request_id uuid,
 p_seeker_id uuid,
 p_listing_id uuid,
 p_kind text,
 p_preferred_at timestamptz,
 p_message text,
 p_consent boolean
) returns text language plpgsql security definer
set search_path=pg_catalog,public,pg_temp as $$
declare
 v_existing_user uuid;
begin
 if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
   raise exception 'Unauthorized publisher role';
 end if;
 if p_consent is distinct from true or p_kind not in ('viewing','enquiry')
    or char_length(btrim(coalesce(p_message,''))) not between 20 and 500 then
   raise exception 'Invalid request';
 end if;
 if (p_kind='viewing' and
      (p_preferred_at is null or p_preferred_at<now()+interval '4 hours'
       or p_preferred_at>now()+interval '30 days'))
    or (p_kind='enquiry' and p_preferred_at is not null) then
   raise exception 'Invalid appointment details';
 end if;
 if not exists(
    select 1 from auth.users u
    where u.id=p_seeker_id and u.email_confirmed_at is not null
 ) then raise exception 'Confirmed seeker required';end if;
 select r.seeker_id into v_existing_user from public.discovery_seeker_requests r
   where r.id=p_request_id;
 if found then
   if v_existing_user=p_seeker_id then return 'duplicate';end if;
   raise exception 'Request identifier conflict';
 end if;

 -- Hold a row lock while validating publication status, avoiding a
 -- concurrent withdrawal or booking acceptance race in this transaction.
 perform 1 from public.discovery_listings l
 where l.id=p_listing_id and l.status='published'
   and l.availability='available'
   and l.verification='availability-confirmed'
   and l.source_updated_at>now()-interval '7 days'
 for share;
 if not found then raise exception 'Listing not available for requests';end if;

 if (select count(*) from public.discovery_seeker_requests r
     where r.seeker_id=p_seeker_id and r.created_at>now()-interval '24 hours')>=4 then
    raise exception 'Daily request limit reached';
 end if;
 if exists(select 1 from public.discovery_seeker_requests r
      where r.seeker_id=p_seeker_id and r.listing_id=p_listing_id and r.kind=p_kind
        and r.status in ('pending','reviewing','confirmed')) then
    raise exception 'Existing active request';
 end if;
 insert into public.discovery_seeker_requests(
   id,seeker_id,listing_id,kind,preferred_at,message
 ) values(p_request_id,p_seeker_id,p_listing_id,p_kind,p_preferred_at,btrim(p_message));
 return 'submitted';
end;
$$;
revoke all on function public.submit_discover_seeker_request(uuid,uuid,uuid,text,timestamptz,text,boolean)
 from public,anon,authenticated;
grant execute on function public.submit_discover_seeker_request(uuid,uuid,uuid,text,timestamptz,text,boolean)
 to service_role;

create or replace function public.cancel_discover_seeker_request(
 p_request_id uuid,p_seeker_id uuid
) returns text language plpgsql security definer
set search_path=pg_catalog,public,pg_temp as $$
begin
 if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
  raise exception 'Unauthorized role';
 end if;
 update public.discovery_seeker_requests
  set status='cancelled',updated_at=now()
  where id=p_request_id and seeker_id=p_seeker_id and status in ('pending','reviewing');
 if not found then raise exception 'Request cannot be cancelled';end if;
 return 'cancelled';
end;
$$;
revoke all on function public.cancel_discover_seeker_request(uuid,uuid) from public,anon,authenticated;
grant execute on function public.cancel_discover_seeker_request(uuid,uuid) to service_role;

-- Fraud and inappropriate listing reports, initially held for manual
-- authorized moderation. No public read or edit access.
create table public.discovery_listing_reports(
 id uuid primary key,
 reporter_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid not null references public.discovery_listings(id) on delete restrict,
 reason text not null check(reason in ('misleading','duplicate','privacy','suspicious','other')),
 details text not null check(char_length(btrim(details)) between 20 and 600),
 status text not null default 'pending' check(status in ('pending','reviewing','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index discovery_reports_review_idx on public.discovery_listing_reports(status,created_at desc);
create index discovery_reports_reporter_idx on public.discovery_listing_reports(reporter_id,created_at desc);
alter table public.discovery_listing_reports enable row level security;
revoke all on public.discovery_listing_reports from public,anon,authenticated;
grant select,insert,update,delete on public.discovery_listing_reports to service_role;
-- No 'authenticated' policy: reports may include privacy/security allegations.

create or replace function public.submit_discover_listing_report(
 p_report_id uuid,p_user_id uuid,p_listing_id uuid,
 p_reason text,p_details text
) returns text language plpgsql security definer
set search_path=pg_catalog,public,pg_temp as $$
declare v_previous uuid;
begin
 if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
  raise exception 'Unauthorized role';
 end if;
 if p_reason not in ('misleading','duplicate','privacy','suspicious','other')
  or char_length(btrim(coalesce(p_details,''))) not between 20 and 600 then
  raise exception 'Invalid report';
 end if;
 if not exists(select 1 from auth.users u where u.id=p_user_id and u.email_confirmed_at is not null) then
  raise exception 'Confirmed reporter required';
 end if;
 if not exists(select 1 from public.discovery_listings l where l.id=p_listing_id) then
  raise exception 'Unknown listing';
 end if;
 select reporter_id into v_previous from public.discovery_listing_reports where id=p_report_id;
 if found then
   if v_previous=p_user_id then return 'duplicate';end if;
   raise exception 'Report identifier conflict';
 end if;
 if (select count(*) from public.discovery_listing_reports r where r.reporter_id=p_user_id
   and r.created_at>now()-interval '24 hours')>=3 then
   raise exception 'Daily report limit reached';
 end if;
 insert into public.discovery_listing_reports(id,reporter_id,listing_id,reason,details)
 values(p_report_id,p_user_id,p_listing_id,p_reason,btrim(p_details));
 return 'received';
end;
$$;
revoke all on function public.submit_discover_listing_report(uuid,uuid,uuid,text,text)
 from public,anon,authenticated;
grant execute on function public.submit_discover_listing_report(uuid,uuid,uuid,text,text) to service_role;

comment on table public.discovery_seeker_requests is
 'Private, verified-seeker requests. These are requests, not booked appointments.';
comment on table public.discovery_listing_reports is
 'Private moderation intake. No public browsing or report disclosure.';

commit;
