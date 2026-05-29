# Basis berekeningen — Uitvoeringsstatus

Peildatum: 2026-05-29
Protocol: `START_HIER_AGENT.md`

## Statuswaarden

- `done`: logic + tests + UI + checks groen
- `ready`: invulblad volledig, klaar om te implementeren
- `needs-spec`: onvoldoende ingevuld invulblad
- `blocked`: technische blokkade buiten invulblad

## Toolstatus

1. Annuïtair geleend bedrag — `done`
2. Annuïteit berekenen — `done`
3. Bedrag/getal berekenen — `done`
4. Breuk berekenen — `done`
5. Cijfer berekenen — `done`
6. Contante waarde — `done`
7. Contante waarde voor een reeks betalingen — `done`
8. Effectieve rente — `done`
9. Enkelvoudige rente — `done`
10. Gemiddelde cijfer — `done`
11. Gewogen gemiddelde rentepercentage — `done`
12. Lineaire lening aflossen — `done`
13. Looptijd annuïteit berekenen — `done`
14. Nominale rente — `done`
15. Percentage berekenen (basis) — `done`
16. Percentage berekenen (uit percentages) — `done`
17. Romeinse cijfers — `done`
18. Samengestelde rente — `done`
19. Toekomstige waarde — `done`
20. Waardebepaling via cashflow, DCF-methode — `done`

## Uitgevoerde implementaties in deze batch

- Artifact-tools draaien via `apps/artifact-basis-berekeningen-*` met profielgestuurde `Calculator.tsx`.
- Nieuwe rekenprofielen in `apps/_artifact_shared/runtime.ts`:
  - `fraction_calculation`
  - `required_grade`
  - `average_grade`
  - `roman_numerals`
  - `dcf_valuation`
  - `percentage_composition`
- Bestaande foutieve profielkoppelingen in basis-categorie gecorrigeerd (o.a. annuïtair geleend bedrag).
- Importscript bijgewerkt zodat artifact-calculators consistent worden opgebouwd met `ArtifactCalculator` + `TOOL_PROFILE`.

## Validatie (geslaagd)

- `npx vitest run apps/_artifact_shared/runtime.test.ts`
- `npx vitest run apps/artifact-basis-berekeningen-*/logic.test.ts`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
