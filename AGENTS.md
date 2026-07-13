# Agent Instructions

Dit bestand is de operationele bron voor AI-agents en engineers die in deze repository werken.
Lees dit eerst voordat je berekeningen, manifests of routing aanpast.

## Hoofdregel

**Nieuwe of aangepaste berekeningslogica mag nooit verspreid worden toegevoegd. Controleer altijd eerst of er bestaande centrale logica is. Hergebruik of breid de centrale rekenlaag uit. Duplicatie van formules, parameters of business rules is niet toegestaan.**

De zichtbare site is in de huidige launch-scope puur informatief over studieschuld. Publieke UI-copy bevat geen beleggen-framing, geen aflossen-vs-beleggen-route en geen persoonlijk advies. `FUNCTIONALITY_STATUS.md` is leidend voor welke tools en flows publiek zichtbaar, hidden, voorbereid of uitgeschakeld zijn.
Alles wat niet meer actief aangeroepen wordt in de zichtbare site blijft wel in de codebase, maar wordt hidden/draft gehouden en uit de publieke registry, navigatie en route-oppervlakken gehouden totdat er expliciet een heractivatiebesluit is.

## Architectuurregels

- Alle financiële en domeinberekeningen horen in centrale domeinlagen of in een dunne tool-façade, nooit in React-componenten, routes of presentatiecode.
- UI-code mag alleen:
  - invoer verzamelen;
  - valideren op vorm en veiligheid;
  - waarden parsen;
  - centrale berekeningsfuncties aanroepen;
  - resultaten renderen.
- Gedeelde logica hoort waar mogelijk in:
  - `src/lib/duo/`
  - `src/lib/mortgage/`
  - `src/lib/basis-calculations.ts`
  - `src/lib/financial-constants/`
  - `src/lib/tax/`
  - `src/lib/pension/`
  - `src/lib/planning/`
- Tool-specifieke `apps/<slug>/logic.ts`-bestanden mogen orchestration bevatten, maar geen berekeningen dupliceren die al centraal bestaan.
- `Calculator.tsx`-bestanden zijn presentatie; daar staan geen business rules, renteformules, leencapaciteitberekeningen of tabelopzoekingen in.
- Wijzigbare normen, tabellen, parameters en percentages moeten centraal, versieerbaar en testbaar zijn opgeslagen.
- Als een tool of flow niet meer actief aangeroepen wordt, zet dan de zichtbare manifest-/route-exposure uit en leg de status vast in `FUNCTIONALITY_STATUS.md`; laat de code alleen bestaan als verborgen heractiveringsbron.

## Nieuwe berekeningen toevoegen

1. Zoek eerst bestaande centrale helpers, constants en tests.
2. Plaats nieuwe formulelogica in de meest centrale passende laag.
3. Voeg alleen een dunne façade toe in de tool als de UI die nodig heeft.
4. Voeg unit tests toe voor normale input, grenswaarden, nulwaarden, ongeldige input en regressie.
5. Bewaar uitvoer- en foutteksten in de laag waar de gebruiker ze ziet, maar houd formules zelf buiten de presentatie.

## Correct versus fout

- Correct: een app-logicmodule roept `calculateAnnuityPayment(...)` of `calculateWeightedAverageRate(...)` aan en rendert alleen de uitkomst.
- Fout: een `Calculator.tsx` berekent zelf rente, maandlast, LTV, LTI, schuldweging of aflossingsschema.
- Fout: dezelfde formule staat in meerdere modules met kleine varianten.
- Fout: hardcoded percentages of tabellen verspreid door componenten.

## Checklist voor wijzigingen

- Is er al een centrale functie voor deze berekening?
- Staat de formule niet al in een component of route?
- Zijn waarden, tabellen en aannames centraal opgeslagen?
- Zijn edge cases getest?
- Blijft de bestaande output exact gelijk of expliciet gemotiveerd gewijzigd?
- Is de wijziging backward-compatible voor bestaande URL's en tools?

## UX- en frontendregels

- Gebruikersbegrip en taakvoltooiing gaan voor technische voorkeur of visuele vernieuwing.
- Ontwerp en test mobile-first. Controleer minimaal 390 px mobiel en 1440 px desktop.
- Introduceer geen nieuw interactiepatroon wanneer een bestaand gedeeld component hetzelfde probleem oplost.
- Hergebruik `CalculatorShell`, `ToolActionButton`, `MobileFieldFlowControls`, `FieldError`, `DisclosureSection` en de centrale UI-componenten waar passend.
- Een calculator toont op mobiel eerst de invoer. Na berekenen mag de flow naar het resultaat scrollen.
- Knoppen en primaire links hebben waar mogelijk een aanraakvlak van minimaal 44 px hoog.
- Elk invoerveld heeft een zichtbaar label of een gelijkwaardige programmatische naam. Een placeholder is geen label.
- Fouten verschijnen bij het betreffende veld, worden begrijpelijk beschreven en zijn voor hulptechnologie waarneembaar.
- Focusstates, toetsenbordbediening, semantische HTML en voldoende contrast zijn verplicht.
- Respecteer `prefers-reduced-motion`. Voeg geen essentiële informatie toe die alleen via animatie zichtbaar is.
- Nieuwe schermen bevatten ook relevante loading-, empty-, error- en disabled states.
- Verander bestaande gebruikersstromen alleen met een expliciete motivatie en regressietest.
- Werk bij UX-wijzigingen ook `UX_GUIDELINES.md`, `DESIGN_SYSTEM.md` of `docs/UX_AUDIT_2026-06-13.md` bij wanneer de standaard of status verandert.

## UX-check voor oplevering

- Werkt de primaire taak zonder horizontale scroll op 390 px?
- Is er precies één paginabrede `h1`?
- Is de tabvolgorde logisch en blijft focus zichtbaar?
- Zijn CTA, validatie en resultaatstatus begrijpelijk zonder vakkennis?
- Zijn mobiele vervolgstappen en de uiteindelijke berekenactie bereikbaar?
- Blijft dezelfde flow op desktop efficiënt en scanbaar?
