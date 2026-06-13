# Kennisbank bronnenregister

Dit document legt vast welke bronnen de kennisbank en toekomstige blogcontent
als primaire basis moeten gebruiken.

De bijbehorende code staat in [`src/lib/knowledge-sources.ts`](../src/lib/knowledge-sources.ts).

## 1. Primaire bronnen

Gebruik deze bronnen als leidend:

- `tijdelijke-regeling-hypothecair-krediet-2026`
- `nibud-advies-hypotheeknormen-2026`
- `volkshuisvesting-leennormen-hypotheek`
- `afm-hypothecair-krediet`
- `afm-toetsrente-q3-2026`
- `rijksoverheid-studieschuld-hypotheek`
- `rijksoverheid-leennormen-2026`
- `afm-consumenten-hypotheek-betalen`

## 2. Bronnen per kennisdocument

### Maximale hypotheek berekenen

Gebruik:

- `tijdelijke-regeling-hypothecair-krediet-2026`
- `nibud-advies-hypotheeknormen-2026`
- `volkshuisvesting-leennormen-hypotheek`
- `afm-consumenten-hypotheek-betalen`
- `afm-hypothecair-krediet`

### Studieschuld en hypotheek

Gebruik:

- `rijksoverheid-studieschuld-hypotheek`
- `tijdelijke-regeling-hypothecair-krediet-2026`
- `nibud-advies-hypotheeknormen-2026`
- `hypotheker-studieschuld-2026`

### Waarom calculators verschillen

Gebruik:

- `tijdelijke-regeling-hypothecair-krediet-2026`
- `nibud-advies-hypotheeknormen-2026`
- `afm-hypothecair-krediet`
- `afm-toetsrente-q3-2026`
- `rijksoverheid-leennormen-2026`

### Eigen geld, familiehulp en schenking

Gebruik primair:

- `tijdelijke-regeling-hypothecair-krediet-2026`
- `afm-consumenten-hypotheek-betalen`

### Energielabel en extra hypotheekruimte

Gebruik:

- `rijksoverheid-leennormen-2026`
- `tijdelijke-regeling-hypothecair-krediet-2026`
- `nibud-advies-hypotheeknormen-2026`

### Starter of doorstromer

Gebruik:

- `tijdelijke-regeling-hypothecair-krediet-2026`
- `afm-consumenten-hypotheek-betalen`
- `afm-hypothecair-krediet`

### Indicatieve berekening

Gebruik:

- `afm-consumenten-hypotheek-betalen`
- `rijksoverheid-studieschuld-hypotheek`
- `volkshuisvesting-leennormen-hypotheek`

## 3. Extra bronnen uit eerdere projectcontext

Uit eerdere projectcontext blijken ook deze bronnen relevant:

1. Tijdelijke regeling hypothecair krediet
2. Nibud hypotheeknormen / financieringslastpercentages
3. Rijksoverheid-pagina over studieschuld en hypotheek
4. AFM toetsrente
5. Rijksoverheid leennormen 2026
6. Independer als publieke vergelijkingscalculator
7. ABN AMRO als publieke hypotheekcalculator
8. Rabobank als publieke hypotheekcalculator
9. ING als publieke hypotheekcalculator
10. De Hypotheker als praktijkuitleg over studieschuld/brutering
11. DUO voor actuele studieschuld, maandlast, aflosfase en betaalpauze
12. NHG als toekomstige bron voor normen/acceptatie
13. Belastingdienst als toekomstige bron voor schenkingen, familieleningen en eigenwoningrente

Voor de rekentool zelf zijn vooral de eerste vijf leidend.
De calculators van Independer, ABN AMRO, Rabobank en ING zijn bruikbaar als
vergelijkingsmateriaal voor UX en publieke gedragspatronen, niet als normbron.

## 4. Bronverwijzing in de tekst

Gebruik in kennisdocumenten bij voorkeur bronverwijzingen zoals:

```tsx
<BronRef id="tijdelijke-regeling-hypothecair-krediet-2026">
  Tijdelijke regeling hypothecair krediet 2026
</BronRef>
```

Website-instructie:

- onderstreep subtiel met een gestippelde lijn;
- toon op hover een bronkaart met titel, uitgever, datum en toelichting;
- open de bron op klik in een nieuw tabblad.

## 5. Bronhiërarchie

Gebruik deze volgorde:

1. Wet / regeling
2. Normadvies
3. Toezichthouder
4. Overheidsuitleg
5. Praktijkbronnen

Voor rekentools zijn vooral wet, normadvies en toezichthouder leidend.
Voor uitleg in de kennisbank kun je daar de overheidsuitleg naast zetten.

