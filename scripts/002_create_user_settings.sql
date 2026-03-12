-- Create user_settings table for storing user preferences
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_budget decimal(12, 2) default 50000.00,
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for user_settings
alter table public.user_settings enable row level security;

-- RLS Policies for user_settings
create policy "settings_select_own" on public.user_settings 
  for select using (auth.uid() = user_id);

create policy "settings_insert_own" on public.user_settings 
  for insert with check (auth.uid() = user_id);

create policy "settings_update_own" on public.user_settings 
  for update using (auth.uid() = user_id);

create policy "settings_delete_own" on public.user_settings 
  for delete using (auth.uid() = user_id);
