-- ====================================================================
-- brooo.ai — Master Database Schema Migration
-- Features: PostgreSQL + pgvector + RLS + Auto-Profile Trigger
-- ====================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- 2. ENUMS
create type source_type as enum ('text', 'image', 'pdf', 'email', 'url', 'voice');

create type doc_category as enum (
    'career', 'finance', 'insurance', 'education', 
    'government', 'bills', 'personal', 'scam_risk', 'other'
);

create type doc_status as enum ('pending', 'processing', 'processed', 'failed');

create type action_type as enum (
    'task', 'reminder', 'deadline', 'follow_up', 
    'renewal', 'payment', 'application', 'appointment', 
    'warning', 'information'
);

create type priority_level as enum ('low', 'medium', 'high', 'urgent');

create type action_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'dismissed');

create type reminder_status as enum ('pending', 'sent', 'cancelled');

create type memory_type as enum ('structured', 'semantic');

create type memory_category as enum ('career', 'documents', 'dates', 'preferences', 'general');

-- 3. TABLES

-- Profiles Table (Extends Supabase auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    avatar_url text,
    timezone text default 'UTC',
    language text default 'en',
    interests text[] default '{}',
    is_onboarded boolean default false,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Sources (Audit record of where information originated)
create table public.sources (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type source_type not null,
    title text,
    source_uri text,
    raw_content text,
    content_hash text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now() not null
);

-- Documents (Stored files in Supabase Storage)
create table public.documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source_id uuid references public.sources(id) on delete set null,
    file_name text not null,
    file_type text not null,
    storage_path text not null,
    category doc_category default 'other',
    extracted_text text,
    status doc_status default 'pending',
    error_message text,
    created_at timestamptz default now() not null
);

-- Document Chunks (Vector Embeddings for RAG)
create table public.document_chunks (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.documents(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    chunk_index int not null,
    content text not null,
    embedding vector(1536),
    created_at timestamptz default now() not null
);

-- Actions (THE core engine object of brooo.ai)
create table public.actions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source_id uuid references public.sources(id) on delete set null,
    document_id uuid references public.documents(id) on delete set null,
    type action_type not null,
    title text not null,
    summary text,
    priority priority_level default 'medium',
    deadline timestamptz,
    status action_status default 'pending',
    confidence float not null default 1.0,
    requires_confirmation boolean default false,
    entities jsonb default '{}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Tasks (User actionable to-dos)
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    action_id uuid references public.actions(id) on delete cascade,
    title text not null,
    notes text,
    due_date timestamptz,
    priority priority_level default 'medium',
    is_completed boolean default false,
    completed_at timestamptz,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Reminders (Time-scheduled alerts)
create table public.reminders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    action_id uuid references public.actions(id) on delete set null,
    title text not null,
    scheduled_at timestamptz not null,
    repeat_rule text,
    status reminder_status default 'pending',
    notification_id text,
    created_at timestamptz default now() not null
);

-- Memories (Structured & Semantic memory store)
create table public.memories (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source_id uuid references public.sources(id) on delete set null,
    type memory_type default 'structured',
    category memory_category not null,
    key text,
    value text not null,
    embedding vector(1536),
    confidence float default 1.0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Conversations & Messages (AI Chat OS)
create table public.conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text default 'Chat with brooo',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    action_ids uuid[] default '{}',
    suggested_actions jsonb default '[]'::jsonb,
    created_at timestamptz default now() not null
);

-- Audit Logs (Compliance & User trust)
create table public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    action text not null,
    resource_type text not null,
    resource_id text,
    ip text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now() not null
);

-- Notifications
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    body text not null,
    action_id uuid references public.actions(id) on delete set null,
    is_read boolean default false,
    created_at timestamptz default now() not null
);

-- 4. INDEXES
create index idx_sources_user on public.sources(user_id);
create index idx_documents_user on public.documents(user_id);
create index idx_actions_user_status on public.actions(user_id, status);
create index idx_actions_deadline on public.actions(deadline) where deadline is not null;
create index idx_tasks_user_completed on public.tasks(user_id, is_completed);
create index idx_reminders_scheduled on public.reminders(scheduled_at, status);
create index idx_memories_user_cat on public.memories(user_id, category);
create index idx_messages_convo on public.messages(conversation_id);

-- Vector HNSW indexes
create index idx_chunks_embedding on public.document_chunks 
using hnsw (embedding vector_cosine_ops);

create index idx_memories_embedding on public.memories 
using hnsw (embedding vector_cosine_ops);

-- 5. PROCEDURES & FUNCTIONS

-- RAG Document Search
create or replace function match_document_chunks(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
returns table (
    id uuid,
    document_id uuid,
    content text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        c.id,
        c.document_id,
        c.content,
        1 - (c.embedding <=> query_embedding) as similarity
    from public.document_chunks c
    where c.user_id = p_user_id
      and 1 - (c.embedding <=> query_embedding) > match_threshold
    order by c.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- RAG Semantic Memory Search
create or replace function match_memories(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
returns table (
    id uuid,
    category memory_category,
    key text,
    value text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        m.id,
        m.category,
        m.key,
        m.value,
        1 - (m.embedding <=> query_embedding) as similarity
    from public.memories m
    where m.user_id = p_user_id
      and m.embedding is not null
      and 1 - (m.embedding <=> query_embedding) > match_threshold
    order by m.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- Auto-create profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.actions enable row level security;
alter table public.tasks enable row level security;
alter table public.reminders enable row level security;
alter table public.memories enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Profiles: user can view/update own profile
create policy "profiles_owner_access" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Sources: user can manage own sources
create policy "sources_owner_access" on public.sources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Documents: user can manage own documents
create policy "documents_owner_access" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Document Chunks: user can manage own chunks
create policy "chunks_owner_access" on public.document_chunks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Actions: user can manage own actions
create policy "actions_owner_access" on public.actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks: user can manage own tasks
create policy "tasks_owner_access" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reminders: user can manage own reminders
create policy "reminders_owner_access" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Memories: user can manage own memories
create policy "memories_owner_access" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Conversations & Messages
create policy "conversations_owner_access" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_owner_access" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Audit logs
create policy "audit_logs_owner_access" on public.audit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notifications
create policy "notifications_owner_access" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

