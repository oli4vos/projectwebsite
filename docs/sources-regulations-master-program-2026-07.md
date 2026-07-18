# Bronnenonderzoek masterprogramma hypotheek, DUO, toeslagen en bronbeheer

Peildatum: 2026-07-18. Scope: brononderzoek, definities, geldigheidsdata en implementatiespecificatie. Geen featurebouw, geen manifestwijziging, geen formulewijziging.

## 1. Repositorystatus

- Branch: `main`.
- Laatste commit voor dit werk: `e673863 fix(pdf): announce mortgage report status`.
- Werkboom voor dit werk: alleen `ideetjes.txt` was gewijzigd.
- Bewaarde gebruikerswijzigingen: `ideetjes.txt` is niet gelezen als bron voor edits, niet aangepast en niet meegenomen.

## 2. Bestaande bronarchitectuur

### Relevante centrale modules

| Module | Rol | Bevinding |
|---|---|---|
| `src/lib/financial-constants/types.ts` | Centrale metadata- en constants-types | `AssumptionMeta` bevat al `sourceLabel`, `lastChecked`, `status`, `sourceUrl`, `sourceTier`, `publishedAt`, `validFrom`, `validUntil`, `appliesTo`, `unit`, `ruleType`, `uncertainties`. |
| `src/lib/financial-constants/years.ts` | Jaarafhankelijke DUO-, hypotheek-, box 1-, box 3- en chartconstants | 2026 bevat DUO-rente, draagkrachtregels, DUO-leengrens, bruteringsstaffel, NHG, LTV, energiebedragen, AFM Q3 2026 en fiscale indicaties. |
| `src/lib/financial-constants/duo-rate-history.ts` | DUO-rentehistorie en rentejaarmetadata | Laatste vijf rentejaren staan centraal, inclusief `DUO_RATE_YEAR_METADATA_BY_YEAR`. |
| `src/lib/financial-constants/mortgage-financing-load-data.ts` | Gegenereerde financieringslasttabel | Normjaar 2026 uit Staatscourant; niet handmatig bewerken. |
| `src/lib/mortgage/max-mortgage.ts` | Centrale hypotheekengine | Gebruikt financieringslasttabel, NHG, LTV, energie en AFM-toetsrente uit `financial-constants`. |
| `src/lib/duo/calculations.ts` | Centrale DUO-engine | Berekent wettelijke maandtermijn, draagkrachtindicatie, relevante DUO-betaling, extra aflossing en leningdelen. |
| `src/lib/tax/box1.ts`, `src/lib/tax/box3.ts` | Fiscale indicaties | Gebruiken centrale constants; niet geschikt als volledige toeslagenengine. |
| `src/lib/knowledge-sources.ts` | Kennisbankbronnen | Bevat primaire en aanvullende bronnen, maar is tekstueel/kennisbankgericht en geen volledige datawarehouse-laag. |

### Bestaande metadata

De repo heeft al een basis voor bronmetadata. Voor het masterprogramma moet die basis worden uitgebreid, niet vervangen. De bestaande `AssumptionMeta` is geschikt als kern, maar mist nog een generiek dataset-record met reviewbeleid en checksum.

Aanbevolen extra dataset-envelope bovenop bestaande constants:

```ts
type SourceDatasetMeta = {
  id: string;
  title: string;
  year?: number;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  publishedAt?: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  nextReviewAt: string;
  sourceName: string;
  sourceUrl: string;
  sourceType:
    | "wet"
    | "officiele-uitvoering"
    | "normpublicatie"
    | "aanbiedertarief"
    | "marktpraktijk"
    | "projectaanname";
  methodology: string;
  notes?: string;
  supersedes?: string;
  checksum?: string;
  status: "definitief" | "voorlopig" | "indicatief" | "te-verifieren";
};
```

### Gevonden duplicatie en hardcoded waarden

| Bevinding | Status | Overdracht |
|---|---|---|
| NHG, LTV, energiebedragen en AFM Q3 2026 zijn inmiddels in `financial-constants` gecentraliseerd. | Reeds gerealiseerd | Geen tweede bronlaag bouwen. |
| DUO-draagkrachtvrije voeten staan in `years.ts`, maar missen exacte bronmetadata per bedrag. | Open | Financial Domain Guardian moet bronmetadata per regeling en jaar toevoegen. |
| `DEFAULT_BUYER_COST_RATE = 0.04` en `DEFAULT_CREDIT_LIMIT_FACTOR = 0.01` staan in `src/lib/mortgage/max-mortgage.ts`. | Hardcoded project-/marktpraktijk | Markeer als projectaanname of verplaats naar constants als ze publiek zichtbaar worden. |
| Box 1/box 3 waarden staan centraal, maar box 3 is voorlopig en niet volledig toeslagspecifiek. | Centraal, beperkt | Toeslagenscan moet eigen signaleringsregels krijgen; geen toeslagbedragenengine afleiden uit box 3. |
| Banktarieven bestaan nog niet centraal. | Nieuw nodig | Alleen handmatig beheerde dataset, geen scraper/API-verplichting. |

