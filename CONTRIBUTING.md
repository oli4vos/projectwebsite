# Contributing

## Lokale setup

Gebruik Node.js 20 en installeer dependencies.

```bash
nvm use
npm install
npm run dev
```

## Voor iedere wijziging

1. Lees `AGENTS.md`.
2. Lees `docs/calculator-architecture.md` bij calculator-, app-, manifest-, PDF- of toolactivatiewijzigingen.
3. Zoek bestaande centrale berekeningslogica en gedeelde componenten.
4. Controleer `FUNCTIONALITY_STATUS.md` voor flags en zichtbaarheid.
5. Houd de wijziging klein en backward-compatible voor bestaande routes.
6. Controleer bij zichtbare copy of die past binnen de huidige positionering: feitelijk, geen advies en geen beleggen-framing in de publieke UI.

## Berekeningen

- Voeg formules toe in de centrale domeinlaag, niet in React-componenten.
- Gebruik een tool-`logic.ts` alleen als dunne façade of orchestrationlaag.
- Voeg tests toe voor normale invoer, grenzen, nul, ongeldig en regressie.
- Centraliseer percentages, tabellen en normen in versioneerbare constants.

## Frontend en UX

- Volg `UX_GUIDELINES.md` en `DESIGN_SYSTEM.md`.
- Gebruik bestaande gedeelde componenten.
- Test mobile-first op 390 px en daarna op desktop.
- Controleer labels, focus, touch targets, foutmeldingen, overflow en reduced motion.
- Wijzig geen rekenuitkomst tijdens een uitsluitend visuele aanpassing.

## Nieuwe tool

```bash
npm run create:tool <slug>
npm run generate:apps
```

Nieuwe tools blijven standaard hidden totdat manifest, copy, logica, tests, responsive flow en de blueprint-check uit `AGENTS.md` compleet zijn. Een hidden, draft of experimentele tool mag pas publiek of dashboardzichtbaar worden nadat de volledige calculatorblueprint uit `docs/calculator-architecture.md` is gecontroleerd.

## Verplichte controles

```bash
npm run test
npm run test:ux
npm run lint
npm run typecheck
npm run build
```

Voor een brede wijziging heeft `npm run check` de voorkeur.

## Documentatie

- Functionele wijziging: update `FUNCTIONALITY_STATUS.md` en de mutatielog.
- Architectuur- of flowwijziging: update `PROJECT.md`.
- Nieuw UX-patroon: update `UX_GUIDELINES.md` en `DESIGN_SYSTEM.md`.
- Nieuwe publieke tool: update README of relevante statusdocumentatie wanneer aantallen of routes veranderen.

## Reviewchecklist

- Geen gedupliceerde formule of business rule.
- `Calculator.tsx` is een dunne facade; parsing, validatie, mapping, berekening, scherm-viewmodel en PDF-data zijn gescheiden waar de tool complex genoeg is.
- Tests dekken het gewijzigde gedrag.
- Registry is opnieuw gegenereerd en schoon.
- Inactieve tools zijn niet onbedoeld publiek zichtbaar geworden.
- Eén `h1` per pagina en logische kopvolgorde.
- Geen horizontale scroll op mobiel.
- Primaire flow werkt met toetsenbord en touch.
- Loading-, empty-, error- en disabled states zijn beoordeeld.
- Documentatie en statusmatrix zijn actueel.
