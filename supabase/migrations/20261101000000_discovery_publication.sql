-- Separate KHANHOMES DISCOVERY database only. Do not apply to KhanHomes operations.
-- Backend-only listing mirror, explicitly published via signed webhook and service-role RPC.
begin;
create extension if not exists pgcrypto;
create table if not exists public.discovery_listings(
 id uuid primary key default gen_random_uuid(),
 source_org_id uuid not null,
 source_property_id uuid not null,
 source_unit_id uuid not null,
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(char_length(title) between 5 and 120),
 area text not null check(char_length(area) between 3 and 100),
 county text not null check(char_length(county) between 2 and 70),
 kind text not null check(kind in ('Apartment','Studio','Townhouse','Maisonette','Villa')),
 listing_type text not null check(listing_type in ('rent','sale')),
 price_kes numeric(16,0) not null check(price_kes>0 and price_kes<=1000000000000),
 beds integer not null check(beds between 0 and 30),
 baths integer not null check(baths between 1 and 30),
 size_sqm integer not null check(size_sqm between 10 and 100000),
 furnished boolean not null,
 parking boolean not null,
 amenities jsonb not null default '[]'::jsonb check(jsonb_typeof(amenities)='array'),
 description text not null check(char_length(description) between 30 and 1600),
 images jsonb not null check(jsonb_typeof(images)='array'),
 verification text not null check(verification in ('listing-reviewed','availability-confirmed')),
 availability text not null check(availability in ('available','reserved','unknown')),
 status text not null check(status in ('published','withdrawn')),
 source_updated_at timestamptz not null,
 received_at timestamptz not null default now(),
 unique(source_org_id,source_unit_id)
);
create index if not exists discovery_catalog_published_idx on public.discovery_listings(status,source_updated_at desc);
create index if not exists discovery_catalog_location_idx on public.discovery_listings(county,listing_type,price_kes) where status='published';
create table if not exists public.discovery_ingest_events(
 event_id uuid primary key,
 event_type text not null check(event_type in ('listing.published','listing.withdrawn')),
 source_org_id uuid not null,
 source_unit_id uuid not null,
 received_at timestamptz not null default now()
);
create index if not exists discovery_events_received_idx on public.discovery_ingest_events(received_at desc);
alter table public.discovery_listings enable row level security;
alter table public.discovery_ingest_events enable row level security;
revoke all on public.discovery_listings from public,anon,authenticated;
revoke all on public.discovery_ingest_events from public,anon,authenticated;
grant select,insert,update,delete on public.discovery_listings to service_role;
grant select,insert on public.discovery_ingest_events to service_role;

create or replace function public.ingest_discovery_publication(
 p_event_id uuid, p_event_type text, p_listing jsonb
) returns text language plpgsql security definer
 set search_path=pg_catalog,public,pg_temp as $$
declare
 v_org uuid;
 v_unit uuid;
 v_property uuid;
 v_timestamp timestamptz;
 v_applied integer;
begin
 if p_event_type not in ('listing.published','listing.withdrawn') or p_listing is null then
   raise exception 'Invalid publication event';
 end if;
 v_org:=(p_listing->>'sourceOrgId')::uuid;
 v_property:=(p_listing->>'sourcePropertyId')::uuid;
 v_unit:=(p_listing->>'sourceUnitId')::uuid;
 v_timestamp:=(p_listing->>'sourceUpdatedAt')::timestamptz;
 if coalesce((p_listing->>'publicationApproved')::boolean,false) is distinct from true then
   raise exception 'Publication approval required';
 end if;
 if jsonb_typeof(p_listing->'images')<>'array' or jsonb_array_length(p_listing->'images')<1 then
   raise exception 'Approved public images required';
 end if;
 insert into public.discovery_ingest_events(event_id,event_type,source_org_id,source_unit_id)
 values(p_event_id,p_event_type,v_org,v_unit) on conflict(event_id) do nothing;
 if not found then return 'duplicate'; end if;
 insert into public.discovery_listings(
   source_org_id,source_property_id,source_unit_id,slug,title,area,county,kind,
   listing_type,price_kes,beds,baths,size_sqm,furnished,parking,amenities,
   description,images,verification,availability,status,source_updated_at
 ) values(
   v_org,v_property,v_unit,
   p_listing->>'slug',p_listing->>'title',p_listing->>'area',p_listing->>'county',
   p_listing->>'kind',p_listing->>'type',(p_listing->>'priceKes')::numeric,
   (p_listing->>'beds')::integer,(p_listing->>'baths')::integer,(p_listing->>'sizeSqm')::integer,
   (p_listing->>'furnished')::boolean,(p_listing->>'parking')::boolean,
   p_listing->'amenities',p_listing->>'description',p_listing->'images',
   p_listing->>'verification',p_listing->>'availability',
   case when p_event_type='listing.published' then 'published' else 'withdrawn' end,v_timestamp
 ) on conflict(source_org_id,source_unit_id) do update set
   source_property_id=excluded.source_property_id,
   slug=excluded.slug,title=excluded.title,area=excluded.area,county=excluded.county,
   kind=excluded.kind,listing_type=excluded.listing_type,
   price_kes=excluded.price_kes,beds=excluded.beds,baths=excluded.baths,
   size_sqm=excluded.size_sqm,furnished=excluded.furnished,parking=excluded.parking,
   amenities=excluded.amenities,description=excluded.description,images=excluded.images,
   verification=excluded.verification,availability=excluded.availability,
   status=excluded.status,source_updated_at=excluded.source_updated_at,received_at=now()
 where public.discovery_listings.source_updated_at<=excluded.source_updated_at;
 get diagnostics v_applied=row_count;
 if v_applied=0 then return 'stale'; end if;
 return 'applied';
end;
$$;
revoke all on function public.ingest_discovery_publication(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.ingest_discovery_publication(uuid,text,jsonb) to service_role;
commit;
