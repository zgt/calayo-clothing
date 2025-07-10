create table public.commission_measurements (
  id uuid not null default extensions.uuid_generate_v4 (),
  commission_id uuid not null,
  chest numeric null,
  waist numeric null,
  hips numeric null,
  length numeric null,
  inseam numeric null,
  shoulders numeric null,
  neck numeric null,
  sleeve_length numeric null,
  bicep numeric null,
  forearm numeric null,
  wrist numeric null,
  armhole_depth numeric null,
  back_width numeric null,
  front_chest_width numeric null,
  thigh numeric null,
  knee numeric null,
  calf numeric null,
  ankle numeric null,
  rise numeric null,
  outseam numeric null,
  height numeric null,
  weight numeric null,
  torso_length numeric null,
  shoulder_slope numeric null,
  posture character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  fit_preference character varying null,
  size_preference character varying null,
  constraint commission_measurements_pkey primary key (id),
  constraint commission_measurements_commission_id_key unique (commission_id),
  constraint commission_measurements_commission_id_fkey foreign KEY (commission_id) references commissions (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.commissions (
  id uuid not null,
  status character varying not null,
  garment_type character varying not null,
  budget character varying not null,
  timeline character varying not null,
  details text null,
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint commissions_pkey primary key (id),
  constraint commissions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_commissions_user_id on public.commissions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_commissions_status on public.commissions using btree (status) TABLESPACE pg_default;

create table public.messages (
  id uuid not null,
  commission_id uuid not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp with time zone not null default now(),
  read boolean not null default false,
  constraint messages_pkey primary key (id),
  constraint messages_commission_id_fkey foreign KEY (commission_id) references commissions (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_messages_commission_id on public.messages using btree (commission_id) TABLESPACE pg_default;

create index IF not exists idx_messages_sender_id on public.messages using btree (sender_id) TABLESPACE pg_default;

create index IF not exists idx_messages_read on public.messages using btree (read) TABLESPACE pg_default;

create table public.profile_measurements (
  id uuid not null default extensions.uuid_generate_v4 (),
  profile_id uuid not null,
  chest numeric null,
  waist numeric null,
  hips numeric null,
  length numeric null,
  inseam numeric null,
  shoulders numeric null,
  neck numeric null,
  sleeve_length numeric null,
  bicep numeric null,
  forearm numeric null,
  wrist numeric null,
  armhole_depth numeric null,
  back_width numeric null,
  front_chest_width numeric null,
  thigh numeric null,
  knee numeric null,
  calf numeric null,
  ankle numeric null,
  rise numeric null,
  outseam numeric null,
  height numeric null,
  weight numeric null,
  torso_length numeric null,
  shoulder_slope numeric null,
  posture character varying null,
  size_preference character varying null,
  fit_preference character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profile_measurements_pkey primary key (id),
  constraint profile_measurements_profile_id_key unique (profile_id),
  constraint profile_measurements_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  email character varying not null,
  full_name character varying null,
  avatar_url character varying null,
  bio text null,
  website character varying null,
  location character varying null,
  phone character varying null,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default;