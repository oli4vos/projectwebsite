# Sources & Regulations - actieve tools 2026-07-18

Dit document is een bron- en regelgevingsoverdracht voor de actieve studieschuld- en hypotheektools. Het wijzigt geen rekenlogica. De huidige peildatum is 18 juli 2026.

## Bronhierarchie

1. Wet- en regelgeving.
2. Officiele overheidswebsites.
3. DUO, Belastingdienst, Rijksoverheid, AFM, NHG en andere bevoegde instanties.
4. Officiele uitvoeringsdocumentatie.
5. Erkende technische normen.
6. Betrouwbare secundaire toelichtingen.

Commerciele calculators mogen alleen worden gebruikt voor vergelijking van gebruikerservaring of marktpraktijk. Ze zijn geen normbron.

## Geraadpleegde primaire bronnen

| Bron | Publicatie/geldigheid | Geraadpleegd | Type |
|---|---:|---:|---|
| Staatscourant 2025, 36471, Wijzigingsregeling hypothecair krediet 2026 | gepubliceerd 31-10-2025, in werking 01-01-2026 | 2026-07-18 | wettelijke verplichting |
| Volkshuisvesting Nederland, leennormen voor hypotheken | actuele overheidspagina | 2026-07-18 | overheidsuitleg |
| Volkshuisvesting Nederland, LTV | actuele overheidspagina, LTV 100% sinds 01-01-2018 | 2026-07-18 | overheidsuitleg |
| AFM, hypothecair krediet en toetsrente | actuele toezichtpagina, Q3 2026 | 2026-07-18 | uitvoeringsbeleid/toezicht |
| DUO, nieuwe rentepercentages bekend | gepubliceerd 10-10-2025, rentejaar 2026 | 2026-07-18 | uitvoeringsbeleid |
| DUO, rente voor terugbetalers | actuele DUO-pagina | 2026-07-18 | uitvoeringsbeleid |
| Rijksoverheid, studieschuld en hypotheek | actuele overheidspagina | 2026-07-18 | overheidsuitleg |
| Rijksoverheid, maximale hypotheek met NHG | actuele overheidspagina, 2026 | 2026-07-18 | overheidsuitleg |
| NHG, een hypotheek met NHG | actuele NHG-pagina, 2026 | 2026-07-18 | uitvoeringsbeleid/voorwaarden |
| Nibud, Advies hypotheeknormen 2026 | rapport 30-09-2025 | 2026-07-18 | normadvies |

## Genormaliseerde regels

### Hypotheeknormen 2026

- Exacte regel: de Tijdelijke regeling hypothecair krediet bepaalt de maximale hypotheek ten opzichte van inkomen en woningwaarde. De wijzigingsregeling 2026 vervangt de financieringslasttabellen en bevat energielabelbedragen.
- Primaire bron: Staatscourant 2025, 36471.
- Publicatie- of geldigheidsdatum: gepubliceerd 31-10-2025; inwerkingtreding 01-01-2026.
- Ingangsdatum: 01-01-2026.
- Einddatum: niet expliciet; jaarlijkse herziening verwacht.
- Doelgroep: aanbieders en consumenten bij hypothecair krediet.
- Uitzonderingen: maatwerk en afwijkingen binnen de regeling, onder meer voor LTV en energiebesparende voorzieningen.
- Overgangsrecht: niet verder uitgewerkt in deze notitie; bij jaargangwissel controleren op aanvraagdatum/offertedatum.
- Onzekerheden: geen inhoudelijke onzekerheid voor 2026-tabellen; implementatie moet wel controleren of bronextractie exact blijft.
- Implementatie-impact: financieringslastpercentages blijven in `src/lib/financial-constants/mortgage-financing-load-data.ts`; dit bestand is gegenereerd en mag niet handmatig worden aangepast.
- Benodigde tests: tabelversie, rentekolomgrenzen, inkomensrijgrenzen, AOW-tabel, fallback bij verkeerd normjaar, PDF-bronversie.
- Voorstel bronmetadata: `sourceTier: "wet"`, `status: "definitief"`, `validFrom: "2026-01-01"`, `publishedAt: "2025-10-31"`, `lastChecked: "2026-07-18"`.

