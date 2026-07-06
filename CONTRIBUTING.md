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
2. Zoek bestaande centrale berekeningslogica en gedeelde componenten.
3. Controleer `FUNCTIONALITY_STATUS.md` voor flags en zichtbaarheid.
4. Houd de wijziging klein en backward-compatible voor bestaande routes.
5. Controleer bij zichtbare copy of die past binnen de huidige positionering: feitelijk, geen advies en geen beleggen-framing in de publieke UI.

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

Nieuwe tools blijven standaard hidden totdat manifest, copy, logica, tests en responsive flow compleet zijn.

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
- Tests dekken het gewijzigde gedrag.
- Registry is opnieuw gegenereerd en schoon.
- Eén `h1` per pagina en logische kopvolgorde.
- Geen horizontale scroll op mobiel.
- Primaire flow werkt met toetsenbord en touch.
- Loading-, empty-, error- en disabled states zijn beoordeeld.
- Documentatie en statusmatrix zijn actueel.
