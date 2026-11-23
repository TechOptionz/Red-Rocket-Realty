-- Red Rocket Realty: listings fed from LockedOn REAXML files on SFTP.
-- Run once in the Supabase SQL editor (or `supabase db push`). Safe to re-run.

-- ── Listings ────────────────────────────────────────────────────────────────
create table if not exists public.listings (
  unique_id          text primary key,                 -- REAXML <uniqueID>
  agent_id           text,                             -- REAXML <agentID> (office code)
  short_id           text not null unique,             -- stable 8-char id used at the end of the URL slug
  slug               text not null,                    -- e.g. 18-5-further-street-rochedale-south-qld-4123-k3j9x2ab
  kind               text not null,                    -- residential | rental | land | rural | commercial | …
  status             text not null,                    -- current | sold | leased | withdrawn | offmarket
  mode               text generated always as (
                       case when status = 'sold' then 'sold'
                            when kind in ('rental', 'holidayRental') then 'rent'
                            else 'buy' end) stored,
  is_public          boolean generated always as (status in ('current', 'sold')) stored,

  -- address
  sub_number         text,
  street_number      text,
  street             text,
  suburb             text,
  state              text,
  postcode           text,
  address_display    boolean not null default true,    -- false: vendor hides the street, show suburb only

  category           text,                             -- House | Townhouse | Unit | Land | …
  headline           text,
  description        text,

  -- sale price (price is never sent to the browser when price_display = false)
  price              numeric,
  price_display      boolean not null default true,
  price_view         text,                             -- the agent's display text, e.g. "Submit Offers"
  under_offer        boolean not null default false,
  auction_at         timestamptz,
  new_construction   boolean not null default false,
  home_land_package  boolean not null default false,

  -- rental
  rent               numeric,
  rent_period        text,                             -- week | month
  rent_display       boolean not null default true,
  bond               numeric,
  date_available     date,
  deposit_taken      boolean not null default false,

  -- sold
  sold_price         numeric,
  sold_price_display boolean not null default false,
  sold_date          date,

  -- specs
  beds               smallint,
  baths              smallint,
  ensuites           smallint,
  toilets            smallint,
  garages            smallint,
  carports           smallint,
  open_spaces        smallint,
  land_area          numeric,
  land_unit          text,                             -- m² | acres | ha
  building_area      numeric,
  building_unit      text,

  features           text[] not null default '{}',     -- human-readable feature labels
  allowances         jsonb  not null default '{}',     -- { pets, furnished, smokers } for rentals
  agents             jsonb  not null default '[]',     -- [{ name, phone, email }]
  inspections        jsonb  not null default '[]',     -- [{ start, end }] ISO timestamps
  images             jsonb  not null default '[]',     -- [{ url, w, h, blur }] in display order
  floorplans         jsonb  not null default '[]',     -- [{ url, w, h }]
  video_url          text,
  tour_url           text,

  mod_time           timestamptz not null,             -- REAXML modTime; older updates are ignored
  listed_at          timestamptz,                      -- first time the feed showed it (drives the "New" flag)
  source_file        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists listings_public_mode_idx on public.listings (mode, suburb) where is_public;
create index if not exists listings_listed_idx      on public.listings (listed_at desc);
create index if not exists listings_sold_idx        on public.listings (sold_date desc) where status = 'sold';

-- ── Feed ledger: one row per XML file picked up from SFTP ───────────────────
create table if not exists public.feed_files (
  name          text primary key,
  size          bigint,
  remote_mtime  timestamptz,
  status        text not null,                         -- ok | error | ignored
  error         text,
  listings      text[] not null default '{}',          -- unique_ids touched by this file
  processed_at  timestamptz not null default now()
);

-- ── Run lock: stops two overlapping cron runs importing the same files ──────
create table if not exists public.feed_lock (
  id           int primary key default 1 check (id = 1),
  holder       text,
  locked_until timestamptz not null default 'epoch'
);
insert into public.feed_lock (id) values (1) on conflict do nothing;

create or replace function public.feed_try_lock(p_holder text, p_ttl_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  update feed_lock set holder = p_holder, locked_until = now() + make_interval(secs => p_ttl_seconds)
   where id = 1 and (locked_until < now() or holder = p_holder)
  returning true into ok;
  return coalesce(ok, false);
end $$;

create or replace function public.feed_release_lock(p_holder text)
returns void language sql security definer set search_path = public as $$
  update feed_lock set locked_until = 'epoch' where id = 1 and holder = p_holder;
$$;

-- ── Access: server-only. RLS on with no policies = anon/authenticated get nothing;
-- the site reads and the importer writes with the secret (service role) key. ──
alter table public.listings   enable row level security;
alter table public.feed_files enable row level security;
alter table public.feed_lock  enable row level security;
revoke all on function public.feed_try_lock(text, int)  from public, anon, authenticated;
revoke all on function public.feed_release_lock(text)   from public, anon, authenticated;