### AFM-toetsrente

- Exacte regel: voor hypotheken met een rentevaste periode korter dan 10 jaar wordt de toetsrente elk kwartaal door AFM vastgesteld; de toetsrente voor Q3 2026 bedraagt 5%.
- Primaire bron: AFM, Hypothecair krediet.
- Publicatie- of geldigheidsdatum: Q3 2026; AFM publiceert uiterlijk twee weken voor het kwartaal.
- Ingangsdatum: 01-07-2026.
- Einddatum: 30-09-2026, tenzij AFM anders publiceert.
- Doelgroep: hypothecair krediet met rentevaste periode korter dan 10 jaar.
- Uitzonderingen: rentevaste periode van minimaal 10 jaar rekent normaal met werkelijke rente.
- Overgangsrecht: controleer bij offerte-/aanvraagdatum welke kwartaaltoetsrente hoort.
- Onzekerheden: Q4 2026 publicatie volgt normaal medio september 2026.
- Implementatie-impact: de toetsrente moet niet als blijvende default zonder geldigheidsperiode in code staan; leg per kwartaal vast.
- Benodigde tests: rentevast 9 jaar gebruikt max(werkelijke rente, toetsrente); rentevast 10 jaar gebruikt werkelijke rente; kwartaalmetadata verschijnt in rapport.
- Voorstel bronmetadata: aparte `mortgageTestRatesByQuarter` met `validFrom`, `validUntil`, `rate`, `sourceUrl`, `sourceTier: "toezicht"`.

### LTV en energiebesparende voorzieningen

- Exacte regel: maximale hypotheek op basis van woningwaarde is 100%; bij energiebesparende voorzieningen mag de totale hypotheeklening niet meer bedragen dan 106% van de woningwaarde.
- Primaire bron: Volkshuisvesting Nederland, Maximale hypotheek op basis van woningwaarde (LTV).
- Publicatie- of geldigheidsdatum: actuele overheidspagina; 100% geldt vanaf 01-01-2018.
- Ingangsdatum: 01-01-2018 voor basis-LTV; 2026-bedragen volgen de 2026-regeling.
- Einddatum: geen; jaarlijks en bij wetswijziging controleren.
- Doelgroep: hypothecair krediet op woningwaarde.
- Uitzonderingen: restschuld, oversluiten, energiebesparende voorzieningen en andere in de regeling genoemde afwijkingen.
- Overgangsrecht: bij gewijzigde regeling controleren op aanvraagdatum/offertedatum.
- Onzekerheden: exacte toepassing kan afhangen van advies- en acceptatiebeleid.
- Implementatie-impact: basis-LTV, EBV-ruimte en energielabelbedragen centraal dateerbaar opslaan, niet in toolcomponenten.
- Benodigde tests: woningwaarde 350.000 zonder EBV blijft 350.000; EBV maximaal 106%; energielabelbedragen verhogen inkomensruimte niet woningwaarde-limiet behalve toegestane EBV.
- Voorstel bronmetadata: jaarlijkse `mortgageLtvRulesByYear` en `mortgageEnergyLoanSpaceByYear`.

### NHG-grens 2026

