# Planning STAR — Architecture Produit & Technique

> Application de planning pour les ministères musicaux et opérationnels de l'église.
> Direction artistique : **« gestion d'actifs premium »** — contrôle absolu, sophistication technique, pixel-perfect.

---

## 1. Vision & Principes

| Principe | Traduction concrète |
|---|---|
| **Contrôle absolu** | Chaque slot de planning a un état clair (vide / partiel / complet). Aucune ambiguïté visuelle. |
| **Sophistication technique** | Chiffres tabulaires, grille 8pt, micro-interactions, transitions de 200–300ms. |
| **Hiérarchie sans friction** | Le rôle (admin/membre) détermine l'UI affichée, pas une succession de pop-ups d'erreur. |
| **Temps réel** | Disponibilités, affectations et messagerie se mettent à jour en live. |

---

## 2. Modèle de domaine (concepts)

```
Profile (utilisateur)
  └─ account_type : "responsable" | "membre"   ← question posée à l'inscription

Community (communauté / ministère)
  ├─ type : MLA | Accueil | Sonorisation | Intégration | Autre
  └─ membres (CommunityMember)
        └─ role : "admin" | "membre"            ← rôle DANS la communauté
        └─ status : "pending" | "approved" | "rejected"

SlotTemplate (modèle de ligne de planning, par communauté)

Event (événement)
  ├─ champs méta (nom, heure, lieu, description, dress-code, répétition…)
  ├─ EventSlot (LEAD, Ténor, Star 1…)  → SlotAssignment (multi-personnes)
  ├─ Availability (dispo/indispo + motif, par membre)
  └─ Message (messagerie de l'événement)

Notification (in-app + email)
```

### Deux niveaux de rôle — distinction essentielle

