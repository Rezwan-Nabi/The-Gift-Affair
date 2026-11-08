-- The Gift Affair — initial schema
-- Tables, indexes, search, Row Level Security and Storage policies (PRD §9).

create extension if not exists pgcrypto;

-- ─── Helpers ─────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Profiles & roles ────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- null = signed-in user with no content permissions. Roles are granted with SQL only (see README).
  role text check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Used by every write policy. SECURITY DEFINER so it can read profiles regardless of the caller's RLS.
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

-- ─── Taxonomy ────────────────────────────────────────────────────────

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tag_type text not null check (tag_type in ('occasion', 'recipient', 'budget')),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tag_type, slug)
);

-- ─── Gift ideas ──────────────────────────────────────────────────────

create table public.gift_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text not null check (char_length(summary) <= 200),
  description text not null,
  why_it_is_thoughtful text,
  keywords text,
  main_image_path text,
  image_alt text,
  price_amount numeric(12, 2) check (price_amount is null or price_amount >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  price_checked_at date,
  external_url text check (external_url is null or external_url ~* '^https?://'),
  source_name text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(keywords, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(summary, '')), 'C')
  ) stored,
  -- A shown price must say which currency and when it was checked (PRD §7.2).
  constraint price_needs_context check (price_amount is null or (currency is not null and price_checked_at is not null)),
  constraint image_needs_alt check (main_image_path is null or coalesce(image_alt, '') <> '')
);

create index gift_ideas_status_published_idx on public.gift_ideas (status, published_at desc);
create index gift_ideas_featured_idx on public.gift_ideas (is_featured) where status = 'published';
create index gift_ideas_search_idx on public.gift_ideas using gin (search_vector);

-- Stamp published_at the first time an idea is published.
create or replace function public.stamp_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger gift_ideas_published_at before insert or update on public.gift_ideas
  for each row execute function public.stamp_published_at();

