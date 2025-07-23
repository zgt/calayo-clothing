-- Post-Migration Database Schema
-- This shows the final state after migrating from Supabase Auth to Better-Auth

-- Better-Auth Tables

create table public.user (
    id text not null,
    email text not null,
    emailVerified boolean not null default false,
    name text null,
    createdAt timestamp not null default now(),
    updatedAt timestamp not null default now(),
    image text null,
    email_confirmed_at timestamp null,
    role text not null default 'user',
    constraint user_pkey primary key (id),
    constraint user_email_key unique (email),
    constraint check_user_role check (role in ('user', 'admin', 'moderator'))
);

create table public.account (
    id text not null,
    accountId text not null,
    providerId text not null,
    userId text not null,
    accessToken text null,
    refreshToken text null,
    idToken text null,
    accessTokenExpiresAt timestamp null,
    refreshTokenExpiresAt timestamp null,
    scope text null,
    password text null,
    createdAt timestamp not null default now(),
    updatedAt timestamp not null default now(),
    constraint account_pkey primary key (id),
    constraint account_userId_fkey foreign key (userId) references user(id) on delete cascade
);

create table public.session (
    id text not null,
    expiresAt timestamp not null,
    token text not null,
    createdAt timestamp not null default now(),
    updatedAt timestamp not null default now(),
    ipAddress text null,
    userAgent text null,
    userId text not null,
    constraint session_pkey primary key (id),
    constraint session_token_key unique (token),
    constraint session_userId_fkey foreign key (userId) references user(id) on delete cascade
);

create table public.verification (
    id text not null,
    identifier text not null,
    value text not null,
    expiresAt timestamp not null,
    createdAt timestamp not null default now(),
    updatedAt timestamp not null default now(),
    constraint verification_pkey primary key (id)
);

create table public.passwordReset (
    id text not null,
    userId text not null,
    token text not null,
    expiresAt timestamp not null,
    createdAt timestamp not null default now(),
    updatedAt timestamp not null default now(),
    constraint passwordReset_pkey primary key (id),
    constraint passwordReset_token_key unique (token),
    constraint passwordReset_userId_fkey foreign key (userId) references user(id) on delete cascade
);

-- Application Tables (Updated)

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
  role character varying(50) not null default 'user',
  better_auth_user_id text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_better_auth_user_id_fkey foreign key (better_auth_user_id) references user(id) on delete cascade,
  constraint check_profiles_role check (role in ('user', 'admin', 'moderator'))
);

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
  constraint commissions_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);

create table public.messages (
  id uuid not null,
  commission_id uuid not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp with time zone not null default now(),
  read boolean not null default false,
  constraint messages_pkey primary key (id),
  constraint messages_commission_id_fkey foreign key (commission_id) references commissions (id) on delete cascade,
  constraint messages_sender_id_fkey foreign key (sender_id) references profiles (id) on delete cascade
);

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
  constraint profile_measurements_profile_id_fkey foreign key (profile_id) references profiles (id) on delete cascade
);

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
  constraint commission_measurements_commission_id_fkey foreign key (commission_id) references commissions (id) on delete cascade
);

-- Indexes

-- Better-Auth indexes
create index if not exists idx_user_email on public.user(email);
create index if not exists idx_account_userId on public.account(userId);
create index if not exists idx_account_providerId on public.account(providerId);
create index if not exists idx_session_userId on public.session(userId);
create index if not exists idx_session_token on public.session(token);
create index if not exists idx_verification_identifier on public.verification(identifier);
create index if not exists idx_passwordReset_userId on public.passwordReset(userId);
create index if not exists idx_passwordReset_token on public.passwordReset(token);

-- Application indexes
create index if not exists idx_profiles_email on public.profiles using btree (email);
create index if not exists idx_profiles_role on public.profiles using btree (role);
create index if not exists idx_profiles_better_auth_user_id on public.profiles using btree (better_auth_user_id);
create index if not exists idx_commissions_user_id on public.commissions using btree (user_id);
create index if not exists idx_commissions_status on public.commissions using btree (status);
create index if not exists idx_messages_commission_id on public.messages using btree (commission_id);
create index if not exists idx_messages_sender_id on public.messages using btree (sender_id);
create index if not exists idx_messages_read on public.messages using btree (read);