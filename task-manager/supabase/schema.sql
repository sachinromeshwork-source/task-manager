-- Run this whole file once in Supabase: SQL Editor > New query > Run

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  position text default '',
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  assigned_to uuid references public.profiles(id) on delete set null,
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  due_date date,
  status text not null default 'Pending' check (status in ('Pending','In Progress','Completed')),
  created_at timestamptz default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- New auth user -> profile. The very first user becomes Admin; everyone else is a member.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, position, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'position',''),
    case when exists (select 1 from profiles) then 'member' else 'admin' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin removes a team member completely (login + profile)
create or replace function public.delete_member(uid uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  if uid = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  delete from auth.users where id = uid;
end $$;

-- Team members may only change the status of their tasks
create or replace function public.limit_member_task_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    if new.name is distinct from old.name or new.description is distinct from old.description
       or new.assigned_to is distinct from old.assigned_to or new.priority is distinct from old.priority
       or new.due_date is distinct from old.due_date then
      raise exception 'Team members can only change task status';
    end if;
  end if;
  return new;
end $$;
create trigger tasks_member_limit before update on public.tasks
  for each row execute function public.limit_member_task_update();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles admin write" on profiles for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "tasks admin all" on tasks for all to authenticated
  using (is_admin()) with check (is_admin());
create policy "tasks member read" on tasks for select to authenticated
  using (assigned_to = auth.uid());
create policy "tasks member update" on tasks for update to authenticated
  using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());