1. **Type de compte** (global, choisi à l'inscription) :
   - `responsable` → peut **créer** des communautés.
   - `membre` → ne peut que **rejoindre** des communautés.
2. **Rôle dans la communauté** (local) :
   - `admin` → contrôle total (créer/éditer events, affecter, valider adhésions, promouvoir).
   - `membre` → consulte, déclare ses disponibilités, participe à la messagerie.

> On devient `admin` d'une communauté en la **créant**. Un admin peut promouvoir n'importe quel membre en admin.

---

## 3. Schéma de données (PostgreSQL / Supabase)

```sql
-- Utilisateurs (étend auth.users)
profiles (
  id            uuid PK = auth.users.id,
  nom           text,
  prenom        text,
  ministere     text,
  description   text,
  account_type  text  -- 'responsable' | 'membre'
  avatar_url    text,
  created_at    timestamptz
)

-- Communautés
communities (
  id            uuid PK,
  name          text,
  type          text,        -- 'mla' | 'accueil' | 'sonorisation' | 'integration' | 'autre'
  description   text,
  responsable_name text,      -- saisi au formulaire
  created_by    uuid FK profiles,
  created_at    timestamptz
)

-- Adhésions = (rôle + statut) ; gère aussi les demandes d'ajout
community_members (
  id            uuid PK,
  community_id  uuid FK,
  profile_id    uuid FK,
  role          text,        -- 'admin' | 'membre'
  status        text,        -- 'pending' | 'approved' | 'rejected'
  requested_at  timestamptz,
  joined_at     timestamptz,
  UNIQUE(community_id, profile_id)
)

-- Modèle de planning par communauté (seedé à la création, éditable/renommable)
slot_templates (
  id            uuid PK,
  community_id  uuid FK,
  label         text,        -- 'LEAD', 'Ténor', 'Star 1'…
  position      int
)

-- Événements
events (
  id                 uuid PK,
  community_id       uuid FK,
  name               text,
  starts_at          timestamptz,   -- heure de l'événement
  location           text,          -- lieu
  description        text,
  dress_code         text,
  rehearsal_location text,          -- lieu de répétition (MLA)
  rehearsal_time     timestamptz,   -- heure de répétition (MLA)
  created_by         uuid FK,
  created_at         timestamptz
)

-- Lignes de planning de l'événement (copiées depuis slot_templates à la création)
event_slots (
  id            uuid PK,
  event_id      uuid FK,
  label         text,
  position      int
)

-- Affectations (PLUSIEURS personnes par slot)
slot_assignments (
  id            uuid PK,
  slot_id       uuid FK event_slots,
  profile_id    uuid FK,
  assigned_by   uuid FK,
  created_at    timestamptz,
  UNIQUE(slot_id, profile_id)
)

-- Disponibilités par événement
availabilities (
  id            uuid PK,
  event_id      uuid FK,
  profile_id    uuid FK,
  status        text,        -- 'disponible' | 'indisponible'
  motif         text NULL,   -- facultatif
  updated_at    timestamptz,
  UNIQUE(event_id, profile_id)
)

-- Messagerie par événement
messages (
  id            uuid PK,
  event_id      uuid FK,
  sender_id     uuid FK,
  body          text,
  created_at    timestamptz
)

-- Notifications (in-app + déclencheur email)
notifications (
  id            uuid PK,
  recipient_id  uuid FK,
  type          text,  -- 'membership_request' | 'membership_approved' | 'event_assigned' | 'new_message' | 'availability_request'
  payload       jsonb,
  read_at       timestamptz NULL,
  created_at    timestamptz
)
```

### Templates par type de communauté (seed automatique)

**MLA** (modifiable, renommable) — slots d'affectation :
```
LEAD · Ténor · Alto · Soprano · Pupitre double · Piano · Batterie · Basse ·
Guitare · Chargé des paroles · Mass Choir · Danse / Bannières ·
Référent Planning · Référent Dress-code
```
+ champs méta de l'event : Nom · Heure · Lieu · Description · Dress-code · Lieu de répétition · Heure de répétition.

**Accueil / Sonorisation / Intégration / Autre** :
```
Star 1 · Star 2 · Star 3 … (ajout illimité, renommable)
```

> À la **création d'un event**, on copie `slot_templates` → `event_slots`. Modifier le template n'affecte pas les events passés (immutabilité de l'historique).

---

## 4. Sécurité & permissions (Row-Level Security)

Les règles métier sont **appliquées côté base** (RLS Supabase), pas seulement dans l'UI :

| Action | Autorisé pour |
|---|---|
| Créer une communauté | `profile.account_type = 'responsable'` |
| Créer / éditer / supprimer un event | `community_member.role = 'admin'` ET `status='approved'` |
| Affecter une personne à un slot | admin de la communauté |
| Valider / refuser une adhésion | admin de la communauté |
| Promouvoir un membre en admin | admin de la communauté |
| Déclarer sa disponibilité (+ motif) | membre approuvé de la communauté |
| Lire les events d'une communauté | membre approuvé |
| Envoyer un message dans un event | membre approuvé de la communauté de l'event |

---

## 5. Parcours utilisateur (flows)

### A. Inscription
```
Formulaire : nom · prénom · ministère · description
        ▼
Question : « Es-tu responsable de ministère ou un membre ? »
        ├─ Responsable → account_type='responsable'
        └─ Membre      → account_type='membre'
        ▼
Annuaire des communautés
```

### B. Annuaire des communautés
- **Tous** voient la liste des communautés + bouton **« Demande d'ajout »**.
- **Responsable** voit en plus le bouton **« Créer une communauté »**.

### C. Création de communauté (responsable)
```
Formulaire : nom · type (liste : Sonorisation, Accueil, Intégration, MLA, Autre)
           · description · nom du responsable
        ▼
Création → le créateur devient admin (role='admin', status='approved')
        ▼
Seed automatique des slot_templates selon le type
```

### D. Demande d'ajout → validation
```
Membre clique « Demande d'ajout »  → community_members(status='pending')
        ▼
Notification à l'admin (in-app + email)
        ▼
Admin : Valider / Refuser
        ▼  (si validé)
Le membre joue son rôle : voit events, déclare dispo, messagerie
```

### E. Création & affectation d'un event (admin)
```
Admin crée l'event (champs méta préremplis selon template)
        ▼
event_slots générés depuis le template
        ▼
Devant chaque slot : liste déroulante des personnes DISPONIBLES
        → affectation multi-personnes (slot_assignments)
```

### F. Disponibilité (membre)
```
Membre ouvre un event à venir
        ▼
Toggle : Disponible / Indisponible  (+ motif facultatif)
        ▼
La liste déroulante d'affectation de l'admin se filtre sur les "Disponible"
```

### G. Messagerie d'event
```
Chaque event = un fil de discussion
        ▼
Message envoyé → realtime in-app + notification email aux participants
```

---

## 6. Architecture applicative

### Stack recommandée

| Couche | Choix | Pourquoi |
|---|---|---|
| **Front** | Next.js 15 (App Router) + TypeScript | SSR/edge, PWA installable, performances |
| **UI** | Tailwind CSS + shadcn/ui (fortement customisé) + Framer Motion | Design system contrôlé, pixel-perfect |
| **Données client** | TanStack Query + Supabase Realtime | Cache, optimistic updates, live |
| **État UI** | Zustand | Léger, prévisible |
| **Backend** | **Supabase** (Postgres + Auth + Realtime + Storage + Edge Functions) | RLS = permissions natives, realtime pour chat/dispo, auth clé en main |
| **Emails** | Resend (via Edge Function `on-notification`) | Notifications email transactionnelles |
| **Notifications push** | Web Push (PWA) | Alertes hors-app |
| **Hébergement** | Vercel (front) + Supabase (data) | Déploiement simple |

> **Décision plateforme à confirmer** : je recommande un **PWA installable** (un seul codebase, web + « app » sur mobile). Si une vraie app store (iOS/Android native) est exigée, on bascule sur **Expo / React Native** en réutilisant la même couche Supabase — l'architecture data ci-dessus ne change pas.

### Arborescence front (proposition)
```
src/
├─ app/
│  ├─ (auth)/             # inscription, connexion, choix du rôle
│  ├─ (app)/
│  │  ├─ communities/     # annuaire + création
│  │  ├─ c/[id]/          # page commune d'une communauté (events)
│  │  ├─ c/[id]/admin/    # gestion membres, demandes d'adhésion
│  │  ├─ events/[id]/     # planning + dispo + messagerie
│  │  ├─ notifications/
│  │  └─ profile/
├─ components/
│  ├─ ui/                 # design system (Button, Card, Pill, Select…)
│  ├─ planning/           # SlotRow, AssignDropdown, AvailabilityToggle
│  └─ chat/               # MessageThread, Composer
├─ lib/
│  ├─ supabase/           # client, queries, RLS-aware helpers
│  ├─ permissions.ts      # guards UI (miroir des RLS)
│  └─ templates.ts        # définition des slots MLA / Star
└─ stores/                # Zustand
```

---

## 7. Design System « premium »

```
COULEURS
  Canvas        #0A0B0D   (near-black)
  Surface       #141518   (cartes élevées)
  Surface-2     #1C1E22
  Bordure       rgba(255,255,255,0.08)
  Texte         #F4F5F7 / muted #8A8F98
  Accent        #C8A86B   (champagne/or — luxe, gestion d'actifs)
  Succès (dispo)    #3DBE8B (désaturé, premium)
  Alerte (indispo)  #D06B6B (désaturé)

TYPOGRAPHIE
  UI        Geist / Inter Tight
  Chiffres  tabular-nums (heures, dates, compteurs de slots)

SYSTÈME
  Grille 8pt · rayons 12–16px · bordures 1px ·
  ombres douces · transitions 200–300ms ease-out ·
  états de slot : Vide ▢  ·  Partiel ◐  ·  Complet ●
```

États visuels d'un slot de planning :
```
┌─────────────────────────────────────────────┐
│  LEAD                    ● 2 affectés         │   ← complet
│  ▸ Marie K.   ▸ David T.        [+ ajouter ▾] │
├─────────────────────────────────────────────┤
│  Ténor                   ◐ 1 / suggérés       │
│  ▸ Joël A.                      [+ ajouter ▾] │
├─────────────────────────────────────────────┤
│  Soprano                 ▢ non pourvu         │
│                                 [+ ajouter ▾] │
└─────────────────────────────────────────────┘
```

---

## 8. Temps réel & notifications

| Événement déclencheur | Canal in-app | Email |
|---|---|---|
| Demande d'adhésion | Admin de la communauté | ✅ |
| Adhésion validée | Membre | ✅ |
| Affectation à un event | Personne affectée | ✅ |
| Nouveau message dans l'event | Participants de l'event | ✅ |
| Demande de disponibilité (nouvel event) | Membres de la communauté | ✅ |

Implémentation : trigger Postgres `AFTER INSERT` → insère dans `notifications` → Edge Function `on-notification` → push Web + email Resend. Realtime Supabase pousse `notifications` et `messages` au client.

---

## 9. Roadmap de build (incréments livrables)

1. **Socle** : Auth + profils + question de rôle + design system de base.
2. **Communautés** : annuaire, création (responsable), seed des templates, demandes d'adhésion + validation.
3. **Events & planning** : création d'event, génération des slots, affectation multi-personnes.
4. **Disponibilités** : toggle dispo/indispo + motif, filtrage des listes déroulantes.
5. **Messagerie** : fil par event en temps réel.
6. **Notifications** : in-app + email (Resend) + Web Push.
7. **Polish** : micro-interactions, états vides, responsive, PWA installable.
