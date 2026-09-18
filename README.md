# Acque Dolci

Community app per pescatori di acqua dolce in Italia: spot, catture, temperature dell'acqua, blog e forum.

Stack: **Next.js (App Router) + Tailwind CSS** per il frontend, **Supabase** (Postgres, Auth, Storage) per il backend, **Google Maps JavaScript API** per la mappa degli spot.

La specifica di prodotto completa (schema DB, pagine, palette colori) è in [`docs/acque-dolci-spec.md`](docs/acque-dolci-spec.md).

## Setup

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Crea un progetto Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. In **Project Settings > API** copia `Project URL` e `anon public` key.
3. In **Authentication > Providers**, abilita **Google** (serve un OAuth Client ID/Secret da Google Cloud Console; imposta il redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`).
4. In **Authentication > URL Configuration**, aggiungi `http://localhost:3000/auth/callback` (e l'URL di produzione) tra i redirect URL consentiti.

### 3. Applica lo schema del database

Le migration in `supabase/migrations/` creano tutte le tabelle, le policy RLS, i bucket di storage e i dati di riferimento (specie ittiche). Vanno applicate **in ordine** (per data nel nome del file).

Con la [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-ref>
supabase db push
```

In alternativa, incolla il contenuto di ciascun file nel **SQL Editor** del progetto Supabase ed eseguilo, iniziando da `20260917000000_init.sql` e poi `20260918000000_fix_role_guard.sql`.

### 4. Configura le variabili d'ambiente

```bash
cp .env.example .env.local
```

Compila `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` con i valori del progetto Supabase.

Per la mappa reale, imposta anche `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` con una chiave che abbia la **Maps JavaScript API** abilitata. Senza questa chiave, `/mappa` mostra automaticamente una mappa illustrativa di riserva (stessa logica: colore diverso per spot su corso mappato vs. torrente fuori mappa).

### 5. Avvia in sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Come diventare amministratore

Le funzioni admin (pubblicare sul blog, fissare discussioni del forum) richiedono `profiles.role = 'admin'`. Non esiste un flusso self-service per diventare admin: dopo la prima registrazione, promuovi manualmente un utente dal **SQL Editor** di Supabase:

```sql
update public.profiles set role = 'admin' where username = 'il-tuo-username';
```

## Struttura del progetto

- `src/app/*` — pagine e route handler (App Router).
- `src/components/*` — componenti UI condivisi (nav, modali, form).
- `src/lib/supabase/*` — client Supabase per browser, Server Components e proxy (refresh sessione).
- `src/lib/types/database.ts` — tipi TypeScript per le tabelle Supabase.
- `supabase/migrations/*` — schema SQL, RLS, bucket di storage.
- `docs/acque-dolci-spec.md` — specifica di prodotto originale.

## Script disponibili

```bash
npm run dev      # sviluppo
npm run build    # build di produzione
npm run start    # avvia la build di produzione
npm run lint     # eslint
```
