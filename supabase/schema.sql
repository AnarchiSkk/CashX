-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  avatar_url text,
  balance numeric default 1000,
  xp integer default 0,
  level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- It copies the email from auth.users to public.profiles
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, balance)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 1000);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
