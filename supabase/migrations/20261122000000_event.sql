begin;

create table public.event_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.event_state (
  id integer primary key check (id = 1),
  revision bigint not null default 0,
  payload jsonb not null default '{"players":[],"events":{}}'
    check (
      jsonb_typeof(payload) = 'object'
      and payload ?& array['players', 'events']
      and jsonb_typeof(payload->'players') = 'array'
      and jsonb_typeof(payload->'events') = 'object'
    )
);

insert into public.event_state (id) values (1);

alter table public.event_admins enable row level security;
alter table public.event_state enable row level security;

revoke all on public.event_admins, public.event_state from public, anon, authenticated;
grant select on public.event_admins, public.event_state to authenticated;

create policy own_membership on public.event_admins for select to authenticated
using (user_id = (select auth.uid()));

create policy admin_read on public.event_state for select to authenticated
using (exists (select 1 from public.event_admins where user_id = (select auth.uid())));

create function public.save_event_state(expected_revision bigint, new_payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
begin
  if not exists (
    select 1 from public.event_admins where user_id = auth.uid()
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.event_state
  set payload = new_payload, revision = revision + 1
  where id = 1 and revision = expected_revision
  returning revision into next_revision;

  return next_revision;
end;
$$;

revoke all on function public.save_event_state(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_event_state(bigint, jsonb) to authenticated;

commit;
