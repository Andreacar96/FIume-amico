# Acque Dolci — Specifica di progetto

App community per pescatori di acqua dolce in Italia. Spot, catture, temperature, blog, forum.

---

## 1. Stack consigliato (per Claude Code)

- **Frontend**: Next.js (React) + Tailwind CSS
- **Backend/DB/Auth/Storage**: Supabase (Postgres + Auth con Google OAuth + Storage per foto)
- **Mappa**: Google Maps JavaScript API (Places + Marker personalizzati)

Questo stack replica quello che usa Lovable, ma lo scrivi e controlli tu direttamente.

---

## 2. Schema database (Postgres / Supabase)

### `profiles`
Estende la tabella `auth.users` di Supabase.

| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK, = auth.users.id) | |
| username | text, unique | |
| avatar_url | text | nullable |
| bio | text | nullable |
| role | text | `'user'` \| `'admin'` — default `'user'` |
| created_at | timestamptz | default now() |

### `spots`
Spot di pesca segnalati dagli utenti (fiumi mappati o torrenti fuori mappa).

| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | chi ha segnalato lo spot |
| name | text | |
| description | text | nullable |
| latitude | float8 | |
| longitude | float8 | |
| water_body_name | text | nome fiume/torrente, anche non ufficiale |
| is_mapped_river | boolean | true se su fiume ufficiale Google Maps, false se torrente "fuori mappa" |
| access_notes | text | nullable — es. come raggiungerlo |
| created_at | timestamptz | default now() |

### `spot_photos`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| spot_id | uuid (FK → spots) | |
| photo_url | text | Supabase Storage |
| uploaded_by | uuid (FK → profiles) | |
| created_at | timestamptz | |

### `fish_species`
Tabella di riferimento delle razze/specie pescabili.

| Campo | Tipo | Note |
|---|---|---|
| id | serial (PK) | |
| name | text | es. "Trota fario", "Temolo", "Luccio" |
| scientific_name | text | nullable |

### `catches` (catture)
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| spot_id | uuid (FK → spots) | nullable, può non essere legata a uno spot registrato |
| species_id | int (FK → fish_species) | |
| weight_kg | float8 | nullable |
| length_cm | float8 | nullable |
| caught_at | date | data della cattura |
| notes | text | nullable |
| created_at | timestamptz | |

### `catch_photos`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| catch_id | uuid (FK → catches) | |
| photo_url | text | |

### `temperature_readings`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| spot_id | uuid (FK → spots) | nullable |
| water_body_name | text | se non legata a uno spot |
| temperature_celsius | float8 | |
| recorded_at | timestamptz | |
| latitude / longitude | float8 | opzionale, se rilevata sul posto |

### `blog_posts`
Solo admin possono creare/modificare.

| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| author_id | uuid (FK → profiles) | deve avere role='admin' — enforced via RLS |
| title | text | |
| slug | text, unique | |
| cover_image_url | text | nullable |
| content | text | markdown o rich text |
| published | boolean | default false |
| published_at | timestamptz | nullable |
| created_at | timestamptz | |

### `forum_threads`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| category | text | es. "Attrezzatura", "Tecniche", "Normative", "Spot e zone" |
| title | text | |
| created_at | timestamptz | |
| pinned | boolean | default false, solo admin può settarlo |

### `forum_posts`
| Campo | Tipo | Note |
|---|---|---|
| id | uuid (PK) | |
| thread_id | uuid (FK → forum_threads) | |
| user_id | uuid (FK → profiles) | |
| content | text | |
| created_at | timestamptz | |

### Row Level Security (RLS) — punti chiave
- `blog_posts`: INSERT/UPDATE/DELETE solo se `auth.uid()` corrisponde a un profilo con `role = 'admin'`
- `spots`, `catches`, `temperature_readings`, `forum_posts`: chiunque autenticato può creare le proprie righe; modifica/cancellazione solo del proprio contenuto (o admin)
- Lettura pubblica per tutto tranne dati di profilo sensibili

---

## 3. Struttura pagine

| Pagina | Percorso | Accesso |
|---|---|---|
| Home | `/` | pubblico |
| Login/Registrazione | `/auth` | pubblico |
| Mappa spot | `/mappa` | pubblico (lettura), autenticato per aggiungere spot |
| Dettaglio spot | `/mappa/[id]` | pubblico |
| Catture (feed community) | `/catture` | pubblico (lettura), autenticato per inserire |
| Temperature | `/temperature` | pubblico (grafici/andamento), autenticato per inserire |
| Blog | `/blog` | pubblico |
| Dettaglio articolo | `/blog/[slug]` | pubblico |
| Admin blog editor | `/admin/blog` | solo admin |
| Forum | `/forum` | pubblico (lettura), autenticato per scrivere |
| Thread forum | `/forum/[id]` | pubblico |
| Profilo utente | `/profilo/[username]` | pubblico |
| Le mie catture/spot | `/dashboard` | autenticato |

---

## 4. Palette colori — tema fluviale

| Ruolo | Colore | Hex |
|---|---|---|
| Primario (acqua profonda) | Blu fiume scuro | `#1B4B5A` |
| Primario chiaro (acqua corrente) | Azzurro acqua | `#4A90A4` |
| Accento (natura/sponde) | Verde muschio | `#5C7C4F` |
| Accento secondario | Verde salvia chiaro | `#A8C4A2` |
| Sfondo neutro | Grigio pietra fiume | `#F4F1EA` |
| Testo principale | Blu ardesia scuro | `#22333B` |
| Alert/CTA | Ambra pesce/trota | `#D98E4C` |
| Bordi/divisori | Grigio acqua chiaro | `#D9E2E1` |

Ispirazione: ciottoli di fiume, muschio sulle sponde, riflessi dell'acqua corrente, con un accento caldo (ambra) per bottoni e call-to-action così da non risultare "piatto" e solo freddo/acqua.

---

## 5. Note per l'implementazione con Claude Code

1. Inizializza progetto Next.js + Tailwind, collega Supabase (auth con provider Google abilitato).
2. Crea le tabelle sopra via SQL migration su Supabase, imposta RLS.
3. Componente Mappa: Google Maps JS API, marker cluster per zone dense di spot, differenzia visivamente spot su fiumi ufficiali vs torrenti "fuori mappa".
4. Upload foto: Supabase Storage, bucket separati `spot-photos` e `catch-photos`.
5. Dashboard admin per il blog protetta da controllo `role === 'admin'` sia lato client che via RLS lato server (doppio livello, mai fidarsi solo del client).
