# Migratie naar apps/particuliere-gewone-gift

1. Kopieer deze mapinhoud als input voor implementatie.
2. Maak of update `apps/particuliere-gewone-gift/app.json` met `app.json.template`.
3. Zet logica uit `logic.contract.md` om naar pure functies in `logic.ts`.
4. Bouw minimaal basiscase, edge-case en regressietest in `logic.test.ts`.
5. Maak submit-driven `Calculator.tsx` met centrale shell/componenten.
6. Draai checks: `npm run generate:apps && npm run test && npm run lint && npm run typecheck && npm run build`.