### Actieve tools en datasets

| Actieve publieke tool | Gebruikte datasets |
|---|---|
| `artifact-hypotheek-wonen-maximale-hypotheek` | Hypotheeknormen, financieringslast, NHG, LTV, energie, AFM, DUO-toetslast. |
| `hypotheek-impact-studieschuld` | DUO-rente, DUO-maandbedrag, draagkrachtindicatie, hypotheekbrutering/projectaanname. |
| `familiehulp-eerste-woning` | DUO, hypotheek, cashflow/familiehulp; geen toeslagen. |
| `duo-maandbedrag`, `duo-extra-aflossen`, `duo-leenbedrag-impact`, `duo-schuld-bij-starten-lenen`, `duo-stoppen-kosten-prestatiebeurs` | DUO-rente, DUO-termijnen, draagkracht, leengrens, prestatiebeurscontext. |
| `schulden-volgorde` | Cashflow/schuldprioriteit, DUO/hypotheek als indicatieve context. |

## 3. Hypotheekrente

### Referentiescenario

Primair scenario voor een latere referentierente:

- annuiteitenhypotheek;
- 10 jaar rentevast;
- zonder NHG;
- LTV/risicoklasse tot en met 100% marktwaarde;
- zonder tijdelijke actie;
- zonder huisbank-/betaalpakketkorting;
- zonder duurzaamheidskorting of energielabelkorting;
- zonder andere persoonlijke korting.

### ABN AMRO

