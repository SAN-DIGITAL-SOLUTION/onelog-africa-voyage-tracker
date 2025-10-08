-- Enable RLS on user_roles table if not already enabled
alter table public.user_roles enable row level security;

-- Create policy to allow users to read their own role
create policy "Allow users to read their own role"
on public.user_roles for select
using (auth.uid() = user_id);
