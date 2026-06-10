-- ============================================================================
--  PLANNING STAR — Schema PostgreSQL / Supabase
--  A executer dans : Supabase Dashboard -> SQL Editor -> New query
--  Inclut : tables, RLS (permissions), triggers de seed et de notifications.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  ENUMS
-- ---------------------------------------------------------------------------
create type account_type     as enum ('responsable', 'membre');
create type community_type    as enum ('mla', 'accueil', 'sonorisation', 'integration', 'autre');
create type member_role       as enum ('admin', 'membre');
create type member_status     as enum ('pending', 'approved', 'rejected');
create type availability_kind as enum ('disponible', 'indisponible');

-- ---------------------------------------------------------------------------
--  PROFILES  (etend auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nom          text not null default '',
  prenom       text not null default '',
  ministere    text,
  description  text,
  account_type account_type not null default 'membre',
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Cree automatiquement un profil a l'inscription (auth.users -> profiles).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nom, prenom, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce((new.raw_user_meta_data->>'account_type')::account_type, 'membre')
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
--  COMMUNITIES
-- ---------------------------------------------------------------------------
create table communities (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  type             community_type not null,
  description      text,
  responsable_name text,
  created_by       uuid not null references profiles(id) on delete cascade,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  COMMUNITY_MEMBERS  (role + statut + demandes d'adhesion)
-- ---------------------------------------------------------------------------
create table community_members (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  profile_id   uuid not null references profiles(id) on delete cascade,
  role         member_role   not null default 'membre',
  status       member_status not null default 'pending',
  requested_at timestamptz not null default now(),
  joined_at    timestamptz,
  unique (community_id, profile_id)
);
create index on community_members (community_id);
create index on community_members (profile_id);

-- ---------------------------------------------------------------------------
--  SLOT_TEMPLATES  (modele de planning par communaute)
-- ---------------------------------------------------------------------------
create table slot_templates (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  label        text not null,
  position     int  not null default 0
);
create index on slot_templates (community_id);

-- ---------------------------------------------------------------------------
--  EVENTS
-- ---------------------------------------------------------------------------
create table events (
  id                 uuid primary key default gen_random_uuid(),
  community_id       uuid not null references communities(id) on delete cascade,
  name               text not null,
  starts_at          timestamptz,
  location           text,
  description        text,
  dress_code         text,
  rehearsal_location text,
  rehearsal_time     timestamptz,
  created_by         uuid not null references profiles(id) on delete cascade,
  created_at         timestamptz not null default now()
);
create index on events (community_id);

-- ---------------------------------------------------------------------------
--  EVENT_SLOTS  (lignes de planning, copiees depuis slot_templates)
-- ---------------------------------------------------------------------------
create table event_slots (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id) on delete cascade,
  label     text not null,
  position  int  not null default 0
);
create index on event_slots (event_id);

-- ---------------------------------------------------------------------------
--  SLOT_ASSIGNMENTS  (multi-personnes par slot)
-- ---------------------------------------------------------------------------
create table slot_assignments (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references event_slots(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade,
  assigned_by uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (slot_id, profile_id)
);
create index on slot_assignments (slot_id);

-- ---------------------------------------------------------------------------
--  AVAILABILITIES  (dispo / indispo + motif par event)
-- ---------------------------------------------------------------------------
create table availabilities (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status     availability_kind not null,
  motif      text,
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index on availabilities (event_id);

-- ---------------------------------------------------------------------------
--  MESSAGES  (messagerie par event)
-- ---------------------------------------------------------------------------
create table messages (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index on messages (event_id, created_at);

-- ---------------------------------------------------------------------------
--  NOTIFICATIONS  (in-app + declencheur email)
-- ---------------------------------------------------------------------------
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  type         text not null,
  payload      jsonb not null default '{}',
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index on notifications (recipient_id, created_at desc);

-- ============================================================================
--  SEED AUTOMATIQUE DU MODELE DE PLANNING A LA CREATION D'UNE COMMUNAUTE
--  + le createur devient admin approuve de sa communaute.
-- ============================================================================
create or replace function seed_community()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  labels text[];
  lbl    text;
  i      int := 0;
begin
  -- Le createur devient admin (status approved).
  insert into community_members (community_id, profile_id, role, status, joined_at)
  values (new.id, new.created_by, 'admin', 'approved', now());

  -- Choix du modele selon le type.
  if new.type = 'mla' then
    labels := array[
      'LEAD','Tenor','Alto','Soprano','Pupitre double','Piano','Batterie',
      'Basse','Guitare','Charge des paroles','Mass Choir','Danse / Bannieres',
      'Referent Planning','Referent Dress-code'
    ];
  else
    labels := array['Star 1','Star 2','Star 3'];
  end if;

  foreach lbl in array labels loop
    insert into slot_templates (community_id, label, position)
    values (new.id, lbl, i);
    i := i + 1;
  end loop;

  return new;
end; $$;

create trigger on_community_created
  after insert on communities
  for each row execute function seed_community();

-- ============================================================================
--  A LA CREATION D'UN EVENT : copier slot_templates -> event_slots
-- ============================================================================
create or replace function seed_event_slots()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into event_slots (event_id, label, position)
  select new.id, t.label, t.position
  from slot_templates t
  where t.community_id = new.community_id
  order by t.position;
  return new;
end; $$;

create trigger on_event_created
  after insert on events
  for each row execute function seed_event_slots();

-- ============================================================================
--  HELPERS DE PERMISSION  (utilises par les policies RLS)
-- ============================================================================
-- Membre approuve d'une communaute ?
create or replace function is_member(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from community_members
    where community_id = cid and profile_id = auth.uid() and status = 'approved'
  );
$$;

-- Admin d'une communaute ?
create or replace function is_admin(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from community_members
    where community_id = cid and profile_id = auth.uid()
      and role = 'admin' and status = 'approved'
  );
$$;

-- Communaute d'un event.
create or replace function event_community(eid uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select community_id from events where id = eid;
$$;

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table profiles          enable row level security;
alter table communities       enable row level security;
alter table community_members enable row level security;
alter table slot_templates    enable row level security;
alter table events            enable row level security;
alter table event_slots       enable row level security;
alter table slot_assignments  enable row level security;
alter table availabilities    enable row level security;
alter table messages          enable row level security;
alter table notifications     enable row level security;

-- PROFILES : chacun lit tous les profils (annuaire), edite le sien.
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- COMMUNITIES : lecture publique (annuaire) ; creation reservee aux 'responsable'.
create policy "communities_read" on communities for select using (true);
create policy "communities_insert" on communities for insert
  with check (
    created_by = auth.uid()
    and (select account_type from profiles where id = auth.uid()) = 'responsable'
  );
create policy "communities_update" on communities for update using (is_admin(id));
create policy "communities_delete" on communities for delete using (is_admin(id));

-- COMMUNITY_MEMBERS :
--   lecture : membres de la communaute (+ ses admins) ;
--   insert  : un user cree SA propre demande (status force a 'pending' cote app) ;
--   update/delete : admins (valider/refuser/promouvoir/retirer).
create policy "members_read" on community_members for select
  using (profile_id = auth.uid() or is_member(community_id) or is_admin(community_id));
create policy "members_request" on community_members for insert
  with check (profile_id = auth.uid());
create policy "members_admin_update" on community_members for update
  using (is_admin(community_id));
create policy "members_admin_delete" on community_members for delete
  using (is_admin(community_id) or profile_id = auth.uid());

-- SLOT_TEMPLATES : lecture membres ; ecriture admins.
create policy "templates_read"  on slot_templates for select using (is_member(community_id));
create policy "templates_write" on slot_templates for all
  using (is_admin(community_id)) with check (is_admin(community_id));

-- EVENTS : lecture membres ; ecriture admins.
create policy "events_read"  on events for select using (is_member(community_id));
create policy "events_write" on events for all
  using (is_admin(community_id))
  with check (is_admin(community_id) and created_by = auth.uid());

-- EVENT_SLOTS : lecture membres ; ecriture admins.
create policy "slots_read"  on event_slots for select using (is_member(event_community(event_id)));
create policy "slots_write" on event_slots for all
  using (is_admin(event_community(event_id)))
  with check (is_admin(event_community(event_id)));

-- SLOT_ASSIGNMENTS : lecture membres ; affectation reservee aux admins.
create policy "assign_read" on slot_assignments for select
  using (is_member(event_community((select event_id from event_slots where id = slot_id))));
create policy "assign_write" on slot_assignments for all
  using (is_admin(event_community((select event_id from event_slots where id = slot_id))))
  with check (
    assigned_by = auth.uid()
    and is_admin(event_community((select event_id from event_slots where id = slot_id)))
  );

-- AVAILABILITIES : lecture membres ; chacun gere SA propre dispo.
create policy "avail_read" on availabilities for select using (is_member(event_community(event_id)));
create policy "avail_self" on availabilities for all
  using (profile_id = auth.uid() and is_member(event_community(event_id)))
  with check (profile_id = auth.uid() and is_member(event_community(event_id)));

-- MESSAGES : lecture/ecriture pour les membres de la communaute de l'event.
create policy "messages_read" on messages for select using (is_member(event_community(event_id)));
create policy "messages_send" on messages for insert
  with check (sender_id = auth.uid() and is_member(event_community(event_id)));

-- NOTIFICATIONS : chacun ne voit/maj que les siennes.
create policy "notif_read"   on notifications for select using (recipient_id = auth.uid());
create policy "notif_update" on notifications for update using (recipient_id = auth.uid());

-- ============================================================================
--  REALTIME : exposer messages, notifications, dispos et affectations.
-- ============================================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table availabilities;
alter publication supabase_realtime add table slot_assignments;

-- ============================================================================
--  NOTIFICATIONS : triggers metier
--   (le push email est gere par une Edge Function abonnee a 'notifications')
-- ============================================================================

-- Nouvelle demande d'adhesion -> notifier les admins de la communaute.
create or replace function notify_membership_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' then
    insert into notifications (recipient_id, type, payload)
    select cm.profile_id, 'membership_request',
           jsonb_build_object('community_id', new.community_id, 'requester_id', new.profile_id)
    from community_members cm
    where cm.community_id = new.community_id and cm.role = 'admin' and cm.status = 'approved';
  end if;
  return new;
end; $$;
create trigger on_membership_request
  after insert on community_members
  for each row execute function notify_membership_request();

-- Adhesion validee/refusee -> notifier le demandeur.
create or replace function notify_membership_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> old.status and new.status in ('approved','rejected') then
    insert into notifications (recipient_id, type, payload)
    values (new.profile_id,
            case when new.status = 'approved' then 'membership_approved' else 'membership_rejected' end,
            jsonb_build_object('community_id', new.community_id));
  end if;
  return new;
end; $$;
create trigger on_membership_decision
  after update on community_members
  for each row execute function notify_membership_decision();

-- Affectation -> notifier la personne affectee.
create or replace function notify_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
declare eid uuid;
begin
  select event_id into eid from event_slots where id = new.slot_id;
  insert into notifications (recipient_id, type, payload)
  values (new.profile_id, 'event_assigned',
          jsonb_build_object('event_id', eid, 'slot_id', new.slot_id));
  return new;
end; $$;
create trigger on_assignment
  after insert on slot_assignments
  for each row execute function notify_assignment();

-- Nouveau message -> notifier les autres membres de la communaute de l'event.
create or replace function notify_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select community_id into cid from events where id = new.event_id;
  insert into notifications (recipient_id, type, payload)
  select cm.profile_id, 'new_message',
         jsonb_build_object('event_id', new.event_id, 'sender_id', new.sender_id)
  from community_members cm
  where cm.community_id = cid and cm.status = 'approved' and cm.profile_id <> new.sender_id;
  return new;
end; $$;
create trigger on_message
  after insert on messages
  for each row execute function notify_message();
