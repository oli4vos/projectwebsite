# Tool Audit — 2026-05-28

## Scope

- Controle uitgevoerd op de huidige publieke tools (`npm run check` geslaagd).
- Extra focus op scenario-opslag en scenario-heropenflow.
- Geen wijziging in financiële rekenformules.

## Validatie

- `npm run test` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
- `npm run check` ✅

## Scenario-opslag status

- Feature flag: `NEXT_PUBLIC_ENABLE_SAVED_CALCULATIONS` (default uit).
- Handmatig opslaan actief op: `apps/volgende-euro`.
- Scenario-lijst op `/profiel` toont lokale scenario’s (max 10 in UI).

## Scenario-heropenflow

- Nieuw: vanuit `/profiel` kan elk opgeslagen scenario worden heropend via deep link:
  - `/apps/<tool-slug>?savedCalculationId=<id>`
- Voor nu is inhoudelijk herstel geïmplementeerd in:
  - `apps/volgende-euro/Calculator.tsx`
- Gedrag bij mismatch/onbekend scenario:
  - geen crash;
  - rustige melding in de tool;
  - standaard local-first flow blijft intact.

## Open vervolgpunten

- Scenario-herstel ook per tool toevoegen zodra scenario-opslag buiten `volgende-euro` wordt aangezet.
- Private-lease draft-tool inhoudelijk nalopen voordat deze publiek wordt gezet.
- Glossary-dekking verder uitbreiden op losse vrije tekstblokken.