- Exacte regel: NHG is in 2026 mogelijk tot 470.000 euro; met energiebesparende voorzieningen is 498.200 euro mogelijk en het extra bedrag boven 470.000 euro moet aan die maatregelen worden besteed.
- Primaire bronnen: Rijksoverheid, maximale hypotheek voor NHG; NHG, Een hypotheek met NHG.
- Publicatie- of geldigheidsdatum: 2026.
- Ingangsdatum: 01-01-2026.
- Einddatum: 31-12-2026 verwacht; jaarlijks controleren.
- Doelgroep: hypotheken met Nationale Hypotheek Garantie.
- Uitzonderingen: NHG-voorwaarden en normen; hoofdverblijf, koopsom/getaxeerde waarde en EBV/EBB-voorwaarden.
- Overgangsrecht: controleren in NHG Voorwaarden en normen bij jaarovergang.
- Onzekerheden: volledige acceptatievoorwaarden staan in NHG Voorwaarden en normen, niet volledig in de publieksuitleg.
- Implementatie-impact: NHG-grens en borgtochtprovisie horen in jaarlijks constants-bestand; huidige hardcoding in `src/lib/mortgage/max-mortgage.ts` moet door Financial Domain Guardian worden verplaatst.
- Benodigde tests: 470.000 zonder EBV; 498.200 met EBV; geen extra NHG-ruimte zonder besteding aan maatregelen; rapport toont bronjaar.
- Voorstel bronmetadata: `nhgLimitsByYear[2026] = { standard: 470000, withEnergyMeasures: 498200, guaranteeFeePercent: 0.4, validFrom: "2026-01-01", validUntil: "2026-12-31" }`.

### Studieschuld in hypotheekruimte

- Exacte regel: de aanbieder gaat meestal uit van het maandbedrag dat iemand maandelijks aan DUO betaalt. In aanloopfase, draagkrachtverlaging of aflossingsvrije periode kan worden uitgegaan van het bedrag dat iemand zou moeten betalen.
- Primaire bron: Rijksoverheid, Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?
- Publicatie- of geldigheidsdatum: actuele overheidspagina.
- Ingangsdatum: methode actueel sinds 2024 in publieksuitleg; voor 2026 opnieuw gecontroleerd.
- Einddatum: geen; controleren bij jaarlijkse hypotheeknormen.
- Doelgroep: oud-studenten met studieschuld bij hypotheekaanvraag.
- Uitzonderingen: aanloopfase, draagkrachtverlaging, aflossingsvrije periode.
- Overgangsrecht: controleren bij nieuwe Trhk-jaargang en acceptatiebeleid.
- Onzekerheden: geldverstrekkers kunnen eigen acceptatie-invulling hebben binnen de wettelijke kaders.
- Implementatie-impact: tool moet invoer vragen naar actuele DUO-last en naar wettelijke DUO-termijn wanneer actuele betaling tijdelijk lager of nul is.
- Benodigde tests: actuele DUO-last, aanloopfase zonder betaling, draagkrachtverlaging, aflossingsvrije periode, extra aflossen verlaagt DUO-maandlast en hypotheekimpact.
- Voorstel bronmetadata: koppel aan `rijksoverheid-studieschuld-hypotheek` en markeer bruteringsstaffel als `indicatieve-benadering` totdat acceptatiebeleid of wettelijke norm exact is gecentraliseerd.

### DUO-rente 2026

- Exacte regel: voor 2026 is SF35 2,33% en SF15 2,29%; voor terugbetalers geldt dit alleen wanneer de 5-jarige rentevaste periode op 31-12-2025 afloopt. Voor studenten in 2026 geldt het percentage voor 1 jaar; voor studenten die in 2025 voor het laatst studiefinanciering ontvingen staat het vanaf 01-01-2026 5 jaar vast.
- Primaire bronnen: DUO, Nieuwe rentepercentages bekend; DUO, Rente voor terugbetalers.
- Publicatie- of geldigheidsdatum: gepubliceerd 10-10-2025; rentejaar 2026.
- Ingangsdatum: 01-01-2026.
- Einddatum: 31-12-2026 als jaarpercentage voor studenten; voor relevante terugbetalers rentevast tot en met 31-12-2030.
- Doelgroep: studenten, ex-studenten en terugbetalers onder SF35/SF15.
- Uitzonderingen: rentevaste periode loopt door voor terugbetalers bij wie die niet eindigt op 31-12-2025; levenlanglerenkrediet volgt SF35-rente.
- Overgangsrecht: per persoonlijke rentevaste periode in Mijn DUO controleren.
- Onzekerheden: toekomstige rentejaren zijn onbekend en mogen niet als feit worden voorspeld.
- Implementatie-impact: `DUO_RATE_HISTORY_BY_YEAR` klopt voor 2026; metadata moet aangeven dat rentejaar persoonlijk kan verschillen.
- Benodigde tests: SF35 2026 2,33; SF15 2026 2,29; laatste vijf jaren; onbekende regeling valt expliciet terug op SF35 met waarschuwing; leningdelen met afwijkend rentejaar.
- Voorstel bronmetadata: voeg `validFrom`, `validUntil`, `rateFixedUntilForNewPeriod`, `appliesWhen` toe aan DUO-rentehistorie.

