# Design System

De visuele taal is rustig, functioneel en financieel betrouwbaar. De interface gebruikt warme neutralen, één blauw accent en compacte maar leesbare componenten.

## Foundations

De bron van waarheid voor tokens is `src/app/globals.css`.

### Kleur

- Pagina: `--paper` en `--paper-soft`.
- Oppervlak: `--card`.
- Surface utility: `.surface-panel`, `.surface-panel-strong`, `.surface-subtle`, `.result-panel` en `.field-shell`.
- Tekst: `--ink`, `--ink-2`, `--muted`, `--soft`.
- Lijnen: `--hair`, `--hair-2`.
- Primair donker: `--deep`.
- Accent: `--accent` en `--accent-soft`.
- Status: `--pos`, `--neg`, `--warn` met bijbehorende zachte varianten.

Gebruik maximaal één accentkleur per scherm. Positief, negatief en waarschuwing zijn semantische kleuren, geen decoratieve accenten.

### Typografie

- UI en koppen: Geist via `--font-ui`.
- Getallen: Geist Mono via `--font-mono-ui` en tabular figures.
- Body: `--text-body`, regelhoogte rond 1.6.
- Lead: `--text-lead`, maximale regelbreedte circa 65ch.
- H1 en H2: fluid tokens `--text-h1` en `--text-h2`.
- Koppen gebruiken compacte tracking; bodytekst blijft normaal gespatieerd.

### Spacing en containers

- Pagina's gebruiken `.page-shell` met een maximale breedte van 80rem.
- Basisveldgap: 0.5rem tot 0.75rem.
- Componentgap: 1rem tot 1.5rem.
- Sectiegap: 2rem tot 4rem, afhankelijk van informatiedichtheid.
- Gebruik asymmetrie alleen wanneer scanbaarheid verbetert. Financiële formulieren blijven voorspelbaar.

### Radius en schaduw

- Klein: `--radius-sm`.
- Midden: `--radius-md`.
- Groot: `--radius-lg` of expliciet 1.5rem voor hoofdpanelen.
- `shadow-paper` voor subtiele elevatie; `shadow-paper-lg` alleen voor primaire resultaatpanelen.
- Een kaart is alleen nodig wanneer grouping of elevatie betekenis heeft.
- Hoofdpanelen gebruiken bij voorkeur `.surface-panel`; lichte toelichting gebruikt `.surface-subtle`; primaire uitkomst gebruikt `.surface-panel-strong` of `.result-panel`.

## Componenten

### Header

- Sticky, licht transparant oppervlak.
- Desktop toont volledige labels en primaire CTA.
- Mobiel toont korte labels zonder afkapping of horizontale body-scroll.
- Actieve niet-hashroutes krijgen een zichtbaar oppervlak.

### Buttons

- `primary`: donkere hoofdactie.
- `accent`: toolspecifieke berekenactie.
- `outline`: secundaire route of actie.
- `ghost`: lage nadruk.
- Minimale hoogte: 44 px.
- Verplicht: hover, focus-visible, pressed en disabled state.

### Form controls

- Label boven control, helpertekst optioneel, foutmelding eronder.
- Hoogte standaard 48 px voor financiële invoer.
- Getallen gebruiken monospace en tabular figures.
- Controls en labels hebben `min-width: 0` om overflow te voorkomen.
- Checkboxlabels zijn volledig klikbaar.
- Gebruik `.field-shell` voor invoeroppervlakken zodat focus, border en achtergrond consistent blijven.

### CalculatorShell

- Mobiel: invoer -> mobiele veldactie -> resultaat -> details -> disclaimer.
- Desktop: invoer links, resultaat en verdieping rechts.
- Een custom children-opbouw volgt dezelfde volgorde.
- Resultaatpanelen gebruiken een donkere achtergrond alleen voor de kernuitkomst.

### MobileFieldFlowControls

- Alleen zichtbaar onder `md`.
- Toont tekstuele en visuele voortgang.
- Vorige is disabled op de eerste stap.
- Volgende wordt op de laatste stap vervangen door de eindactie.
- Plaats geen tweede primaire submitknop direct ernaast.

### Disclosures

- `DisclosureSection` voor vaste uitlegstructuren.
- `ToolDisclosure` voor aanvullende verdieping.
- Summary is minimaal 44 px hoog en heeft zichtbare focus.
- Essentiële waarschuwingen horen niet uitsluitend in een gesloten disclosure.

### Resultaten en data

- Kernbedragen gebruiken monospace/tabular.
- Gebruik gewone taal vóór technische details.
- Positieve en negatieve kleur krijgen altijd een tekstlabel.
- Grafieken gebruiken centrale formatting uit `src/lib/chart-utils.ts`.
- Resultaatkaarten starten met een hoofdconclusie en gebruiken daarna details via `ResultRow` of disclosure.

## States

- Loading: skeleton die de uiteindelijke layout benadert. De huidige gegenereerde tekstfallback is een minimum, geen eindstandaard.
- Empty: leg uit welke invoer nodig is en wat daarna verschijnt.
- Error: veldniveau bij invoer, paginaniveau bij laadfouten.
- Success: benoem wat is berekend, opgeslagen of gedownload.
- Disabled: lagere opacity, `not-allowed` cursor en geen pressed transform.

## Responsive gedrag

- `sm`, `md`, `lg`, `xl` zijn de standaardbreekpunten.
- Formuliergrids vallen onder `md` terug naar één kolom.
- Geen `h-screen`; gebruik `min-h-[100dvh]`.
- Geen horizontale body-scroll.
- Desktopcontent blijft binnen de page shell; tekst krijgt een eigen max-width.

## Motion

- Gebruik motion alleen voor oriëntatie en feedback.
- Animeer `transform` en `opacity`, niet layout-eigenschappen.
- Houd interactietransities kort, circa 150 tot 250 ms.
- Schakel niet-essentiële animatie uit bij `prefers-reduced-motion`.

## Nieuwe patronen

Een nieuw patroon is alleen toegestaan wanneer:

1. bestaande componenten het probleem niet oplossen;
2. het patroon op mobiel en desktop is getest;
3. alle interactiestates zijn ontworpen;
4. de reden en het gebruik in dit document worden toegevoegd.
