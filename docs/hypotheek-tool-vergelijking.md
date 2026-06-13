# Hypotheek tool vergelijking

Bronnen voor externe referentiegedrag:
- Independer maximale hypotheek: https://www.independer.nl/hypotheek/info/maximale-hypotheek-berekenen
- Independer maandlasten: https://www.independer.nl/hypotheek/info/maandlasten
- Independer studieschuld: https://www.independer.nl/hypotheek/info/afsluiten/lening-schulden/studieschuld
- Rabobank maximale hypotheek: https://www.rabobank.nl/particulieren/hypotheek/hypotheek-berekenen
- ABN AMRO maximale hypotheek: https://www.abnamro.nl/nl/prive/hypotheken/maximale-hypotheek-berekenen.html

## 1. Referentieverschillen

Independer presenteert vooral een combinatie van maximale hypotheek en bruto/netto maandlasten. De pagina's benadrukken ook een grove vuistregel van ongeveer 4,5 keer bruto jaarinkomen. Onze engine is strikter en geeft nu expliciet tussenstappen terug:

- maximale hypotheek op inkomen;
- maximale hypotheek op collateral/woningwaarde;
- einduitkomst als minimum van die grenzen;
- maximaal koopbudget met eigen geld en kosten koper apart;
- maandelijkse verplichtingen en DUO-impact als afzonderlijke lasten;
- een korte rentevaste periode kan een hogere toetsrente activeren.

Eigen geld vergroot het koopbudget en verkleint de financieringsgap, maar hoort niet in de pure inkomenscapaciteit thuis.

## 2. Testsets en uitkomsten

### Baseline

Input:
- bruto huishoudinkomen: `80.000`
- rente: `4,5%`
- looptijd: `30 jaar`
- koopprijs / marktwaarde: `350.000`
- eigen geld: `30.000`

Uitkomst:
- maximale hypotheek op inkomen: `315.777,85`
- maximale hypotheek op woningwaarde: `350.000`
- einduitkomst: `315.777,85`
- maximaal koopbudget: `331.777,85`
- maandlast bruto: `1.600`
- funding gap: `18.222,15`
- limiterend: `inkomen`

Interpretatie:
- Een simpele `4,5x`-vuistregel zou `360.000` opleveren.
- Onze engine komt daaronder uit, omdat de budgetbenadering via maandlasten en bijkomende aankoopkosten zwaarder weegt.

### Partnerinkomen

Input:
- bruto huishoudinkomen: `70.000`
- partnerinkomen: `35.000`
- rente: `4,1%`
- looptijd: `30 jaar`

Uitkomst:
- huishoudinkomen voor toetsing: `105.000`
- maximale hypotheek: `434.604,11`

Interpretatie:
- Meer gezamenlijk inkomen verhoogt de leencapaciteit duidelijk.
- Dit volgt hetzelfde algemene bankgedrag als de externe calculators, maar blijft expliciet lastengedreven.

### Maandelijkse lasten

Input:
- bruto huishoudinkomen: `80.000`
- rente: `4,5%`
- maandelijkse schuldverplichtingen: `250`
- koopprijs / marktwaarde: `350.000`
- eigen geld: `30.000`

Uitkomst:
- maximale hypotheek: `266.437,56`
- maandlast-capaciteit: `1.350`
- funding gap: `67.562,44`

Interpretatie:
- Dit maakt het verschil met maandlasten-only tools zichtbaar.
- Een maandelijkse verplichting drukt de hypotheekruimte direct.

### Studieschuld

Input:
- bruto huishoudinkomen: `65.000`
- rente: `4,1%`
- looptijd: `30 jaar`
- DUO: repaying
- actuele maandbetaling: `165`

Uitkomst:
- bruto maandbudget vóór lasten: `1.300`
- DUO-impact na gross-up: `206,25`
- bruto maandbudget na lasten: `1.093,75`
- maximale hypotheek: `226.356,31`

Interpretatie:
- Dit sluit aan op de online uitleg dat studieschuld meeweegt en de maximale hypotheek verlaagt.
- De engine gebruikt de actuele maandbetaling als input voor de lastenimpact.

### Korte rentevaste periode

Input:
- bruto huishoudinkomen: `75.000`
- rente: `3,5%`
- rentevaste periode: `60 maanden`
- AFM toetsrente: `5%`

Uitkomst:
- toetsrente gebruikt: `5%`
- maximale hypotheek: `334.042,48`

Interpretatie:
- Een korte rentevaste periode activeert de stressrente.
- Dat maakt de uitkomst conservatiever dan een simpele vaste-rente benadering.

### Looptijdvergelijking

Input:
- hoofdsom: `300.000`
- rente: `4,1%`

Uitkomst:
- 30 jaar annuïteit: `1.449,60`
- 15 jaar annuïteit: `2.234,13`

Interpretatie:
- Kortere looptijd verhoogt de maandlasten substantieel.
- Dat is consistent met hypotheekcalculators die maandlasten en looptijd expliciet laten meebewegen.

## 3. Samenvattende conclusies

- Onze inschatting van maximale leenruimte ligt niet gelijk aan een simpele inkomensvuistregel.
- Vergeleken met publieke calculators blijft het gedrag realistischer doordat lasten, schuldverplichtingen en toetsrente apart meetellen.
- Eigen geld beïnvloedt de aankoophaalbaarheid, niet de hypotheekcapaciteit zelf.
- Studieschuld verlaagt de ruimte merkbaar en blijft een aparte factor.

## 4. Testverwijzing

Deze vergelijking is onderbouwd met:
- `src/lib/mortgage/calculations.test.ts`
- `src/lib/mortgage/max-mortgage.test.ts`
