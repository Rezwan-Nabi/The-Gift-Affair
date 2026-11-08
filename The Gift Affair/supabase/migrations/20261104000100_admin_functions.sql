-- Transactional save functions for the admin dashboard.
-- SECURITY INVOKER: they run as the signed-in editor, so every statement is still checked by RLS.
-- They exist so a gift (or guide) and all its links are saved together or not at all.

create or replace function public.save_gift(
  p_id uuid,
  p_gift jsonb,
  p_category_ids uuid[],
  p_tag_ids uuid[],
  p_images jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.is_editor() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  if p_id is null then
    insert into public.gift_ideas (
      title, slug, summary, description, why_it_is_thoughtful, keywords, main_image_path, image_alt,
      price_amount, currency, price_checked_at, external_url, source_name, is_featured, status
    ) values (
      p_gift ->> 'title', p_gift ->> 'slug', p_gift ->> 'summary', p_gift ->> 'description',
      p_gift ->> 'why_it_is_thoughtful', p_gift ->> 'keywords', p_gift ->> 'main_image_path', p_gift ->> 'image_alt',
      (p_gift ->> 'price_amount')::numeric, p_gift ->> 'currency', (p_gift ->> 'price_checked_at')::date,
      p_gift ->> 'external_url', p_gift ->> 'source_name',
      coalesce((p_gift ->> 'is_featured')::boolean, false), coalesce(p_gift ->> 'status', 'draft')
    )
    returning id into v_id;
  else
    update public.gift_ideas set
      title = p_gift ->> 'title',
      slug = p_gift ->> 'slug',
      summary = p_gift ->> 'summary',
      description = p_gift ->> 'description',
      why_it_is_thoughtful = p_gift ->> 'why_it_is_thoughtful',
      keywords = p_gift ->> 'keywords',
      main_image_path = p_gift ->> 'main_image_path',
      image_alt = p_gift ->> 'image_alt',
      price_amount = (p_gift ->> 'price_amount')::numeric,
      currency = p_gift ->> 'currency',
      price_checked_at = (p_gift ->> 'price_checked_at')::date,
      external_url = p_gift ->> 'external_url',
      source_name = p_gift ->> 'source_name',
      is_featured = coalesce((p_gift ->> 'is_featured')::boolean, false),
      status = coalesce(p_gift ->> 'status', 'draft')
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Gift idea not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.gift_category_links where gift_id = v_id;
  insert into public.gift_category_links (gift_id, category_id)
    select v_id, unnest(coalesce(p_category_ids, '{}'::uuid[]));

  delete from public.gift_tag_links where gift_id = v_id;
  insert into public.gift_tag_links (gift_id, tag_id)
    select v_id, unnest(coalesce(p_tag_ids, '{}'::uuid[]));

  delete from public.gift_images where gift_id = v_id;
  insert into public.gift_images (gift_id, path, alt, sort_order)
    select v_id, img ->> 'path', img ->> 'alt', (ord - 1)::integer
    from jsonb_array_elements(coalesce(p_images, '[]'::jsonb)) with ordinality as t(img, ord);

  return v_id;
end;
$$;

create or replace function public.save_guide(p_id uuid, p_guide jsonb, p_gift_ids uuid[])
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.is_editor() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  if p_id is null then
    insert into public.gift_guides (title, slug, introduction, content, cover_image_path, cover_image_alt, status)
    values (
      p_guide ->> 'title', p_guide ->> 'slug', p_guide ->> 'introduction', coalesce(p_guide ->> 'content', ''),
      p_guide ->> 'cover_image_path', p_guide ->> 'cover_image_alt', coalesce(p_guide ->> 'status', 'draft')
    )
    returning id into v_id;
  else
    update public.gift_guides set
      title = p_guide ->> 'title',
      slug = p_guide ->> 'slug',
      introduction = p_guide ->> 'introduction',
      content = coalesce(p_guide ->> 'content', ''),
      cover_image_path = p_guide ->> 'cover_image_path',
      cover_image_alt = p_guide ->> 'cover_image_alt',
      status = coalesce(p_guide ->> 'status', 'draft')
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Guide not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.gift_guide_items where guide_id = v_id;
  insert into public.gift_guide_items (guide_id, gift_idea_id, sort_order)
    select v_id, gid, (ord - 1)::integer
    from unnest(coalesce(p_gift_ids, '{}'::uuid[])) with ordinality as t(gid, ord);

  return v_id;
end;
$$;

revoke all on function public.save_gift(uuid, jsonb, uuid[], uuid[], jsonb) from public, anon;
revoke all on function public.save_guide(uuid, jsonb, uuid[]) from public, anon;
grant execute on function public.save_gift(uuid, jsonb, uuid[], uuid[], jsonb) to authenticated;
grant execute on function public.save_guide(uuid, jsonb, uuid[]) to authenticated;
