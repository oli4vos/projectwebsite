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
3. Bedrag/getal berekenen — `ready`
4. Breuk berekenen — `ready`
5. Cijfer berekenen — `ready`
6. Contante waarde — `ready`
7. Contante waarde voor een reeks betalingen — `ready`
8. Effectieve rente — `ready`
9. Enkelvoudige rente — `ready`
10. Gemiddelde cijfer — `ready`
11. Gewogen gemiddelde rentepercentage — `ready`
12. Lineaire lening aflossen — `ready`
13. Looptijd annuïteit berekenen — `ready`
14. Nominale rente — `ready`
15. Percentage berekenen (basis) — `ready`
16. Percentage berekenen (uit percentages) — `ready`
17. Romeinse cijfers — `ready`
18. Samengestelde rente — `ready`
19. Toekomstige waarde — `ready`
20. Waardebepaling via cashflow, DCF-methode — `ready`

## Uitgevoerde implementaties in deze batch

- `apps/annuitair-geleend-bedrag`
- `apps/annuiteit-berekenen`
- gedeelde rekenlaag: `src/lib/basis-calculations/annuity.ts`

## Validatie (geslaagd)

- `npm run generate:apps`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

