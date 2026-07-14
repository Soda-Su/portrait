create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'candidate' check (role in ('candidate', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.intakes (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text not null,
  data jsonb not null,
  formspree_delivery_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.work_sources (
  id text primary key,
  intake_id text not null references public.intakes(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.passports (
  id text primary key,
  intake_id text not null references public.intakes(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text not null,
  data jsonb not null,
  generation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.share_links (
  id text primary key,
  passport_id text not null references public.passports(id) on delete cascade,
  token_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.chat_sessions (
  id text primary key,
  passport_id text not null references public.passports(id) on delete cascade,
  share_link_id text not null references public.share_links(id) on delete cascade,
  visitor_id text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  session_id text not null references public.chat_sessions(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id text primary key,
  passport_id text not null references public.passports(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  passport_id text references public.passports(id) on delete cascade,
  intake_id text references public.intakes(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists intakes_owner_id_idx on public.intakes(owner_id);
create index if not exists passports_owner_id_idx on public.passports(owner_id);
create index if not exists chat_sessions_passport_id_idx on public.chat_sessions(passport_id);
create unique index if not exists chat_sessions_share_visitor_idx on public.chat_sessions(share_link_id, visitor_id);
create index if not exists chat_messages_session_id_idx on public.chat_messages(session_id);

alter table public.profiles enable row level security;
alter table public.intakes enable row level security;
alter table public.work_sources enable row level security;
alter table public.passports enable row level security;
alter table public.share_links enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.feedback enable row level security;
alter table public.events enable row level security;

create policy "profiles own row" on public.profiles for select using (auth.uid() = id);
create policy "intakes owner read" on public.intakes for select using (auth.uid() = owner_id);
create policy "passports owner read" on public.passports for select using (auth.uid() = owner_id);
create policy "passports owner update" on public.passports for update using (auth.uid() = owner_id);
create policy "work sources owner read" on public.work_sources for select using (
  exists (select 1 from public.intakes where intakes.id = work_sources.intake_id and intakes.owner_id = auth.uid())
);
create policy "share links owner read" on public.share_links for select using (
  exists (select 1 from public.passports where passports.id = share_links.passport_id and passports.owner_id = auth.uid())
);

create policy "chat sessions owner read" on public.chat_sessions for select using (
  exists (select 1 from public.passports where passports.id = chat_sessions.passport_id and passports.owner_id = auth.uid())
);
create policy "chat messages owner read" on public.chat_messages for select using (
  exists (
    select 1 from public.chat_sessions
    join public.passports on passports.id = chat_sessions.passport_id
    where chat_sessions.id = chat_messages.session_id and passports.owner_id = auth.uid()
  )
);
create policy "feedback owner read" on public.feedback for select using (
  exists (select 1 from public.passports where passports.id = feedback.passport_id and passports.owner_id = auth.uid())
);
create policy "events owner read" on public.events for select using (
  exists (
    select 1 from public.passports
    where passports.id = events.passport_id and passports.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.intakes
    where intakes.id = events.intake_id and intakes.owner_id = auth.uid()
  )
);

create or replace function public.is_portray_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$;

create policy "admins read profiles" on public.profiles for select using (public.is_portray_admin());
create policy "admins read intakes" on public.intakes for select using (public.is_portray_admin());
create policy "admins read work sources" on public.work_sources for select using (public.is_portray_admin());
create policy "admins read passports" on public.passports for select using (public.is_portray_admin());
create policy "admins read share links" on public.share_links for select using (public.is_portray_admin());
create policy "admins read chat sessions" on public.chat_sessions for select using (public.is_portray_admin());
create policy "admins read chat messages" on public.chat_messages for select using (public.is_portray_admin());
create policy "admins read feedback" on public.feedback for select using (public.is_portray_admin());
create policy "admins read events" on public.events for select using (public.is_portray_admin());
