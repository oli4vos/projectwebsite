# Database Side-by-Side Plan

Deze repository blijft local-first werken en moet zonder account bruikbaar blijven.
De databasevariant is aanvullend en draait later naast de huidige browser-only flow.

## Modi

- `local`
  - Huidige default.
  - Profiel leeft in `localStorage`.
  - Werkt volledig met static export (GitHub Pages).
- `hybrid`
  - Local blijft leidend.
  - Remote sync kan later optioneel meedoen.
  - Als remote niet beschikbaar is, blijft local werken.
- `remote`
  - Database/account wordt later primair.
  - In huidige fase nog niet actief: fallback naar local.

## Veiligheidskaders

- Alleen browser-safe variabelen voor clientconfig:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Geen service role keys in clientcode.
- Geen secrets in deze repository.

## Huidige status

- Voorbereid, nog niet actief als verplichte runtime.
- Geen database vereist voor build of gebruik.
- Geen auth-flow verplicht in UI.
- Hybrid sync-orchestrator is voorbereid in code, maar wordt nog niet automatisch door UI/hooks aangeroepen.
- Er is een handmatige sync-entry voorbereid op `/profiel`, maar alleen als feature flag + mode/config dat toestaan.

## Hybrid sync contract (voorbereid)

- Orchestrator: `syncProfileOnce()` in `src/lib/storage/profile-sync-orchestrator.ts`.
- Default conflict policy: `preferNewest`.
- Policy-opties:
  - `preferNewest`
  - `preferLocal`
  - `preferRemote`
- Bij ontbrekende/ongeldige timestamps kiest de policy veilig local als fallback.
- Fallback-events bevatten alleen status/reason/message/timestamp en geen profieldata.
- Eventlog is client-safe en lokaal:
  - `recordProfileSyncEvent`
  - `getProfileSyncEvents`
  - `clearProfileSyncEvents`
  - max 20 events
- Geen automatische sync: alleen handmatig via knop.
- Geen verplichte login: zonder sessie blijft lokale opslag leidend.

## Toekomstige stappen

1. Supabase-project aanmaken.
2. SQL-schema uit `docs/database/supabase-schema.sql` uitvoeren.
3. Auth configureren (sessie/account optioneel houden).
4. Remote async profile store activeren achter feature flag.
5. Opslag van scenario's (`saved_calculations`) toevoegen in UI.
