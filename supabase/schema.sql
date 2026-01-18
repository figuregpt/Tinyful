-- Tinyful Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Plans table
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  target_date date,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Steps table
create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  order_index int not null,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz default now()
);

-- Chat sessions table
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_id uuid references public.plans,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.plans enable row level security;
alter table public.steps enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;

-- Plans policies
create policy "Users can view their own plans"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "Users can create their own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plans"
  on public.plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own plans"
  on public.plans for delete
  using (auth.uid() = user_id);

-- Steps policies
create policy "Users can view steps of their plans"
  on public.steps for select
  using (
    exists (
      select 1 from public.plans
      where plans.id = steps.plan_id
      and plans.user_id = auth.uid()
    )
  );

create policy "Users can create steps for their plans"
  on public.steps for insert
  with check (
    exists (
      select 1 from public.plans
      where plans.id = plan_id
      and plans.user_id = auth.uid()
    )
  );

create policy "Users can update steps of their plans"
  on public.steps for update
  using (
    exists (
      select 1 from public.plans
      where plans.id = steps.plan_id
      and plans.user_id = auth.uid()
    )
  );

create policy "Users can delete steps of their plans"
  on public.steps for delete
  using (
    exists (
      select 1 from public.plans
      where plans.id = steps.plan_id
      and plans.user_id = auth.uid()
    )
  );

-- Chat sessions policies
create policy "Users can view their own chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own chat sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in their sessions"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their sessions"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists idx_plans_user_id on public.plans(user_id);
create index if not exists idx_steps_plan_id on public.steps(plan_id);
create index if not exists idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index if not exists idx_messages_session_id on public.messages(session_id);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for plans updated_at
create trigger update_plans_updated_at
  before update on public.plans
  for each row
  execute function public.update_updated_at_column();
