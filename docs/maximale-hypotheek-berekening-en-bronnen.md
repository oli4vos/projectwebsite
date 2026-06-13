# Maximale hypotheek: berekening, rapportage en bronnen

Dit document beschrijft hoe de tool `artifact-hypotheek-wonen-maximale-hypotheek`
de indicatieve maximale hypotheek berekent, welke tussenstappen in het PDF-rapport
staan en welke bronnen bij de normen horen.

De tool geeft scenario-inzicht. De uitkomst is geen hypotheekofferte en geen
persoonlijk financieel, fiscaal of juridisch advies.

## 1. Hoofdvolgorde

De berekening volgt deze vaste pipeline:

```text
normjaar en scenario
-> toetsinkomen
-> toetsrente
-> financieringslastpercentage
-> maximale bruto woonlast
-> financiële verplichtingen
-> annuïtaire hoofdsom
-> woningwaarde en LTV
-> NHG-grens indien gekozen
-> laagste relevante grens
-> eigen middelen en financieringstekort
-> bruto maandlast bij het eindbedrag
```

De belangrijkste ontwerpregel is:

```text
eindhypotheek = min(
  maximale hypotheek op inkomen,
  maximale hypotheek op woningwaarde,
  NHG-grens indien van toepassing
)
```

Eigen geld verhoogt de maximale hypotheek op inkomen niet. Het verlaagt het
bedrag dat extern gefinancierd moet worden en kan aankoopkosten of een
financieringstekort opvangen.

## 2. Stap voor stap

### Stap 1: normset vastleggen

De engine gebruikt een normjaar en een versie van de financieringslasttabel.
Voor iedere PDF worden beide vastgelegd. Daardoor is later herleidbaar met welke
normen de berekening is gemaakt.

Code:

- `src/lib/financial-constants/years.ts`
- `src/lib/financial-constants/mortgage-financing-load-data.ts`
- `src/lib/financial-constants/mortgage-financing-load.ts`
- `src/lib/mortgage/max-mortgage.ts`

De gegenereerde tabel bevat:

- normjaar;
- versielabel;
- bronorganisatie en bron-URL;
- datum waarop de bron is gecontroleerd;
- rentekolommen;
- inkomensgrenzen;
- afzonderlijke percentages vóór en vanaf de AOW-leeftijd.

### Stap 2: toetsinkomen

```text
toetsinkomen = primair bruto jaarinkomen + partnerinkomen
```

De huidige MVP ondersteunt regulier huishoudinkomen en partnerinkomen. De tool
bevat nog geen afzonderlijke bestendigheidstoets voor ondernemersinkomen,
variabele bonussen of toekomstig pensioeninkomen.

### Stap 3: toetsrente

Bij een rentevaste periode korter dan tien jaar:

```text
toetsrente = max(werkelijke rente, opgegeven AFM-toetsrente)
```

Bij een rentevaste periode van minimaal tien jaar:

```text
toetsrente = werkelijke rente
```

De toetsrente wordt gebruikt voor de financieringslasttabel en de annuïtaire
omrekening van maandbudget naar hoofdsom. De werkelijke rente wordt gebruikt om
de getoonde bruto maandlast bij het eindbedrag te berekenen.

### Stap 4: financieringslastpercentage

```text
percentage = lookup(
  normjaar,
  toetsinkomen,
  toetsrente,
  leeftijdsgroep
)
```

De tabelselectie kiest de hoogste inkomensgrens die niet boven het toetsinkomen
ligt. Daarna wordt de rentekolom gekozen waarvan de bovengrens de toetsrente
bevat.

Wanneer het gevraagde normjaar niet overeenkomt met het tabeljaar, gebruikt de
engine de tabel niet stilzwijgend. Er wordt teruggevallen op de indicatieve
fallback en een waarschuwing toegevoegd.

### Stap 5: bruto woonlastbudget

```text
maximale jaarlijkse woonlast = toetsinkomen x financieringslastpercentage
maximale maandelijkse woonlast = maximale jaarlijkse woonlast / 12
```

Dit is het maandbudget vóór afzonderlijke contractuele verplichtingen.

### Stap 6: financiële verplichtingen

```text
beschikbaar maandbudget =
  maximale maandelijkse woonlast
  - studieschuldimpact
  - overige maandelijkse verplichtingen
```

De studieschuldimpact en overige verplichtingen worden eerst van het
maandbudget afgetrokken. De engine trekt dus niet achteraf een schuldhoofdsom
van de hypotheek af.

Voor DUO geldt in de huidige implementatie:

- bij normale terugbetaling wordt het opgegeven actuele maandbedrag gebruikt;
- bij aanloopfase, draagkrachtverlaging of betaalpauze is het wettelijke
  maandbedrag nodig;
- het gekozen maandbedrag wordt via de centrale bruteringsstaffel vertaald naar
  hypotheekimpact;
- ontbreekt het benodigde maandbedrag, dan wordt de betrouwbaarheid laag en
  verschijnt een blokkerende waarschuwing.

### Stap 7: annuïtaire hoofdsom