## Wijziglijke waarden

| Waarde | Frequentie | Centrale opslag | Opmerking |
|---|---|---|---|
| DUO-rentepercentages | jaarlijks, persoonlijk 1 of 5 jaar vast | `src/lib/financial-constants/duo-rate-history.ts` | voeg geldigheidsperiode en doelgroep toe |
| DUO-draagkrachtvrije voet en percentage | jaarlijks/wetswijziging | `src/lib/financial-constants/years.ts` | bron moet explicieter dan algemene DUO-pagina |
| DUO-leenbedragen | jaarlijks/wijziging | `src/lib/financial-constants/years.ts` | bedragpagina apart hercontroleren |
| Financieringslastpercentages | jaarlijks | `mortgage-financing-load-data.ts` | gegenereerd uit Staatscourant |
| AFM-toetsrente | per kwartaal | nog toevoegen | niet als permanente default behandelen |
| NHG-grenzen en borgtochtprovisie | jaarlijks | nog toevoegen onder `financial-constants` | verplaatsen uit hypotheekengine |
| Energielabelbedragen en EBV/LTV | jaarlijks/wetswijziging | nog toevoegen onder `financial-constants` | onderscheid inkomensruimte en LTV-ruimte |
| Fiscale percentages box 1/box 3 | jaarlijks/voorlopig-definitief | `years.ts` | voorlopige status expliciet houden |

## Overdracht per agent

Financial Domain & Calculation Guardian:

- Voeg `validFrom`, `validUntil`, `publishedAt`, `appliesTo`, `sourceTier` en `uncertainties` toe aan wijziglijke constants waar dat nog ontbreekt.
- Verplaats NHG-grenzen, borgtochtprovisie, AFM-toetsrente per kwartaal en energiebedragen naar dateerbare constants.
- Centraliseer DUO-draagkrachtbronmetadata met bronregels en regressietests voor SF35, SF15, SF15-oud en LLLK.
- Valideer de indicatieve bruteringsstaffel voor studieschuld opnieuw tegen Trhk/Nibud/marktacceptatie en label afwijkingen als projectaanname.

Feature Integrator en Form UX & PDF Guardian:

- Toon bij DUO-rente altijd dat het persoonlijke rentejaar in Mijn DUO gecontroleerd moet worden.
- Vraag bij hypotheekimpact naar actuele DUO-betaling en naar wettelijke DUO-termijn wanneer iemand in aanloopfase, draagkrachtverlaging of aflossingsvrije periode zit.
- Neem in scherm en PDF bronlabels op voor normjaar, rentejaar, AFM-kwartaal, NHG-jaar en DUO-regeling.
- Waarschuw dat de tool geen DUO-beschikking, hypotheekofferte of persoonlijk advies is.

## Open onzekerheden

- DUO-draagkrachtvrije voeten in `years.ts` hebben een centrale waarde maar missen nog een exacte primaire bronverwijzing per bedrag.
- NHG Voorwaarden en normen moeten bij technische implementatie naast de publieksuitleg worden gecontroleerd.
- De studieschuldbrutering is nu een projectmatige indicatie; technische wijziging hoort bij de Financial Domain Guardian.
- Q4 2026 AFM-toetsrente is op 18 juli 2026 nog niet de actuele kwartaalwaarde.
