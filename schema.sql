-- 1. Create Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  phone text,
  address text,
  barangay text,
  role text default 'Owner',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Auth Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, address, barangay, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'barangay',
    COALESCE(new.raw_user_meta_data->>'role', 'Owner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Create Pets table
create table public.pets (
  id uuid default gen_random_uuid() primary key,
  owner_user_id uuid references public.profiles(id) on delete cascade,
  owner_name text,
  name text,
  species text,
  breed text,
  color_markings text,
  size text,
  date_of_birth date,
  sex text,
  spayed_neutered boolean,
  microchip_number text,
  photo_url text,
  registration_number text,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Vaccinations table
create table public.vaccinations (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references public.pets(id) on delete cascade,
  vaccine_name text,
  date_given date,
  next_due_at date,
  administered_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Lost Pet Reports table
create table public.lost_pet_reports (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references public.pets(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete cascade,
  last_seen_location text,
  last_seen_date date,
  description text,
  contact_info text,
  status text default 'Pending',
  reward_amount text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create System Settings table
create table public.system_settings (
  id uuid default gen_random_uuid() primary key,
  admin_email text,
  maintenance_mode boolean default false,
  notification_banner text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Activity Logs table
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  action text,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Storage bucket creation for 'pet-photos'
insert into storage.buckets (id, name, public) values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "public access to pet-photos" on storage.objects for select using ( bucket_id = 'pet-photos' );
create policy "public insert to pet-photos" on storage.objects for insert with check ( bucket_id = 'pet-photos' );