create table public.gift_category_links (
  gift_id uuid not null references public.gift_ideas (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (gift_id, category_id)
);
create index gift_category_links_category_idx on public.gift_category_links (category_id);

create table public.gift_tag_links (
  gift_id uuid not null references public.gift_ideas (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (gift_id, tag_id)
);
create index gift_tag_links_tag_idx on public.gift_tag_links (tag_id);

create table public.gift_images (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gift_ideas (id) on delete cascade,
  path text not null,
  alt text not null,
  sort_order integer not null default 0
);
create index gift_images_gift_idx on public.gift_images (gift_id, sort_order);

-- ─── Gift guides ─────────────────────────────────────────────────────

create table public.gift_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  introduction text not null,
  content text not null default '',
  cover_image_path text,
  cover_image_alt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gift_guides_status_idx on public.gift_guides (status, published_at desc);

create trigger gift_guides_published_at before insert or update on public.gift_guides
  for each row execute function public.stamp_published_at();

create table public.gift_guide_items (
  guide_id uuid not null references public.gift_guides (id) on delete cascade,
  gift_idea_id uuid not null references public.gift_ideas (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (guide_id, gift_idea_id)
);

-- updated_at triggers
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger tags_updated_at before update on public.tags for each row execute function public.set_updated_at();
create trigger gift_ideas_updated_at before update on public.gift_ideas for each row execute function public.set_updated_at();
create trigger gift_guides_updated_at before update on public.gift_guides for each row execute function public.set_updated_at();

-- ─── Search ──────────────────────────────────────────────────────────
-- Returns matching published gift ids for one page, plus the total match count.
-- SECURITY INVOKER: the caller's RLS still applies.

create or replace function public.search_gifts(
  p_q text default '',
  p_category text default '',
  p_occasion text default '',
  p_recipient text default '',
  p_budget text default '',
  p_sort text default 'featured',
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (id uuid, total_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      trim(coalesce(p_q, '')) as q,
      '%' || replace(replace(replace(trim(coalesce(p_q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%' as q_like
  ),
  matched as (
    select g.id, g.is_featured, coalesce(g.published_at, g.created_at) as sort_date
    from public.gift_ideas g, params p
    where g.status = 'published'
      and (
        p.q = ''
        or g.search_vector @@ websearch_to_tsquery('simple'::regconfig, p.q)
        or g.title ilike p.q_like
        or g.summary ilike p.q_like
        or g.keywords ilike p.q_like
      )
      and (coalesce(p_category, '') = '' or exists (
        select 1 from public.gift_category_links l
        join public.categories c on c.id = l.category_id
        where l.gift_id = g.id and c.slug = p_category))
      and (coalesce(p_occasion, '') = '' or exists (
        select 1 from public.gift_tag_links l
        join public.tags t on t.id = l.tag_id
        where l.gift_id = g.id and t.tag_type = 'occasion' and t.slug = p_occasion))
      and (coalesce(p_recipient, '') = '' or exists (
        select 1 from public.gift_tag_links l
        join public.tags t on t.id = l.tag_id
        where l.gift_id = g.id and t.tag_type = 'recipient' and t.slug = p_recipient))
      and (coalesce(p_budget, '') = '' or exists (
        select 1 from public.gift_tag_links l
        join public.tags t on t.id = l.tag_id
        where l.gift_id = g.id and t.tag_type = 'budget' and t.slug = p_budget))
  )
  select m.id, count(*) over () as total_count
  from matched m
  order by
    case when p_sort = 'featured' then m.is_featured end desc nulls last,
    m.sort_date desc,
    m.id
  limit least(greatest(p_limit, 1), 48)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.search_gifts(text, text, text, text, text, text, integer, integer) to anon, authenticated;

-- ─── Row Level Security ──────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.gift_ideas enable row level security;
alter table public.gift_category_links enable row level security;
alter table public.gift_tag_links enable row level security;
alter table public.gift_images enable row level security;
alter table public.gift_guides enable row level security;
alter table public.gift_guide_items enable row level security;

-- Profiles: people read their own row. There are deliberately no insert/update/delete
-- policies, so nobody can grant themselves a role through the API.
create policy "Read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

-- Categories and tags: everyone reads active ones; editors read and change all.
create policy "Read active categories" on public.categories
  for select using (is_active or (select public.is_editor()));
create policy "Editors insert categories" on public.categories
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors update categories" on public.categories
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete categories" on public.categories
  for delete to authenticated using ((select public.is_editor()));

create policy "Read active tags" on public.tags
  for select using (is_active or (select public.is_editor()));
create policy "Editors insert tags" on public.tags
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors update tags" on public.tags
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete tags" on public.tags
  for delete to authenticated using ((select public.is_editor()));

-- Gift ideas: the public reads published ideas only.
create policy "Read published gifts" on public.gift_ideas
  for select using (status = 'published' or (select public.is_editor()));
create policy "Editors insert gifts" on public.gift_ideas
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors update gifts" on public.gift_ideas
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete gifts" on public.gift_ideas
  for delete to authenticated using ((select public.is_editor()));

-- Link and image rows are visible when their gift is visible (the subquery is itself filtered by RLS).
create policy "Read links of visible gifts" on public.gift_category_links
  for select using (exists (select 1 from public.gift_ideas g where g.id = gift_id));
create policy "Editors write category links" on public.gift_category_links
  for all to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));

create policy "Read tag links of visible gifts" on public.gift_tag_links
  for select using (exists (select 1 from public.gift_ideas g where g.id = gift_id));
create policy "Editors write tag links" on public.gift_tag_links
  for all to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));

create policy "Read images of visible gifts" on public.gift_images
  for select using (exists (select 1 from public.gift_ideas g where g.id = gift_id));
create policy "Editors write gift images" on public.gift_images
  for all to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));

create policy "Read published guides" on public.gift_guides
  for select using (status = 'published' or (select public.is_editor()));
create policy "Editors insert guides" on public.gift_guides
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors update guides" on public.gift_guides
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete guides" on public.gift_guides
  for delete to authenticated using ((select public.is_editor()));

create policy "Read items of visible guides" on public.gift_guide_items
  for select using (
    exists (select 1 from public.gift_guides g where g.id = guide_id)
    and exists (select 1 from public.gift_ideas i where i.id = gift_idea_id)
  );
create policy "Editors write guide items" on public.gift_guide_items
  for all to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));

-- ─── Storage ─────────────────────────────────────────────────────────
-- Public bucket: anyone can view an image by URL. Only editors can upload, replace or delete.
-- Size and type limits are enforced by Storage itself, not just the admin UI.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gift-images', 'gift-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Editors list gift images" on storage.objects
  for select to authenticated using (bucket_id = 'gift-images' and (select public.is_editor()));
create policy "Editors upload gift images" on storage.objects
  for insert to authenticated with check (bucket_id = 'gift-images' and (select public.is_editor()));
create policy "Editors update gift images" on storage.objects
  for update to authenticated using (bucket_id = 'gift-images' and (select public.is_editor()));
create policy "Editors delete gift images" on storage.objects
  for delete to authenticated using (bucket_id = 'gift-images' and (select public.is_editor()));
