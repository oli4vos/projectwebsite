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

## Invoer- en formulier-UX

- Maak invoer in live tools overzichtelijk, rustig en stapsgewijs.
- Vermijd lange lijsten met velden op één scherm; splits complexe flows op in duidelijke secties of stappen.
- Toon alleen velden die relevant zijn voor de gemaakte keuzes.
- Gebruik progressive disclosure voor verdiepende velden en scenario's.
- Geef elk complex veld een korte toelichting, met waar nuttig een voorbeeld.
- Gebruik begrijpelijke labels en geen interne DUO-termen zonder uitleg.
- Vermeld per relevant veld waar de gebruiker het bedrag of de datum in Mijn DUO kan vinden.
- Toon vóór de berekening een overzichtsscherm met alle ingevulde gegevens.
- Maak duidelijk welke waarden uit Mijn DUO moeten worden overgenomen.
- Geef duidelijke foutmeldingen naast het betreffende veld.
- Laat gebruikers altijd teruggaan zonder invoer te verliezen.
- Bewaar invoer lokaal volgens het bestaande profiel- en opslagmodel.
- Maak bedragen, perioden en scenario's visueel goed onderscheidbaar.
- Zorg dat formulieren goed werken op mobiel en desktop.
- Gebruik waar mogelijk bestaande centrale formuliercomponenten in plaats van per tool afwijkende formulieren.
- Houd labels, toetsenbordbediening, focus en foutmeldingen toegankelijk en semantisch correct.

## PDF-functionaliteit

- Voeg op iedere live calculator en relevante resultatenpagina een duidelijke knop toe: `Download uitgebreid PDF-overzicht`.
- Gebruik één centrale PDF-laag en gedeelde PDF-componenten; bouw niet per tool een losse PDF-implementatie.
- Laat de PDF dezelfde gevalideerde resultaatdata gebruiken als de webinterface en herbereken niets apart.
- Houd PDF-data gescheiden van React-UI-componenten.
- Genereer PDF's bij voorkeur client-side als dat betrouwbaar kan; gebruik alleen server- of serverlessverwerking wanneer dat aantoonbaar nodig is.
- Voeg geen persoonlijke invoer toe aan logging of externe PDF-diensten.
- De PDF bevat minimaal een voorblad, gegroepeerde invoer, uitgebreide resultaten, scenariovergelijking, tijdlijn, toelichting per uitkomst, regels en bronnen, aannames en beperkingen, en praktische actiepunten.
- Zorg voor professioneel A4-ontwerp met duidelijke hoofdstukken, vaste kop- en voettekst, paginanummers, goede witruimte en correcte pagina-afbrekingen.
- Vermeld per regel of bron de officiële bron, brontitel, URL, geldigheidsdatum en geraadpleegde datum wanneer dat relevant is voor de berekening.
- Test PDF-data, verplichte secties, consistente uitkomsten, correcte bestandsnaam en de afstemming met de webinterface.

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
- Nieuwe of aangepaste formulier- en PDF-flows volgen altijd de centrale componenten en gedeelde data- en formatlaag.
- Werk bij UX-wijzigingen ook `UX_GUIDELINES.md`, `DESIGN_SYSTEM.md` of `docs/UX_AUDIT_2026-06-13.md` bij wanneer de standaard of status verandert.

## UX-check voor oplevering

- Werkt de primaire taak zonder horizontale scroll op 390 px?
- Is er precies één paginabrede `h1`?
- Is de tabvolgorde logisch en blijft focus zichtbaar?
- Zijn CTA, validatie en resultaatstatus begrijpelijk zonder vakkennis?
- Zijn mobiele vervolgstappen en de uiteindelijke berekenactie bereikbaar?
- Blijft dezelfde flow op desktop efficiënt en scanbaar?
