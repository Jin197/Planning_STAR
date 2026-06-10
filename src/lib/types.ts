// Types de domaine Planning STAR (miroir du schema SQL Supabase).

export type AccountType = "responsable" | "membre";
export type CommunityType =
  | "mla"
  | "accueil"
  | "sonorisation"
  | "integration"
  | "autre";
export type MemberRole = "admin" | "membre";
export type MemberStatus = "pending" | "approved" | "rejected";
export type AvailabilityStatus = "disponible" | "indisponible";
export type NotificationType =
  | "membership_request"
  | "membership_approved"
  | "membership_rejected"
  | "event_assigned"
  | "new_message"
  | "availability_request";

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  ministere: string | null;
  description: string | null;
  account_type: AccountType;
  avatar_url: string | null;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  description: string | null;
  responsable_name: string | null;
  created_by: string;
  created_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  profile_id: string;
  role: MemberRole;
  status: MemberStatus;
  requested_at: string;
  joined_at: string | null;
}

export interface EventRow {
  id: string;
  community_id: string;
  name: string;
  starts_at: string | null;
  location: string | null;
  description: string | null;
  dress_code: string | null;
  rehearsal_location: string | null;
  rehearsal_time: string | null;
  created_by: string;
  created_at: string;
}

export interface EventSlot {
  id: string;
  event_id: string;
  label: string;
  position: number;
}

export interface SlotAssignment {
  id: string;
  slot_id: string;
  profile_id: string;
  assigned_by: string;
  created_at: string;
}

export interface Availability {
  id: string;
  event_id: string;
  profile_id: string;
  status: AvailabilityStatus;
  motif: string | null;
  updated_at: string;
}

export interface Message {
  id: string;
  event_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// Libelles d'affichage pour les types de communaute.
export const COMMUNITY_TYPE_LABELS: Record<CommunityType, string> = {
  mla: "MLA",
  accueil: "Accueil",
  sonorisation: "Sonorisation",
  integration: "Integration",
  autre: "Autre",
};

// Modele de planning seede a la creation d'une communaute (cote SQL aussi).
export const MLA_TEMPLATE: string[] = [
  "LEAD",
  "Tenor",
  "Alto",
  "Soprano",
  "Pupitre double",
  "Piano",
  "Batterie",
  "Basse",
  "Guitare",
  "Charge des paroles",
  "Mass Choir",
  "Danse / Bannieres",
  "Referent Planning",
  "Referent Dress-code",
];

export const STAR_TEMPLATE: string[] = ["Star 1", "Star 2", "Star 3"];
