-- 1. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Insert the default organization if it doesn't exist
INSERT INTO public.organizations (name)
VALUES ('OneLog Africa')
ON CONFLICT (name) DO NOTHING;

-- 3. Function to assign a default role and organization to a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_org_id uuid;
begin
  -- Get the ID of the default organization (e.g., 'OneLog Africa')
  select id into default_org_id from public.organizations where name = 'OneLog Africa' limit 1;

  -- If the default organization doesn't exist, you might want to handle that case
  -- For now, we'll proceed only if it exists.
  if default_org_id is not null then
    -- Insert into user_roles
    insert into public.user_roles (user_id, role, organization_id)
    values (new.id, 'client', default_org_id);

  end if;

  return new;
end;
$$;

-- Trigger to call the function after a new user is created in auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
