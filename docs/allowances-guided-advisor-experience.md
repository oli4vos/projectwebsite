# Toeslagenadviseur Functioneel Ontwerp

Peildatum: 2026-07-20. Scope: functioneel ontwerp, vraagstructuur, UX-contracten en rapportmodel voor de doorontwikkeling van de bestaande Toeslagenscan naar een digitale toeslagenadviseur.

Dit document implementeert geen wettelijke berekeningen, bedragen, bronwaarden, routes, manifests of PDF-rendering. De bestaande Toeslagenscan blijft signal-only totdat de financiële domeinlogica, brondata en regressietests voor bedragen volledig centraal zijn uitgewerkt.

## Uitgangspunten

- De adviseur begeleidt gebruikers stap voor stap naar een begrijpelijke indicatie.
- De site legt moeilijke begrippen zelf uit; officiële bronnen blijven onderaan beschikbaar voor controle.
- "Weet ik niet" is een normale route en eindigt nooit zonder vervolgvraag, inference, officiële controle of duidelijke beperking.
- React en PDF renderen alleen viewmodels. Bedragen, rechtstatussen, confidence en bronmetadata komen uit centrale domein- en adapterlagen.
- PDF gebruikt hetzelfde rapportmodel als scherm en rekent niet opnieuw.
- Copy vermijdt definitieve claims zoals "je hebt recht op" en gebruikt indicatieve taal.

## Gebruikersflow

1. Start met berekeningsjaar en basiscontext.
2. Vraag leeftijd, woonland/verzekering en huishouden.
3. Open partner-, kind-, huur-, inkomen-, vermogen- en opvangdetails alleen wanneer relevant.
4. Toon bij iedere "Weet ik niet" direct een gerichte vervolgvraag of waar-vind-ik-dit-route.
5. Laat gebruikers teruggaan en antwoorden aanpassen zonder verborgen waarden te verliezen.
6. Toon per toeslag een resultaatkaart met status, redenen, beslissende invoer, inferred invoer, ontbrekende invoer, waarschuwingen en officiële bronverwijzingen.
7. Toon euro-indicatie pas wanneer officiële bedraglogica centraal beschikbaar is en de invoer voldoende betrouwbaar is.
8. Sluit af met aanvraag- of wijzigstappen en één primaire CTA naar Mijn Toeslagen.

## Vraagmatrix

| Stap | Doel | Velden | Progressive disclosure |
|---|---|---|---|
| Berekeningsjaar | Bronset en periode bepalen | jaar | Standaard huidig ondersteund jaar tonen; ander jaar pas bij bewuste keuze. |
| Leeftijd | Leeftijdsvoorwaarden bepalen | leeftijd, leeftijden kinderen | Kind-leeftijden pas tonen bij kinderen of bestaande kindinformatie. |
| Woonland en verzekering | Zorgtoeslagcontext bepalen | Nederlandse zorgverzekering, woon-/verblijfssituatie | Buitenland/verblijf alleen bij twijfel of bijzondere situatie. |
| Huishouden | Meetellende personen bepalen | partner, medebewoners, kinderen | Details pas tonen wanneer route relevant is. |
| Toeslagpartner | Gezamenlijke gegevens bepalen | partnerstatus, gezamenlijk inkomen/vermogen, partneractiviteit | Gezamenlijke velden pas bij partner of partneronzekerheid. |
| Kinderen | Kindgebonden budget en opvangroute bepalen | kinderen, leeftijden, kinderbijslag, woonadres kind | Kinderbijslag en verblijf pas bij kinderen. |
| Woning en huur | Huurtoeslag beoordeelbaar maken | woonsituatie, zelfstandige woning, kale huur, medebewoners | Huurdetails alleen bij huurwoning; medebewonersgegevens alleen bij medebewoners. |
| Inkomen | Toetsingsinkomen bepalen | eigen, gezamenlijk en huishoudinkomen | Gezamenlijk/huishouden pas wanneer personen meetellen. |
| Vermogen | Vermogensgrenzen en waarschuwingen bepalen | eigen, gezamenlijk en huishoudvermogen | Alleen relevante vermogensscope tonen. |
| Kinderopvang | Kinderopvangtoeslag beoordeelbaar maken | opvanggebruik, LRK, eigen bijdrage, uren, activiteit | Opvangdetails alleen bij betaalde opvang en kindroute. |

