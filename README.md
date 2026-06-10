# Planning STAR

Application premium de planning des ministeres de l'eglise (MLA, Accueil, Sonorisation, Integration).
Next.js 15 · TypeScript · Tailwind CSS · Supabase.

> Architecture detaillee : voir [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Prerequis

- **Node.js 18+** (Node 24 LTS installe sur ce poste via winget).
- Un projet **Supabase** gratuit (https://app.supabase.com).
- Acces au **registre npm interne** de l'entreprise (le registre public est bloque, voir ci-dessous).

---

## 2. ⚠️ Registre npm (specifique a ce poste d'entreprise)

Le proxy de securite (agent local `127.0.0.1:9000`) **bloque `registry.npmjs.org`** → toute commande
`npm install` echoue avec `403 Forbidden`. Il faut pointer npm vers le **registre interne**.

### a. Renseigner le registre interne

Ouvre [.npmrc](./.npmrc) et remplace la ligne `registry=...` par l'URL de ton Artifactory/Nexus interne.
Tu la trouves :

- sur le **portail IT / Confluence** interne (cherche « Artifactory » ou « npm registry ») ;
- dans le `.npmrc` d'un **collegue developpeur** (`cat ~/.npmrc`) ;
- via le bouton **« Set Me Up »** d'un depot npm dans l'interface Artifactory.

### b. Certificat & proxy (deja prepares)

- `corp-ca.pem` : bundle des autorites de certification du poste (interception TLS). Deja reference dans `.npmrc` via `cafile`.
- Si l'install echoue avec une erreur reseau, decommente les lignes `proxy` / `https-proxy` dans `.npmrc`.

### c. Installer

```powershell
# Ajouter Node au PATH de la session si besoin :
$env:Path = "C:\Users\M447765\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.16.0-win-x64;" + $env:Path

npm install
```

---

## 3. Configurer Supabase

1. Cree un projet sur https://app.supabase.com.
2. **SQL Editor → New query** → colle tout [supabase/schema.sql](./supabase/schema.sql) → **Run**.
   Cela cree les tables, la securite RLS, le seed automatique des plannings et les triggers de notifications.
3. Copie `.env.local.example` en **`.env.local`** et renseigne :
   - `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API).

> **Mode demo** : sans `.env.local`, l'app tourne quand meme avec des donnees fictives
> (utile pour valider le design avant de brancher le backend).

---

## 4. Lancer

```powershell
npm run dev
```

Ouvre http://localhost:3000.

Parcours disponible (Increment 1) :
`/` (landing) → `/signup` → `/onboarding` (question Responsable/Membre) → `/communities`
→ `/communities/new` (responsable) → `/communities/[id]` (apercu planning).

---

## 5. Structure du projet

```
planning-star/
├─ ARCHITECTURE.md          # specification produit & technique complete
├─ supabase/schema.sql      # schema + RLS + triggers (a executer dans Supabase)
├─ .npmrc                   # registre interne + CA + proxy
├─ corp-ca.pem              # bundle CA du poste (TLS entreprise)
└─ src/
   ├─ app/
   │  ├─ layout.tsx · globals.css · page.tsx   # racine + landing
   │  ├─ (auth)/  login · signup · onboarding
   │  └─ (app)/   communities · communities/new · communities/[id]
   ├─ components/
   │  ├─ ui/      button · card · badge · field   # design system
   │  ├─ brand/   logo
   │  └─ auth/    auth-shell
   └─ lib/
      ├─ types.ts          # types de domaine + modeles de planning
      ├─ utils.ts          # cn(), formatage dates
      └─ supabase/         # client (navigateur) + server (SSR)
```

---

## 6. Design system

Palette « gestion d'actifs premium » definie dans [tailwind.config.ts](./tailwind.config.ts) :

| Token | Valeur | Usage |
|---|---|---|
| `canvas` | `#0A0B0D` | fond |
| `surface` | `#141518` | cartes |
| `accent` | `#C8A86B` | champagne / or |
| `ok` / `warn` / `danger` | vert / ambre / rouge dessatures | statuts |

Chiffres tabulaires (`tnum`), grille 8pt, transitions 200ms, etats de slot `▢ ◐ ●`.

---

## 7. Roadmap (increments)

- [x] **Inc. 1** — Design system + auth + onboarding (role) + annuaire des communautes.
- [ ] **Inc. 2** — Adhesions : demande → notification admin → validation/refus → promotion admin.
- [ ] **Inc. 3** — Events & planning : creation, slots generes, affectation multi-personnes.
- [ ] **Inc. 4** — Disponibilites : dispo/indispo + motif, filtrage des listes d'affectation.
- [ ] **Inc. 5** — Messagerie temps reel par evenement.
- [ ] **Inc. 6** — Notifications in-app + email (Resend) + Web Push, PWA installable.

Le schema SQL couvre **deja la totalite** de ces increments — il ne reste qu'a brancher l'UI.
```
