-- ADDITIVE PORTFOLIO MIGRATION. Review/apply to a development project first.
-- Does not modify any IdeoFest table, policy, data, or auth settings.
begin;

create table public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from public, anon, authenticated;
grant select on public.portfolio_admins to authenticated;
create policy portfolio_membership_self on public.portfolio_admins for select to authenticated using (user_id = (select auth.uid()));

create function public.is_portfolio_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.portfolio_admins where user_id = (select auth.uid()) and active);
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table public.portfolio_projects (
  id uuid primary key,
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 100),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_projects enable row level security;
revoke all on public.portfolio_projects from public, anon, authenticated;
grant select, insert, update on public.portfolio_projects to authenticated;
create policy portfolio_projects_admin on public.portfolio_projects for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

-- Separate public snapshot: private drafts never appear in public rows.
create table public.portfolio_publications (
  project_id uuid primary key references public.portfolio_projects(id),
  slug text unique not null,
  content jsonb not null,
  sort_order integer not null,
  featured boolean not null,
  published_at timestamptz not null default now()
);
alter table public.portfolio_publications enable row level security;
revoke all on public.portfolio_publications from public, anon, authenticated;
grant select on public.portfolio_publications to anon, authenticated;
grant insert, update, delete on public.portfolio_publications to authenticated;
create policy portfolio_public_read on public.portfolio_publications for select to anon, authenticated using (true);
create policy portfolio_publication_admin on public.portfolio_publications for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create table public.portfolio_revisions (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.portfolio_projects(id),
  content jsonb not null,
  action text not null check(action in ('publish','archive')),
  actor uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.portfolio_revisions enable row level security;
revoke all on public.portfolio_revisions from public, anon, authenticated;
grant select, insert on public.portfolio_revisions to authenticated;
revoke all on sequence public.portfolio_revisions_id_seq from public, anon, authenticated;
grant usage on sequence public.portfolio_revisions_id_seq to authenticated;
create policy portfolio_revisions_read on public.portfolio_revisions for select to authenticated using ((select public.is_portfolio_admin()));
create policy portfolio_revisions_insert on public.portfolio_revisions for insert to authenticated with check ((select public.is_portfolio_admin()) and actor = (select auth.uid()));

create function public.portfolio_publish(target_id uuid, expected_version integer) returns void
language plpgsql security invoker set search_path = '' as $$
declare item public.portfolio_projects;
begin
  if not public.is_portfolio_admin() then raise exception 'Not authorized'; end if;
  select * into item from public.portfolio_projects where id = target_id for update;
  if not found or item.version <> expected_version then raise exception 'Project changed. Reload before publishing.'; end if;
  if jsonb_typeof(item.draft->'photos') is distinct from 'array' or jsonb_typeof(item.draft->'services') is distinct from 'array' then raise exception 'Invalid project'; end if;
  if jsonb_array_length(item.draft->'photos') < 1 or jsonb_array_length(item.draft->'services') < 1 or length(coalesce(item.draft->>'title','')) < 2 then raise exception 'Incomplete project'; end if;
  insert into public.portfolio_publications(project_id,slug,content,sort_order,featured,published_at)
    values(item.id,item.slug,item.draft,item.sort_order,item.featured,now())
    on conflict(project_id) do update set slug=excluded.slug,content=excluded.content,sort_order=excluded.sort_order,featured=excluded.featured,published_at=excluded.published_at;
  insert into public.portfolio_revisions(project_id,content,action,actor) values(item.id,item.draft,'publish',auth.uid());
  update public.portfolio_projects set status='published',version=version+1,updated_at=now() where id=target_id;
end;
$$;
create function public.portfolio_archive(target_id uuid, expected_version integer) returns void
language plpgsql security invoker set search_path = '' as $$
declare item public.portfolio_projects;
begin
  if not public.is_portfolio_admin() then raise exception 'Not authorized'; end if;
  select * into item from public.portfolio_projects where id=target_id for update;
  if not found or item.version <> expected_version then raise exception 'Project changed. Reload before archiving.'; end if;
  delete from public.portfolio_publications where project_id=target_id;
  insert into public.portfolio_revisions(project_id,content,action,actor) values(item.id,item.draft,'archive',auth.uid());
  update public.portfolio_projects set status='archived',version=version+1,updated_at=now() where id=target_id;
end;
$$;
revoke all on function public.portfolio_publish(uuid,integer), public.portfolio_archive(uuid,integer) from public;
grant execute on function public.portfolio_publish(uuid,integer), public.portfolio_archive(uuid,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-media','portfolio-media',false,10485760,array['image/jpeg','image/png','image/webp']);
-- Media stays private. Only the application serves published references.
create policy portfolio_storage_admin_read on storage.objects for select to authenticated using (bucket_id='portfolio-media' and (select public.is_portfolio_admin()));
create policy portfolio_storage_admin_insert on storage.objects for insert to authenticated with check (
  bucket_id='portfolio-media' and (select public.is_portfolio_admin())
  and exists(select 1 from public.portfolio_projects where id::text=(storage.foldername(name))[1])
);
create policy portfolio_storage_published_read on storage.objects for select to anon, authenticated using (
  bucket_id='portfolio-media' and exists (
    select 1 from public.portfolio_publications as publication,
      lateral jsonb_array_elements(publication.content->'photos') as photo
    where photo->>'src' = '/api/portfolio/media/' || storage.objects.name
  )
);
-- No overwrite/delete policy: publishing and archiving never destroy originals.
create index portfolio_public_order on public.portfolio_publications(sort_order, published_at);
commit;
