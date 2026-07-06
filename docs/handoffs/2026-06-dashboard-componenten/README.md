# Status

- Datum archivering: 2026-07-06
- Status: ontwerp/overdracht — componentvoorstellen zijn deels verwerkt in de echte UI-componenten onder `src/components/`, niet zelfstandig actueel.
- Relatie tot huidige code: gebruik dit alleen als ontwerpgeschiedenis; actuele componentstandaarden staan in `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` en de echte componenten.

# Olivier — Rekentools (handoff)

Componentvoorstellen voor het dashboard met financiële rekentools.
Pure **React + TypeScript + Tailwind**, geen runtime dependencies buiten React.

## Structuur

```
docs/handoffs/2026-06-dashboard-componenten/
├── README.md
├── tailwind.config.ts          ← extend dit in je eigen tailwind config
├── src/
│   ├── styles/
│   │   └── tokens.css          ← CSS custom properties, importeer 1x globaal
│   ├── lib/
│   │   └── categories.ts       ← Category type + labels + dot-styling
│   ├── components/
│   │   ├── ui.tsx              ← Logo, Pill, Btn, CategoryDot
│   │   ├── inputs.tsx          ← Field, Slider, Toggle
│   │   ├── charts.tsx          ← Sparkline, AreaChart
│   │   ├── ToolCard.tsx
│   │   └── ResultRow.tsx
│   └── views/
│       ├── Dashboard.tsx       ← Artboard 1 — homepage / dashboard
│       ├── CardSpecs.tsx       ← Artboard 2 — app-card varianten
│       ├── ToolPage.tsx        ← Artboard 3 — individuele rekentool
│       ├── FormResult.tsx      ← Artboard 4 — invoer + resultaat
│       └── mobile/
│           ├── MobileFrames.tsx    ← container met 3 phone frames
│           ├── MobileDashboard.tsx
│           ├── MobileForm.tsx
│           └── MobileResult.tsx
```

## Installatie in een bestaand project

1. Kopieer `src/` in je eigen project (of merge per map).
2. Importeer `src/styles/tokens.css` één keer globaal (in je `_app.tsx`, `main.tsx`, `layout.tsx`, etc.):
   ```ts
   import "./styles/tokens.css";
   ```
3. Voeg de Tailwind extensies uit `tailwind.config.ts` toe aan je eigen `tailwind.config.{ts,js}` (de blokken `colors` en `fontFamily` onder `theme.extend`).
4. Laad de fonts (Source Serif 4, Geist, Geist Mono) — bv. via `@fontsource/source-serif-4` + `@fontsource/geist-sans` + `@fontsource/geist-mono`, of via `<link>` naar Google Fonts:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
   ```

## Designsysteem

- **Type**: `Source Serif 4` (display), `Geist` (UI), `Geist Mono` (cijfers — `tabular-nums`)
- **Kleuren** (zie `tokens.css`):
  - papier `#F5F1EA`, inkt `#14181F`
  - accent staalblauw, forest-groen (positief), baksteen-rood (negatief)
- **Categoriedots** in plaats van iconen — strenger en consistenter:
  - `studie` ochre · `beleg` blauw · `hyp` groen · `maand` rood

## Conventies

- Cijfers altijd `font-mono` + `tabular-nums` (utility-class `.tabular`)
- Maandbedragen, percentages, looptijden zijn voorbeelddata (april/mei 2026 referentie)
- Geen state management — voorbeelddata staat hardcoded in views, vervang door je eigen calc/hook
- Inputs zijn ongecontroleerd (`defaultValue`); vervang door `useState` of formulier-lib in productie

## Niet meegeleverd (bewust)

- iconenset (we gebruiken category-dots)
- routing / dataschema's
- backend-koppeling
- echte calculatielogica (alleen layout en typografie)
