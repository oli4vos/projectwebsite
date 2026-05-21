# Incident Response (Frontend-only)

Doel: duidelijke afhandeling bij productieproblemen in browser-only tools.

## Ernstniveaus
- **P1**: site of kernflow onbruikbaar (home/tool laadt niet, crashes op kernpad).
- **P2**: foutieve of misleidende output in één toolflow.
- **P3**: copy/layout/progressieve degradatie zonder blokkade.

## Reactietijden
- **P1**: start binnen 4 uur, hotfix dezelfde dag.
- **P2**: start binnen 1 werkdag, fix binnen 3 werkdagen.
- **P3**: inplannen in reguliere sprint.

## Proces
1. Verifieer issue lokaal en op productie-URL.
2. Koppel issue aan release commit (`RELEASE_NOTES.md`).
3. Check runtime-monitoring events (local storage / webhook ontvangen events).
4. Maak minimale fix met regressietest waar mogelijk.
5. Draai `npm run check`.
6. Deploy pas na groene CI.
7. Leg oorzaak + oplossing vast in issue + release notes.

## Communicatie
- Externe tekst:
  - “We hebben een storing in [tool] bevestigd en werken aan een fix.”
  - “De tool blijft indicatief; controleer belangrijke uitkomsten met een adviseur/bron.”
- Na fix:
  - “Probleem opgelost in release [commit], inclusief regressiecheck.”
