-- Create notification_logs table
create table public.notification_logs (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  type text not null,
  channel text not null,
  status text not null,
  recipient text not null,
  sender text,
  content text,
  metadata jsonb,
  error_message text,
  
  constraint notification_logs_pkey primary key (id)
) tablespace pg_default;

-- Enable RLS
alter table public.notification_logs enable row level security;

-- Create indexes for common queries
create index idx_notification_logs_created_at on public.notification_logs(created_at);
create index idx_notification_logs_recipient on public.notification_logs(recipient);
create index idx_notification_logs_sender on public.notification_logs(sender);
create index idx_notification_logs_status on public.notification_logs(status);

-- Create RLS policies
create policy "Enable read access for authenticated users"
on public.notification_logs for select
to authenticated
using (true);

create policy "Enable insert for service role"
on public.notification_logs for insert
to service_role
with check (true);

-- Create notification_preferences table
create table public.notification_preferences (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default true,
  whatsapp_enabled boolean not null default true,
  push_enabled boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint notification_preferences_pkey primary key (id),
  constraint notification_preferences_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint notification_preferences_user_id_key unique (user_id)
) tablespace pg_default;

-- Enable RLS
alter table public.notification_preferences enable row level security;

-- Create RLS policies for notification_preferences
create policy "Users can view their own preferences"
on public.notification_preferences for select
using (auth.uid() = user_id);

create policy "Users can update their own preferences"
on public.notification_preferences for update
using (auth.uid() = user_id);

-- Create a function to update the updated_at column
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger update_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute function update_modified_column();