Met:

```text
maandrente = toetsrente / 12
n = looptijd in maanden
```

geldt bij een positieve rente:

```text
hoofdsom =
  beschikbaar maandbudget
  x (1 - (1 + maandrente)^(-n))
  / maandrente
```

Bij 0% rente:

```text
hoofdsom = beschikbaar maandbudget x n
```

De uitkomst is de maximale hypotheek op inkomen.

### Stap 8: woningwaarde en LTV

De tool berekent afzonderlijk een onderpandgrens. Extra leenruimte op basis van
het bestaande energielabel hoort bij de inkomensgrens en wordt niet op de
woningwaarde gestapeld:

```text
woningwaardelimiet =
  woningwaarde x LTV-percentage
  + werkelijk gefinancierde energiebesparende voorzieningen
```

Zonder energiebesparende voorzieningen blijft 100% LTV bij een woningwaarde van
EUR 350.000 dus EUR 350.000. Alleen het bedrag dat aantoonbaar voor toegestane
energiebesparende voorzieningen wordt geleend kan de onderpandgrens verhogen,
met een absolute bovengrens van 106% van de woningwaarde.

De UI en het PDF-rapport benoemen deze bedragen daarom afzonderlijk:

- `Toegepaste extra leenruimte op inkomen door energielabel`: verhoogt alleen
  de inkomenslimiet.
- `Toegepaste extra leenruimte op inkomen voor energiebesparende maatregelen`:
  verhoogt de inkomenslimiet voor het werkelijk opgegeven en toegestane bedrag.
- `Toegepaste extra LTV-ruimte voor energiebesparende maatregelen`: hetzelfde
  toegestane maatregelenbedrag dat boven de basislimiet op woningwaarde mag
  worden gefinancierd.

Een generieke regel zoals `energieruimte` wordt bewust vermeden, omdat daaruit
niet blijkt op welke wettelijke limiet het bedrag is toegepast.

Zonder woningwaarde kan de tool alleen de inkomensruimte tonen. Een volledige
vergelijking met de onderpandgrens is dan niet mogelijk.

### Stap 9: NHG

Wanneer NHG is gekozen, neemt de engine de geconfigureerde NHG-grens mee als
afzonderlijke bovengrens. De standaardgrens en de grens met energiebesparende
voorzieningen staan momenteel nog in `src/lib/mortgage/max-mortgage.ts`.

Deze bedragen moeten in een volgende onderhoudsstap net als de
financieringslasttabel naar een jaarlijks bestand onder
`src/lib/financial-constants/` worden verplaatst.

### Stap 10: eindmaximum

```text
eindmaximum = min(inkomenslimiet, woningwaardelimiet, NHG-limiet)
```

Alleen beschikbare limieten doen mee. Als geen woningwaarde is opgegeven, is de
inkomenslimiet de zichtbare indicatie en meldt de rapportage dat de LTV-toets
ontbreekt.

### Stap 11: eigen middelen

```text
financieringstekort = max(
  koopprijs
  + aankoopkosten
  + renovatie
  - eindhypotheek
  - eigen geld,
  0
)
```

De huidige standaardinschatting voor aankoopkosten is 4% van de koopprijs,
tenzij een ander percentage wordt aangeleverd.

### Stap 12: bruto maandlast

De bruto maandlast bij de uiteindelijke hypotheek wordt annuïtair berekend met
de werkelijke hypotheekrente en de gekozen looptijd. Dit bedrag is een
maandlastindicatie en geen netto woonlast.

## 3. Opbouw van het PDF-rapport

Het PDF-rapport wordt opgebouwd door:

- `src/lib/mortgage/report.ts`: maakt het domeinrapport;
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/report.ts`: tekent het PDF-bestand;
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx`: start de download.

De volgorde in de PDF is:

1. volledige berekeningstijdlijn;
2. resultatentabel;
3. gebruikte invoer;
4. inkomens- en verplichtingentabel;
5. woningwaarde, NHG en eigen middelen;
6. waarschuwingen;
7. aannames;
8. bronnenregister.

Iedere tijdlijnstap bevat:

- doel en uitleg;
- toegepaste formule;
- gebruikte waarden;
- tussenuitkomst;
- broncodes die verwijzen naar het bronnenregister.

## 4. Jaarlijkse tabelupdate

De financieringslasttabel wordt niet handmatig in de engine onderhouden. Het
script `scripts/update-mortgage-financing-load-table.mjs` leest de officiële publicatie en
genereert:

```text
src/lib/financial-constants/mortgage-financing-load-data.ts
```

Voor 2026:

```bash
npm run update:mortgage-financing-load-table
```

Voor een volgend jaar met een nieuwe publicatie:

```bash
npm run update:mortgage-financing-load-table -- \
  --year=2027 \
  --source=https://zoek.officielebekendmakingen.nl/<nieuwe-publicatie>.html
```

Na iedere jaarlijkse update zijn minimaal deze controles verplicht:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Controleer daarnaast handmatig:

- normjaar en versielabel;
- aantal rentekolommen;
- laagste, middelste en hoogste inkomensrij;
- tabel vóór AOW en tabel vanaf AOW;
- grenswaarden exact op een rentekolom;
- grenswaarden exact op een inkomensrij;
- rapportage van de gebruikte tabelversie in de PDF.

## 5. Jaarlijks of periodiek te actualiseren normen

| Onderdeel | Frequentie | Huidige eigenaar |
| --- | --- | --- |
| Financieringslastpercentages | jaarlijks | gegenereerd databestand |
| Normjaar | jaarlijks | `financial-constants/years.ts` |
| AFM-toetsrente | per kwartaal | invoer/fallback in hypotheekengine |
| NHG-grenzen | jaarlijks | voorlopig `max-mortgage.ts` |
| Energiebedragen | jaarlijks mogelijk | voorlopig `max-mortgage.ts` |
| LTV-grens | bij wetswijziging | invoer/default in hypotheekengine |
| DUO-regels en rente | jaarlijks/wijziging | centrale `src/lib/duo/` en financial constants |
| Bruteringsstaffel studieschuld | bij normwijziging | `financial-constants/years.ts` |
| AOW-leeftijd | wettelijk wijzigend | nog geen centrale hypotheekdatum-engine |

## 6. Bronnenregister

### Wettelijke financieringslastpercentages 2026

- Organisatie: Ministerie van Financiën / Staatscourant
- Bron: [Wijzigingsregeling hypothecair krediet 2026](https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html)
- Gebruikt voor: financieringslastpercentages, rentekolommen, leeftijdstabellen
  en normwijzigingen voor 2026.

### Maximale hypotheek op inkomen

- Organisatie: Volkshuisvesting Nederland
- Bron: [Maximale hypotheek op basis van inkomen (LTI)](https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-inkomen)
- Gebruikt voor: samenhang tussen toetsinkomen, rente, annuïtaire toetsing en
  financiële verplichtingen.

### AFM-toetsrente

- Organisatie: Autoriteit Financiële Markten
- Bron: [Hypothecair krediet](https://www.afm.nl/nl-nl/sector/themas/dienstverlening-aan-consumenten/financiele-producten/hypothecair-krediet)
- Gebruikt voor: toetsrente bij een rentevaste periode korter dan tien jaar.

### Woningwaarde en LTV

- Organisatie: Volkshuisvesting Nederland
- Bron: [Maximale hypotheek op basis van woningwaarde (LTV)](https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-woningwaarde-ltv)
- Gebruikt voor: standaard-LTV en de uitzondering voor energiebesparende
  voorzieningen.

### Studieschuld

- Organisatie: Rijksoverheid
- Bron: [Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?](https://www.rijksoverheid.nl/vraag-en-antwoord/huis-kopen/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek)
- Gebruikt voor: actuele maandlast en wettelijk maandbedrag tijdens aanloopfase,
  draagkrachtregeling of aflossingsvrije periode.

### NHG

- Organisatie: Nationale Hypotheek Garantie
- Bron: [Een hypotheek met NHG](https://www.nhg.nl/het-product-nhg/een-hypotheek-met-nhg/)
- Gebruikt voor: NHG-grens en aanvullende voorwaarden.

## 7. Bekende grenzen van de huidige MVP

- De financieringslasttabel modelleert de tabellen voor aftrekbare rente. Een
  afzonderlijke route voor niet-aftrekbare leningdelen bestaat nog niet.
- De leeftijdsgroep gebruikt voorlopig `67 jaar` als technische grens. De
  persoonlijke AOW-datum wordt nog niet uit geboortedatum en wetgeving bepaald.
- Een afzonderlijke pensioentoets voor een looptijd die doorloopt na pensioen
  ontbreekt nog.
- Ondernemersinkomen, tijdelijk inkomen en variabele beloning worden niet apart
  gevalideerd.
- NHG- en energiebedragen zijn nog niet allemaal naar een jaarlijks
  versieerbaar constants-bestand verplaatst.
- De studieschuldbrutering gebruikt een centrale projectstaffel. Deze moet bij
  iedere normwijziging opnieuw tegen acceptatiebeleid en bronmateriaal worden
  gevalideerd.
- Het PDF-rapport beschrijft exact wat de huidige engine berekent. Waar de MVP
  afwijkt van een volledige adviesberekening, staat dat als aanname of
  beperking vermeld.

## 8. Verantwoordelijkheid per laag

| Laag | Verantwoordelijkheid |
| --- | --- |
| `financial-constants` | jaarlijkse normen, bronmetadata en tabellookup |
| `mortgage/max-mortgage.ts` | pure berekenpipeline en tussenresultaten |
| `mortgage/report.ts` | uitleg, tijdlijn, tabellen en bronverwijzingen |
| app `report.ts` | PDF-layout en paginering, zonder financiële formules |
| `Calculator.tsx` | invoer, validatie, resultaatweergave en downloadactie |

Financiële formules horen uitsluitend in de domeinlaag. De React-component en
PDF-renderer presenteren de uitkomsten, maar berekenen ze niet opnieuw.