| Veld | Bevinding |
|---|---|
| Primaire URL | [ABN AMRO actuele hypotheekrente](https://www.abnamro.nl/nl/prive/hypotheken/actuele-hypotheekrente/index.html) |
| Tariefnaam | Publieke HTML vermeldt hypotheekrente en kortingen, maar toont in de tekstextractie geen stabiele tariefcel voor exact scenario. |
| Rentepercentage | Niet veilig primair vastgesteld. |
| Kortingen | Huisbankkorting 0,20%; sinds 1 april 2026 is het energielabel verwerkt in de aangeboden rente in plaats van de oude duurzaamheidskorting. Bronnen: [actuele hypotheekrente](https://www.abnamro.nl/nl/prive/hypotheken/actuele-hypotheekrente/index.html), [duurzaamheidskorting](https://www.abnamro.nl/nl/prive/hypotheken/duurzaam-wonen/duurzaamheidskorting.html). |
| Interpretatieprobleem | Zonder exacte tariefklasse en energielabelniveau kan geen kortingvrije 100% MW-referentie worden afgeleid. |
| Secundaire observatie | Secundaire sites tonen waarden rond 3,79% voor 10 jaar, maar inclusief kortingen of onbekende aannames; niet als primaire bron gebruiken. |

### ING

| Veld | Bevinding |
|---|---|
| Primaire URL | [ING actuele hypotheekrente](https://www.ing.nl/particulier/hypotheek/actuele-hypotheekrente) |
| Tariefnaam | Publieke HTML is grotendeels dynamisch; exacte kortingvrije 10-jaars 100% MW-tariefcel niet stabiel primair vastgesteld. |
| Rentepercentage | Niet veilig primair vastgesteld. |
| Kortingen | Actieve Betaalrekening Korting, schuld-marktwaardeverhouding en energielabel zijn expliciete variabelen. Bronnen: [hypotheekrente korting](https://www.ing.nl/particulier/hypotheek/actuele-hypotheekrente/hypotheekrente-korting), [opbouw vaste hypotheekrente](https://www.ing.nl/particulier/hypotheek/actuele-hypotheekrente/opbouw-vaste-hypotheekrente). |
| Interpretatieprobleem | ING publiceert ook calculatorvoorbeelden met 10 jaar vast, NHG en energielabel A, maar dat is niet het gevraagde scenario. |
| Secundaire observatie | Secundaire sites tonen 10 jaar rond 3,76% inclusief duurzaamheidskorting; niet bruikbaar als primaire kortingvrije waarde. |

### Rabobank

| Veld | Bevinding |
|---|---|
| Primaire URL | [Rabobank actuele hypotheekrentes](https://www.rabobank.nl/particulieren/hypotheek/hypotheekrente) |
| Tariefnaam | Rabobank hypotheekrente, tariefklassen per rentevaste periode; Basis- en Plusvoorwaarden bestaan naast elkaar. |
| Rentepercentage | De publieke zoekextractie toont voor 10 jaar vier waarden: 3,83%, 4,23%, 4,33%, 4,38%. Voor 100% marktwaarde lijkt de hoogste tariefklasse relevant, maar Basis/Plus en kortingsstatus moeten handmatig worden bevestigd. |
| Kortingen | Betaalpakketkorting 0,20% en duurzaamheidskorting mogelijk 0,15%. Bron: [Rabobank hypotheekrente](https://www.rabobank.nl/particulieren/hypotheek/hypotheekrente). |
| Interpretatieprobleem | De exacte kolomlabels zijn in de crawl niet stabiel genoeg om automatisch vast te leggen. Gebruik alleen handmatige controle van de zichtbare tabel. |

### Vergelijkbaarheid

Er zijn op 2026-07-18 geen drie veilig vergelijkbare primaire waarden vastgesteld. Een productiegemiddelde mag daarom nog niet worden berekend. Rabobank levert een deels herleidbare primaire waarde, maar ABN AMRO en ING vereisen handmatige controle in de zichtbare tarieftabel.

### Gemiddeldemethode

Als later drie vergelijkbare waarden zijn vastgesteld:

- gebruik alleen exacte, primaire banktarieven uit hetzelfde scenario;
- bereken een simpel rekenkundig gemiddelde;
- rond de getoonde referentie af op twee decimalen procentpunt;
- bewaar onderliggende waarden ongerond of op minimaal twee decimalen zoals gepubliceerd;
- toon bronlabel en peildatum naast het invoerveld;
- markeer dataset als verouderd na 7 kalenderdagen of direct bij bekende bankwijziging;
- als een banktarief ontbreekt: toon geen gemiddelde, maar een waarschuwing "referentie onvolledig".

Een afzonderlijke NHG-referentie is zinvol omdat NHG-rentes vaak lager zijn en banken andere tariefklassen tonen. Die dataset moet apart worden beheerd en niet met de 100% MW-zonder-NHG referentie worden gemengd.

## 4. Hypotheeknormen

| Regel | Bron | Geldigheid | Harde validatie | Waarschuwing |
|---|---|---|---|---|
| Financieringslastpercentages | [Staatscourant 2025, 36471](https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html), [Volkshuisvesting LTI](https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-inkomen) | 2026 | Normjaar, rentekolom, inkomensrij, AOW-tabel | Aanbieders kunnen maatwerk of aanvullende acceptatie toepassen. |
| AFM-toetsrente | [AFM hypothecair krediet](https://www.afm.nl/nl-nl/sector/themas/dienstverlening-aan-consumenten/financiele-producten/hypothecair-krediet), [Q3 2026 publicatie](https://www.afm.nl/nl-nl/sector/actueel/2026/jun/sb-toetstrente-q3-2026) | 2026-Q3, 01-07 t/m 30-09 | Rentevast korter dan 10 jaar gebruikt max(werkelijke rente, AFM-toetsrente) | Bij kwartaalovergang controleren. |
| Rentevast korter dan 10 jaar | AFM/Trhk | Doorlopend | `< 120 maanden` als hard technisch criterium | Offerte-/aanvraagdatum bepaalt geldende kwartaalwaarde. |
| LTV | [Volkshuisvesting LTV](https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-woningwaarde-ltv) | 2026, basisregel sinds 2018 | 100% basis-LTV; 106% bij energiebesparende voorzieningen | Uitzonderingen zoals restschuld/oversluiten niet in MVP hard afwijzen zonder aparte route. |
| Energielabel extra leenruimte | Staatscourant 2025, 36471 | 2026 | Bedragen per label in `financial-constants` | Alleen toepassen op inkomenslimiet; niet stapelen op woningwaarde. |
| Verduurzamingsruimte | Staatscourant/Volkshuisvesting/NHG | 2026 | Alleen daadwerkelijke EBV/EBB-bedragen tot normmaximum | Concrete maatregelen en besteding kunnen aanbiedersspecifiek zijn. |
| NHG-grens | [NHG hypotheek met NHG](https://www.nhg.nl/het-product-nhg/een-hypotheek-met-nhg/), [Rijksoverheid NHG](https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/maximale-hypotheek-nationale-hypotheek-garantie) | 2026 | EUR 470.000 standaard, EUR 498.200 met EBV, borgtochtprovisie 0,4% | Volledige NHG-voorwaarden en normen blijven leidend. |

Testgrenzen:

- rentevast 119, 120 en 121 maanden;
- toetsrente 4,999%, 5,000%, 5,001%;
- inkomen net onder, op en boven financieringslast-rij;
- rente net onder, op en boven rentekolom;
- LTV 100%, 100,01%, 106%, 106,01%;
- NHG 470.000, 470.001, 498.200, 498.201;
- energielabel `unknown`, `D`, `A`, `A++++`, `APLUSGUARANTEE`.

## 5. Salarisverhoging

### Inhoudelijke regels

De latere berekening moet dezelfde centrale hypotheekengine gebruiken. Er komt geen losse vuistregel zoals "EUR X salaris is EUR Y hypotheek". De juiste uitleg is:

- meer bestendig toetsinkomen kan extra hypotheekruimte opleveren;
- de relatie is niet lineair door financieringslasttabellen, rentekolommen, verplichtingen, LTV, NHG en energiebedragen;
- een kleine salarisverhoging kan soms zichtbaar effect hebben als een inkomensrij of randvoorwaarde verandert;
- toekomstige salarisverhoging telt pas mee als de aanbieder die als bestendig inkomen accepteert.

Bronnen:

- [Volkshuisvesting LTI](https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-inkomen): maximale financieringslast hangt af van toetsinkomen en rente; aanbieders rekenen in beginsel met vaste en bestendige inkomsten.
- [NHG vast contract](https://www.nhg.nl/het-krijgen-van-nhg/een-hypotheek-met-vast-contract/): werkgeversverklaring of Inkomensbepaling Loondienst.
- [NHG Arbeidsmarktscan](https://www.nhg.nl/het-krijgen-van-nhg/arbeidsmarktscan/): flexwerk, huidig inkomen en verdiencapaciteit; toetsinkomen is de laagste van huidig inkomen en verdiencapaciteit.
- [ABN AMRO inkomen](https://www.abnamro.nl/nl/prive/hypotheken/hypotheek-berekenen/inkomen.html): aanbiederspecifieke praktijk rond flexibel dienstverband en inkomen.

### Gebruikerstekst

"Een hoger vast en bestendig inkomen kan je hypotheekruimte verhogen. Deze indicatie rekent met dezelfde hypotheeknormen als de maximale-hypotheektool. Een bank kan een salarisverhoging pas meenemen als die voldoende onderbouwd en bestendig is, bijvoorbeeld via werkgeversverklaring, loonstrook of een geaccepteerde inkomensbepaling."

### Disclaimer

"Gebruik dit voor salarisgesprekken en planning, niet als hypotheektoezegging. Tijdelijk inkomen, proeftijd, variabele beloning, bonus, overwerk, toeslagen en nog niet ingegane salarisverhogingen kunnen door een aanbieder geheel, gedeeltelijk of niet worden meegenomen."

### Testscenario's

- huidig inkomen 45.000 versus 47.000, zelfde rente en verplichtingen;
- inkomen net onder en net boven financieringslast-rij;
- verhoging die geen effect heeft omdat LTV/NHG limiterend is;
- twee inkomens 100% meegeteld;
- tijdelijk contract zonder intentie: waarschuwing;
- bonus/variabel inkomen: geen hard effect zonder expliciete acceptatiekeuze.

## 6. DUO-hypotheektoetslast

Te toetsen tekst:

"Hypotheekaanbieders kijken meestal naar het bedrag dat je maandelijks aan DUO betaalt. Wanneer je nog niet aflost, tijdelijk minder betaalt op basis van draagkracht of een aflosvrije periode gebruikt, kan de aanbieder rekenen met het bedrag dat je volgens de terugbetalingsregels zou moeten betalen. Vrijwillig extra aflossen of vrijwillig meer betalen moet afzonderlijk worden behandeld."

Veiliger formulering:

"Geldverstrekkers vragen naar je studieschuld en bepalen welk DUO-maandbedrag meetelt. Vaak is dat je actuele DUO-maandbedrag. Betaal je nog niet, betaal je tijdelijk minder door draagkracht, of gebruik je een aflosvrije periode, dan kan een geldverstrekker vragen naar het wettelijke maandbedrag dat bij je schuld hoort. Vrijwillig extra betalen is iets anders dan een structureel lager wettelijk maandbedrag na extra aflossing."

Bronnen:

- [Rijksoverheid studieschuld en hypotheek](https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek).
- [DUO berekening maandbedrag](https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp).
- [DUO minder of niets aflossen](https://duo.nl/particulier/minder-of-niets-aflossen/wat-is-er-mogelijk.jsp).
- [DUO aflosvrije periode](https://duo.nl/particulier/minder-of-niets-aflossen/aflosvrije-periode.jsp).
- [DUO extra betaling doen](https://www.duo.nl/particulier/eerder-of-extra-aflossen/extra-betaling-doen.jsp).

| Situatie | Aanbevolen engine-input | Bron | Onzekerheid | Gebruikerstoelichting |
|---|---|---|---|---|
| Werkelijk betaald | `actualMonthlyPayment` als primaire toetslast, plus regeling/rentejaar | Rijksoverheid + Mijn DUO | Aanbieder kan wettelijke termijn opvragen | Neem je maandbedrag over uit Mijn DUO. |
| Wettelijk verschuldigd | `statutoryMonthlyPayment` | DUO berekening maandbedrag | DUO-berekening kan door draagkracht lager uitvallen | Gebruik DUO-maandbedragcalculator als je dit niet weet. |
| Draagkrachtverlaging | Primair conservatief: wettelijke termijn; toon actuele betaling apart | Rijksoverheid/DUO | Geldverstrekkerbeleid verschilt | Bevestig dat je minder betaalt door draagkracht. |
| Aflosvrije periode | Wettelijke termijn of geschatte wettelijke termijn | DUO aflosvrije periode | Actuele incasso kan nul zijn | Nul betaling betekent niet automatisch nul toetslast. |
| Nog niet aflossen/aanloopfase | Geschatte wettelijke termijn op basis van schuld, regel, rentejaar, looptijd | DUO/Rijksoverheid | Startdatum aflosfase persoonlijk | Vraag gebruiker om Mijn DUO en waarschuwing. |
| Vrijwillig extra betalen | Niet automatisch als lagere toetslast gebruiken | DUO extra betaling | Extra betaling kan maandbedrag niet structureel verlagen | Scheid vrijwillige extra betaling van verplichte termijn. |
| Vrijwillig extra aflossen | Herberekende wettelijke termijn na lagere schuld, als DUO die verwerkt | DUO extra betaling/maandbedrag | Timing verwerking en herberekening | Alleen na bevestiging dat DUO-schuld/termijn is aangepast. |
| Meerdere leningdelen | Per deel: schuld, rentejaar, regeling; totaliseer wettelijke termijnen | DUO rentehistorie/Mijn DUO | Persoonlijke rentevaste periodes | Laat gebruiker leningdelen uit Mijn DUO overnemen. |

Regressiescenario's:

- actuele betaling 160, wettelijk 160;
- draagkracht actuele betaling 75, wettelijk 150;
- aflosvrije periode actuele betaling 0, wettelijk 120;
- aanloopfase zonder actuele betaling, schuld 30.000, SF35, rentejaar 2026;
- vrijwillig meer betalen 200 terwijl wettelijk 120;
- extra aflossing 5.000 verlaagt schuld en wettelijke termijn;
- twee leningdelen met 2024 en 2026 rentejaar.

## 7. Toeslagen

Eerste versie: signaleringsscan, geen bedragenengine. Officiele proefberekening blijft leidend: [Proefberekening toeslagen](https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen).

Algemene begrippen:

- toetsingsinkomen: [Belastingdienst toetsingsinkomen](https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/wat-is-mijn-toetsingsinkomen);
- toeslagpartner: [Belastingdienst toeslagpartner](https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/toeslagpartner);
- vermogen en peildatum: voor vermogen geldt vaak 1 januari van het kalenderjaar.

### Zorgtoeslag

| Beslispunt | 2026 regel | Invoer | Status |
|---|---|---|---|
| Leeftijd | 18 jaar of ouder; toeslag vanaf maand na 18 worden. Bron: [18 jaar](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/zorgtoeslag/voorwaarden/ik-ben-meerderjarig). | geboortedatum/leeftijd | Hard waarschijnlijk geen recht onder 18. |
| Zorgverzekering | Nederlandse zorgverzekering vereist. Bron: [voorwaarden zorgtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen). | ja/nee | Hard waarschijnlijk geen recht bij nee. |
| Inkomen | Maximaal EUR 40.857 zonder partner, EUR 51.142 met partner. Bron: [inkomensgrens zorgtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag). | toetsingsinkomen, partner | Hard waarschijnlijk geen recht boven grens. |
| Vermogen | Maximaal EUR 146.011 zonder partner, EUR 184.633 met partner op 01-01-2026. Bron: [vermogen zorgtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-vermogen-zorgtoeslag). | vermogen op 1 januari | Hard waarschijnlijk geen recht boven grens. |

Privacygevoelig: inkomen, vermogen, verzekeringstatus.

### Huurtoeslag

| Beslispunt | 2026 regel | Invoer | Status |
|---|---|---|---|
| Woonruimte | Zelfstandige woonruimte, huurovereenkomst, inschrijving BRP. Bron: [voorwaarden huurtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/huurtoeslag/voorwaarden/voorwaarden). | huurtype, contract, inschrijving | Hard waarschijnlijk geen recht bij nee. |
| Vermogen | Maximaal EUR 38.479 per bewoner; partners samen EUR 76.958 op 01-01-2026. Bron: [vermogen huurtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag). | vermogen aanvrager, partner, medebewoners | Hard waarschijnlijk geen recht boven grens. |
| Huur | Vanaf 2026 geen harde uitsluiting door te hoge huur; berekening wordt gemaximeerd op EUR 932,93, of EUR 498,20 als iedereen jonger dan 21 is. Bronnen: [huurtoeslag verandert 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026), [hoeveel huurtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/hoeveel-huurtoeslag). | kale huur, servicekosten, leeftijden | Waarschuwing/proefberekening; geen hard nee alleen door huurhoogte. |
| Inkomen | Afhankelijk van huishouden; geen simpele vaste grens. | toetsingsinkomen bewoners | Mogelijk recht/insufficient info. |

Privacygevoelig: huurcontract, adres/inschrijving, medebewoners, vermogen.

### Kindgebonden budget

| Beslispunt | 2026 regel | Invoer | Status |
|---|---|---|---|
| Kind | Bijdrage voor ouders in kosten voor kinderen tot 18 jaar. Bron: [kindgebonden budget](https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/kindgebonden-budget). | aantal kinderen, leeftijden | Hard waarschijnlijk geen recht zonder kind < 18. |
| Inkomen | Afhankelijk van gezinssamenstelling; proefberekening aanbevolen. Bron: [maximaal inkomen kgb](https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-inkomen-kindgebonden-budget). | toetsingsinkomen, partner, kinderen | Geen hard nee zonder volledige tabel; signaal. |
| Vermogen | EUR 146.011 zonder partner, EUR 184.633 met partner; vermogen minderjarig kind telt mee. Bronnen: [vermogen kgb](https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget), [voorwaarden kgb](https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/kan-ik-kindgebonden-budget-krijgen). | vermogen aanvrager, partner, minderjarig kind | Hard waarschijnlijk geen recht boven grens. |
| Nationaliteit/verblijfsrecht | Voorwaarden bevatten nationaliteit en uitzonderingen. | nationaliteit/verblijfsstatus | Buiten MVP: onvoldoende informatie of link naar proefberekening. |

Privacygevoelig: kinderen, inkomen, vermogen, verblijfsstatus.

### Kinderopvangtoeslag

| Beslispunt | 2026 regel | Invoer | Status |
|---|---|---|---|
| Eigen bijdrage | Aanvrager betaalt zelf deel opvangkosten; bewijs via bankafschriften kan gevraagd worden. Bron: [kan ik kinderopvangtoeslag krijgen](https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen). | betaalstatus/factuur | Hard waarschuwing, niet zonder bewijs automatiseren. |
| Geregistreerde opvang | Opvang moet in LRK staan; LRK-nummer nodig. Bron: [geregistreerde opvang](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/kan-ik-kinderopvangtoeslag-krijgen/geregistreerde-kinderopvang/voor-welke-opvang-kinderopvangtoeslag). | LRK-nummer ja/nee | Hard waarschijnlijk geen recht bij nee. |
| Kind woont bij aanvrager | Voorwaarde in aanvraagstappen. Bron: [aanvragen kinderopvangtoeslag](https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/hoe-moet-ik-kinderopvangtoeslag-aanvragen). | woont-kind-bij-aanvrager | Hard waarschijnlijk geen recht bij nee. |
| Werk/opleiding/traject | Werken of opleiding/inburgering/traject naar werk is voorwaarde. Bron: aanvragenpagina. | activiteit ouder(s) | Hard waarschijnlijk geen recht bij geen kwalificerende activiteit. |
| Uurtarieven | 2026 maximum: dagopvang EUR 11,23; bso EUR 9,98; gastouder EUR 8,49. Bron: [maximaal uurtarief](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang). | opvangsoort, uurtarief | Hard cap in latere bedragenengine; in scan alleen tonen. |
| Opvanguren | Maximaal 230 uur per maand. Bron: [opvanguren](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/voor-hoeveel-uur-kinderopvangtoeslag). | uren per maand | Hard cap in latere bedragenengine; waarschuwing in scan. |

Privacygevoelig: BSN/LRK niet opslaan in MVP; alleen ja/nee of lokaal ingevuld tonen. Complex buiten MVP: co-ouderschap, wisselende opvang, buitenlandse situaties, terugwerkende aanvraagtermijnen, samengestelde gezinnen.

## 8. Brondata-architectuurspecificatie

### Aanbevolen aansluiting op bestaande modules

- Houd `src/lib/financial-constants` als centrale bron voor jaardata, normen, tarieven en bronmetadata.
- Voeg geen tweede `source-data` runtime naast `financial-constants` toe.
- Voeg hooguit submodules toe, bijvoorbeeld:
  - `src/lib/financial-constants/mortgage-rates.ts`
  - `src/lib/financial-constants/allowances.ts`
  - `src/lib/financial-constants/source-dataset.ts`
- Kennisbankbronnen blijven redactionele bronsets; reken- en signaleringsdatasets horen in constants.

### Metadata

| Veld | Verplicht | Validatie | Build failure | Warning |
|---|---:|---|---|---|
| `id` | ja | slug uniek | leeg/duplicaat | n.v.t. |
| `title` | ja | niet leeg | leeg | n.v.t. |
| `year` | per jaardataset | integer 2000-2100 | ontbreekt bij jaardataset | n.v.t. |
| `version` | ja | semver of bronversie | leeg | n.v.t. |
| `effectiveFrom` | ja | ISO datum | ongeldig | n.v.t. |
| `effectiveTo` | optioneel | ISO datum na from | ongeldig | verlopen dataset actief |
| `publishedAt` | waar bekend | ISO datum | ongeldig | ontbreekt bij wet/normpublicatie |
| `retrievedAt` | ja | ISO datum | ongeldig | ouder dan freshness |
| `lastVerifiedAt` | ja | ISO datum | ongeldig | ouder dan freshness |
| `nextReviewAt` | ja | ISO datum | ongeldig/verleden bij aanbiedertarief | verleden bij jaardataset |
| `sourceName` | ja | niet leeg | leeg | n.v.t. |
| `sourceUrl` | ja | https URL | leeg/ongeldig | n.v.t. |
| `sourceType` | ja | enum | onbekend | n.v.t. |
| `methodology` | ja | niet leeg | leeg | te kort/onduidelijk |
| `notes` | optioneel | tekst | n.v.t. | n.v.t. |
| `supersedes` | optioneel | bestaande id | onbekend id | n.v.t. |
| `checksum` | optioneel | hex/base64 | ongeldig formaat | ontbreekt bij generated import |
| `status` | ja | enum | onbekend | `voorlopig`/`te-verifieren` in publieke berekening |

### Freshnessbeleid

| Brontype | Reviewtermijn | Build failure | Warning |
|---|---|---|---|
| Wettelijke jaardataset | Jaarlijks; next review uiterlijk 15 november of bij nieuwe publicatie | Actief jaar ontbreekt | `nextReviewAt` verlopen |
| Nibud/normdataset | Jaarlijks | Tabeljaar ontbreekt of mismatch | Bron ouder dan 13 maanden |
| Banktarief | Handmatig minimaal wekelijks | Minder dan 3 geldige banken voor gemiddelde | Tarief ouder dan 7 dagen |
| DUO-regel/rente | Jaarlijks rond DUO-publicatie; rentejaren persoonlijk bewaren | Actief jaar ontbreekt | Rente/bron ouder dan 13 maanden |
| Toeslagregel | Jaarlijks voor nieuw toeslagjaar | Actief jaar ontbreekt bij scan | Status voorlopig of proefberekening vereist |

### SourceReference-specificatie

Te bouwen later, niet nu:

```ts
type SourceReferenceProps = {
  label: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceDatasetMeta["sourceType"];
  retrievedAt: string;
  lastVerifiedAt: string;
  validFrom?: string;
  validUntil?: string;
  year?: number;
  methodology?: string;
  stale?: boolean;
  staleReason?: string;
};
```

UX:

- compact label naast veld/resultaat;
- tooltip of disclosure met bronnaam, peildatum, geldigheidsjaar, methode en link;
- duidelijke badge: officiele bron, banktarief, projectaanname, voorlopig;
- waarschuwing bij verouderde data;
- in PDF dezelfde broninformatie als op scherm.

## 9. Implementatiepakket per volgende agent

### Update AGENTS.md repo guardrails

- Leg vast dat `financial-constants` de brondata-SSOT blijft.
- Voeg verbod toe op ad-hoc banktarieven of toeslaggrenzen in React.
- Definieer build-fail versus warningbeleid voor datasetfreshness.
- Leg vast dat banktarieven handmatig beheerde aanbiedersdata zijn, geen wet/norm.
- Voeg voorstel toe voor `/docs/source-data-overview.md`.

### Controleer rekenlogica

- Normaliseer banktariefschema zonder gemiddelde te berekenen zolang ABN/ING/Rabo niet vergelijkbaar zijn.
- Controleer `DEFAULT_BUYER_COST_RATE` en `DEFAULT_CREDIT_LIMIT_FACTOR` als projectaannames.
- Voeg DUO-draagkrachtbronmetadata per bedrag toe.
- Toeslagenscan blijft signalering; geen bedragenengine.

### Add feature integrator guide

Gebruikersteksten:

- Hypotheekrente: "Indicatieve referentie op basis van handmatig gecontroleerde banktarieven. Niet gebruiken als offerte."
- DUO: "Weet je je wettelijke DUO-maandbedrag niet? Bereken het eerst in de DUO-maandbedragtool en controleer Mijn DUO."
- Salaris: "Een hoger bestendig inkomen kan ruimte geven, maar een aanbieder bepaalt of het inkomen meetelt."
- Toeslagen: "Mogelijk recht", "Waarschijnlijk geen recht", "Onvoldoende informatie", "Maak officiele proefberekening".

### Update form- en PDF-regels

- Progressive disclosure voor banktarief: toon bron en peildatum naast renteveld.
- Slidergrenzen: fysieke UI-grens mag praktisch zijn; wettelijke grens moet apart gevalideerd of gewaarschuwd worden.
- Toeslagen: vraag alleen minimale signaleringsvelden; geen BSN/LRK opslaan.
- PDF: toon bronset, peildatum, geldigheidsjaar en projectaanname-badges.

### Update DevOps- en securitychecks

- Geen scraping/API-integratie voor banktarieven in MVP.
- Banktarieven handmatig in repo of static dataset; CI controleert freshness.
- Toeslageninput blijft local-first; geen persoonlijke data naar externe diensten.
- Geen secrets of serverruntime nodig.

## 10. Niet veilig implementeerbare punten

- Productiegemiddelde hypotheekrente: niet veilig zonder drie primaire, vergelijkbare tarieven.
- Volledige toeslagbedragenengine: buiten MVP door complexe tabellen en uitzonderingen.
- DUO-draagkrachtbedragen als volledig juridisch herleidbaar: bronmetadata per bedrag ontbreekt nog.
- Salarisverhoging als gegarandeerde hypotheekruimte: aanbiedersafhankelijk.
- Banktarieven automatisch vernieuwen: buiten scope en niet als productvereiste gebruiken.

## 11. Testspecificatie

### Unit

- `SourceDatasetMeta` validatie: required fields, datums, enum, URL, freshness.
- Banktarief: drie vergelijkbare tarieven vereist voor gemiddelde; ontbrekende bank blokkeert gemiddelde.
- Toeslagenscan: harde "waarschijnlijk geen recht" bij leeftijd/vermogen/verzekering/LRK/zelfstandige woning.
- DUO-toetslastsituaties zoals in sectie 6.

### Integratie

- Maximale-hypotheektool gebruikt dezelfde rente/normmetadata in scherm en PDF.
- DUO-doorverwijzing gebruikt route naar `duo-maandbedrag` zonder nieuwe berekening.
- Toeslagenscan toont officiële proefberekeninglinks.

### End-to-end

- Bronreferentie zichtbaar naast renteveld.
- Verouderde banktariefdataset toont waarschuwing en geen gemiddelde.
- Toeslagenscan geeft vier statussen correct terug.

### Freshness

- Banktarief ouder dan 7 dagen: warning of blokkeer gemiddelde.
- Jaarlijkse wettelijke dataset verlopen: warning na `nextReviewAt`, build failure als actief jaar ontbreekt.
- Toeslagjaar ontbreekt: scan voor dat jaar niet activeren.

### Grensgevallen

- Inkomen precies op toeslaggrens en 1 euro erboven.
- Vermogen precies op peildatumgrens en 1 euro erboven.
- Huur boven EUR 932,93 in 2026: niet hard afwijzen, wel max-huurtoelichting.
- Kinderopvang 230 en 231 uur.
- LTV 100/106 en net erboven.

## 12. Git

- Gewijzigde documenten: `docs/sources-regulations-master-program-2026-07.md`.
- Commit: `docs(sources): research mortgage duo and allowance program`.
- Commit-hash: zie oplevering of `git log -1 --oneline`.
- Gepusht: zie oplevering.
- Branch: `main`.

## 13. Aanbevolen volgende agent

Exacte chatnaam: `Update AGENTS.md repo guardrails`.

Doel:

- centrale versieerbare brondata-architectuur ontwerpen op basis van deze overdracht;
- aansluiten op bestaande `financial-constants`;
- nog geen gebruikersfeatures bouwen.

Binnen scope:

- AGENTS.md guardrails voor brondata-SSOT;
- voorstel voor `docs/source-data-overview.md`;
- build-fail/warningregels;
- reviewregels voor banktarieven, wettelijke datasets, DUO en toeslagen.

Buiten scope:

- geen nieuwe calculator;
- geen banktariefdata implementeren;
- geen toeslagenscan bouwen;
- geen rekenformules wijzigen.

Benodigde overdrachtsinformatie:

- dit document;
- `docs/sources-regulations-active-tools-2026-07-18.md`;
- `src/lib/financial-constants/types.ts`;
- `src/lib/financial-constants/years.ts`;
- `src/lib/financial-constants/duo-rate-history.ts`.

## 14. Samenvatting voor de centrale projectchat

Sources & Regulations heeft het masterprogramma "Hypotheek, DUO, toeslagen en centraal bronbeheer" onderzocht. De repo heeft al een centrale brondata-basis in `src/lib/financial-constants`; bouw daar op voort en maak geen tweede bronarchitectuur. NHG, LTV, energiebedragen, AFM Q3 2026, DUO-rente en rentejaarmetadata zijn al deels gecentraliseerd. Open punten zijn vooral banktarieven, DUO-draagkrachtbronmetadata per bedrag, toeslagenscanregels en freshnessbeleid.

Een gemiddelde 10-jaars hypotheekrente van ABN AMRO, ING en Rabobank is nog niet veilig productierijp: Rabobank exposeert deels vergelijkbare tarieven, maar ABN AMRO en ING tonen exacte kortingvrije scenario's niet stabiel in publiek HTML en energielabel-/betaalrekeningkortingen maken vergelijking lastig. Gebruik geen gemiddelde totdat drie primaire, handmatig gecontroleerde en vergelijkbare waarden beschikbaar zijn.

Voor salarisverhoging geldt: gebruik later dezelfde centrale hypotheekengine; geen vuistregel. Tekst moet spreken over bestendig toetsinkomen en aanbiedersafhankelijkheid. Voor DUO-toetslast is de veilige formulering dat de geldverstrekker vaak naar actuele DUO-betaling kijkt, maar bij aanloopfase, draagkrachtverlaging of aflosvrije periode het wettelijke maandbedrag kan vragen. Vrijwillig extra betalen en structurele extra aflossing moeten apart worden behandeld.

Voor toeslagen is de eerste versie alleen een signaleringsscan. Zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag hebben harde uitsluitingssignalen voor o.a. leeftijd, verzekering, vermogen, zelfstandige woonruimte, LRK-registratie of kinderen < 18, maar volledige bedragenberekening blijft buiten MVP. Toon altijd de officiële Belastingdienst-proefberekening.

Aanbevolen volgende agent: `Update AGENTS.md repo guardrails`, met als doel brondata-SSOT, metadata, freshness, build-fail/warningregels en `docs/source-data-overview.md` vastleggen. Geen featurebouw.