De typed bron voor deze matrix staat in `src/lib/allowances/advisor-experience.ts` als `ALLOWANCE_ADVISOR_INTAKE_STEPS`.

## "Weet Ik Niet"-Resolutiematrix

| Onderwerp | Vervolgvragen | Waar vind ik dit? | Veilige inference | Blocking | Als onbekend blijft |
|---|---|---|---|---|---|
| Toeslagpartner | huwelijk/registratie, gezamenlijk kind/woning, zelfde adres, deeljaar | Mijn Toeslagen, BRP, contracten | partneractiviteit niet van toepassing bij expliciet geen partner | tot alternatief bekend | voorlopige indicatie zonder gezamenlijke bedragconclusie |
| Toetsingsinkomen | exact inkomen, jaarschatting, bandbreedte, vorig jaar | Mijn Toeslagen, aangifte, jaaropgave, loonstrook | vorig jaar alleen met bevestiging en lage betrouwbaarheid | blokkeert bedrag | signalering en stappen, geen euro-indicatie |
| Vermogen | saldo 1 januari, bandbreedte, duidelijk laag/hoog | bank, beleggingen, aangifte, Mijn Toeslagen | geen automatische inference uit maandinkomen | blokkeert bedrag | waarschuwing en geen betrouwbare euro-indicatie |
| Woningtype | huur, koop, inwonend/anders | huurcontract, koopakte | koopwoning mag huurroute overslaan na keuze | tot alternatief bekend | huurtoeslag nog niet te bepalen |
| Zelfstandige woonruimte | eigen voordeur, eigen keuken/toilet, gedeelde voorzieningen | huurcontract, verhuurder | alleen bij bevestigde eigen voorzieningen | blokkeert huurtoeslagresultaat | bijzondere situatie met officiële controle |
| Kale huur | kale huur, totale huur plus uitsplitsing, contract checken | huurcontract, huurbrief, verhuurder | niet afleiden uit totaalhuur zonder uitsplitsing | blokkeert bedrag | geen huurtoeslag-euroindicatie |
| Servicekosten/rekenhuur | subsidiabele servicekosten, geen servicekosten, alleen totaalhuur | contract, servicekostenspecificatie | geen servicekosten alleen na bevestiging | blokkeert bedrag | geen of brede indicatie zodra regels bestaan |
| Medebewoners | andere volwassenen, type medebewoner, inkomen, vermogen | BRP, Mijn Toeslagen, medebewoners | geen medebewoners alleen na bevestiging | blokkeert bedrag | huurtoeslag nog niet te bepalen |
| Opvangregistratie | LRK-nummer, contract/factuur, gastouderbureau | contract, factuur, LRK | niet infereren zonder LRK | blokkeert resultaat | bijzondere situatie |
| Opvanguren | contracturen, factuururen, gemiddelde, variabel | contract, factuur, ouderportaal | gemiddelde alleen met bevestiging | blokkeert bedrag | geen kinderopvang-euroindicatie |
| Uurtarief | uurtarief, maandbedrag plus uren, opvangsoort | factuur, contract, ouderportaal | maandbedrag/uren alleen met bevestiging | blokkeert bedrag | geen kinderopvang-euroindicatie |

De typed bron staat in `ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX`.

## Resultaatmatrix

| Status | Betekenis | Bedrag | Verplichte presentatie |
|---|---|---|---|
| Waarschijnlijk mogelijk recht met euro-indicatie | Harde voorwaarden sluiten niet uit en bedraglogica is voldoende gemodelleerd | maandbedrag, jaarbedrag en bandbreedte | redenen, beslissende invoer, inferred invoer, waarschuwingen, bronnen, betrouwbaarheidslabel |
| Waarschijnlijk niet van toepassing | Harde voorwaarden wijzen duidelijk tegen relevantie | geen bedrag, eventueel nul alleen vanuit centrale engine | redenen, beslissende invoer, waarschuwingen, bronnen, betrouwbaarheidslabel |
| Nog niet te bepalen | Essentiële gegevens ontbreken | geen bedrag | ontbrekende gegevens, waarom nodig, vervolgstappen, bronnen |
| Bijzondere situatie | Uitzondering of officiële controle nodig | geen bedrag tenzij engine expliciet bandbreedte toestaat | redenen, ontbrekende/complexe gegevens, waarschuwingen, officiële controle |

Betrouwbaarheid gebruikt labels, geen ongefundeerde percentages:

- sterke indicatie;
- redelijke indicatie;
- voorlopige indicatie.

## Uitlegpatroon

Iedere moeilijke term krijgt hetzelfde patroon:

1. Korte inline uitleg bij de vraag.
2. Uitklapbare uitleg met definitie, wat meetelt, wat niet meetelt en uitzonderingen.
3. Concreet voorbeeld zonder bedragen wanneer bedraglogica nog niet beschikbaar is.
4. "Waar vind ik dit?" met praktische vindplaatsen.
5. Officiële bron onderaan de uitleg.

Voorbeelden van begrippen: toeslagpartner, toetsingsinkomen, vermogen op 1 januari, zelfstandige woonruimte, kale huur, subsidiabele servicekosten, medebewoner, LRK-registratie, opvanguren en uurtarief.

## Aanvraagbegeleiding

Per toeslag toont de adviseur:

- wat de gebruiker moet controleren;
- welke gegevens of documenten nodig zijn;
- of zelf aanvragen of wijzigen meestal nodig is;
- stappenplan voor Mijn Toeslagen;
- waarschuwingen bij veranderingen;
- één primaire CTA: `Open Mijn Toeslagen`.

Wijzigingswaarschuwingen:

- inkomen;
- partner of huishouden;
- huur of verhuizing;
- vermogen op 1 januari;
- kinderen of woonadres kind;
- opvanguren, uurtarief, LRK of activiteit.

De typed bron staat in `ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE`.

## Reporting/PDF-Contract

Het centrale rapportmodel bevat:

- titel en berekeningsdatum;
- berekeningsjaar;
- samenvatting;
- resultaat per toeslag;
- maand- en jaarbedragen wanneer centraal beschikbaar;
- status, betrouwbaarheidslabel en redenen;
- ingevulde gegevens;
- inferred gegevens met bevestigingsstatus;
- ontbrekende gegevens;
- waarschuwingen;
- aanvraagstappen;
- officiële bronnen;
- disclaimer.

PDF en React gebruiken dit rapportmodel. De PDF-laag mag pagineren en layouten, maar niet rekenen, geen bronjaar kiezen en geen bedragen afleiden.

Typed contract: `AllowanceAdvisorReportModel`.

## Accessibility En Mobiel

- Gebruik één logische tabvolgorde door stappen en velden.
- Gebruik semantische voortgang met `progressbar` of stappennavigatie.
- Toon status altijd met tekst, niet alleen kleur.
- Koppel foutmeldingen via `aria-describedby`.
- Gebruik fieldsets/legends voor ja/nee/onbekend-groepen en samengestelde keuzes.
- Houd touch targets minimaal 44px hoog.
- Houd mobiele statuskaarten compact: status, volgende stap en maximaal twee belangrijkste ontbrekende gegevens.
- Behoud antwoorden bij dependencywijzigingen; verborgen stale values mogen niet doorwerken zonder zichtbare herbevestiging.
- Teruggaan en aanpassen mag geen resultaten of PDF-data stil inconsistent maken.

## Acceptance Criteria

- De intake bevat alle stappen uit de vraagmatrix.
- Iedere "Weet ik niet"-route heeft minimaal een vervolgvraag, vindplaats en unresolved outcome.
- Technische reason codes verschijnen nooit als gebruikerscopy.
- Euro-indicatie verschijnt alleen wanneer centrale bedragengine, brondata en regressietests beschikbaar zijn.
- Resultaatkaarten tonen status, redenen, beslissende invoer, inferred invoer, ontbrekende invoer, waarschuwingen, bronnen en betrouwbaarheidslabel.
- Aanvraagbegeleiding verwijst alleen voor aanvraag of wijziging naar Mijn Toeslagen.
- PDF gebruikt `AllowanceAdvisorReportModel` of opvolgend compatible viewmodel en rekent niet opnieuw.
- Browserflow behoudt antwoorden bij dependencywijzigingen en voorkomt dode routes.
- Mobiele layout heeft geen horizontale overflow en behoudt begrijpelijke statuscompactheid.

## Niet Geïmplementeerd In Deze Fase

- Officiële bedragberekeningen.
- Nieuwe bronwaarden.
- Nieuwe routes of manifests.
- Volledige PDF-rendering.
- Wijzigingen aan `evaluateAllowanceSignals`, `evaluateAllowanceRegulations`, Unknown Resolution of Question Flow-semantiek.
