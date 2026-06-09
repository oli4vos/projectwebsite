Sparen & Beleggen — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: sparen-beleggen
Aantal tools in dit invulblad: 29

Behaald rendement (percentage)

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/behaald-rendement.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rendement in procenten is behaald op een investering of spaarbedrag, inclusief optionele stortingen en onttrekkingen.
2. Exacte formules/stappenvolgorde
    INVUL: Simpele variant zonder tussentijdse kasstromen: rendementBedrag = eindwaarde - beginwaarde; rendementPercentage = rendementBedrag / beginwaarde * 100. Met stortingen/onttrekkingen: nettoInleg = beginwaarde + stortingen - onttrekkingen; rendementBedrag = eindwaarde + onttrekkingen - beginwaarde - stortingen; rendementPercentage = rendementBedrag / gewogenGemiddeldVermogen * 100, waarbij gewogenGemiddeldVermogen optioneel time-weighted of money-weighted wordt berekend. Voor implementatie MVP: gebruik simpele variant tenzij kasstromen expliciet worden ondersteund.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bedragen in euro. Percentage = factor * 100. Indien looptijd wordt ingevuld: rendementPerJaar = (eindwaarde / beginwaarde)^(1 / jaren) - 1.
4. Afrondingsregels
    INVUL: Rendementbedrag op 2 decimalen. Rendementpercentage op 2 decimalen. Jaarlijks rendement op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: rendementBedrag, rendementPercentage, optioneel rendementPerJaar, beginwaarde, eindwaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie inleg, stortingen, onttrekkingen, eindwaarde en totale winst/verlies.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 12,34%; negatief rendement met minteken.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Beginwaarde ontbreekt of <= 0 is ongeldig voor percentage. Eindwaarde < 0 is ongeldig. Ontbrekende eindwaarde is onvoldoende.
2. Domeinbeperkingen
    INVUL: beginwaarde > 0; eindwaarde >= 0; looptijd > 0 indien jaarlijks rendement wordt berekend.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginwaarde in.” / “Vul een geldige eindwaarde in.” / “Voor jaarlijks rendement is een positieve looptijd nodig.”

Testset

1. Basiscase
    INVUL: Beginwaarde € 10.000, eindwaarde € 11.000. Verwacht rendement € 1.000, 10,00%.
2. Edge-case
    INVUL: Beginwaarde € 10.000, eindwaarde € 9.000. Verwacht rendement -€ 1.000, -10,00%.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginwaarde € 5.000, eindwaarde € 7.500. Verwacht rendement € 2.500, 50,00%.

Belasten werkelijk rendement in box 3

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/belasting-box3-werkelijk-rendement.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel box 3-belasting verschuldigd is als wordt uitgegaan van werkelijk rendement in plaats van forfaitair rendement.
2. Exacte formules/stappenvolgorde
    INVUL: werkelijkRendement = rente + dividend + huur + overigeOpbrengsten + gerealiseerdeKoerswinst + ongerealiseerdeWaardeStijging - kosten - renteSchulden. Afhankelijk van gekozen regime kunnen ongerealiseerde waardestijgingen wel/niet worden meegenomen. belastbaarRendement = max(0, werkelijkRendement - vrijgesteldRendementOfDrempel). belastingWerkelijkRendement = belastbaarRendement * box3Tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle opbrengsten en kosten per kalenderjaar. Maandopbrengsten naar jaar via *12. Tarieven via box3Parameters[jaar].
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Belasting eventueel op hele euro’s via fiscale parameter. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: werkelijkRendement, belastbaarRendement, box3Tarief, belastingWerkelijkRendement, nettoRendementNaBelasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie rente, dividend, huur, koerswinst, kosten, schuldrente en fiscale correcties.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; regime duidelijk labelen als werkelijk rendement.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende vermogensopbrengsten en waardemutaties is onvoldoende. Negatieve opbrengsten zijn toegestaan als verlies, maar niet-numerieke invoer is ongeldig. Ontbrekende box 3-parameters is onvoldoende.
2. Domeinbeperkingen
    INVUL: Box 3-tarief tussen 0 en 100; kosten mogen rendement verlagen; belasting niet lager dan 0 tenzij verliesverrekening expliciet wordt ondersteund.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul het werkelijk rendement in.” / “Vul geldige opbrengsten en kosten in.” / “Voor dit jaar ontbreken box 3-parameters.”

Testset

1. Basiscase
    INVUL: Werkelijk rendement € 5.000, tarief 36%, geen drempel. Verwacht belasting € 1.800.
2. Edge-case
    INVUL: Werkelijk rendement -€ 1.000. Verwacht belastbaar rendement € 0, belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 1.000, dividend € 2.000, koerswinst € 3.000, kosten € 500, tarief 30%. Verwacht rendement € 5.500, belasting € 1.650.

Belasting box 3 in 2026 t.o.v. 2025

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/belasting-box3-spaargeld-vermogen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van box 3-belasting tussen twee belastingjaren, bijvoorbeeld 2025 en 2026, op basis van dezelfde vermogenssamenstelling.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken per jaar apart: rendementSpaargeld = spaargeld * forfaitSpaargeldJaar / 100; rendementBeleggingen = beleggingen * forfaitBeleggingenJaar / 100; rendementSchulden = aftrekbareSchulden * forfaitSchuldenJaar / 100. grondslagSparenBeleggen = max(0, bezittingen - aftrekbareSchulden - heffingsvrijVermogen). Verdeel grondslag pro rata over rendementscomponenten volgens jaarregels. box3BelastingJaar = belastbaarRendementJaar * box3TariefJaar / 100. verschil = belastingJaar2 - belastingJaar1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vermogen per peildatum 1 januari. Percentages uit box3Parameters[jaar]. Geen maandconversie.
4. Afrondingsregels
    INVUL: Rendement en belasting op 2 decimalen of hele euro’s via fiscale parameter. Verschil op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: box3BelastingJaar1, box3BelastingJaar2, verschilBelasting, verschilPercentage, belastbaarRendementJaar1, belastbaarRendementJaar2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarvergelijking per vermogenscategorie, forfaitaire rendementen, vrijstelling en tarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaren duidelijk in kolommen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vermogenscategorieën < 0 ongeldig. Ontbrekende parameters voor één van beide jaren is onvoldoende. Schulden groter dan bezittingen toegestaan, maar grondslag minimaal 0.
2. Domeinbeperkingen
    INVUL: Spaargeld, beleggingen en schulden >= 0; beide jaartabellen beschikbaar; fiscaal partner ja/nee bepaalt heffingsvrij vermogen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogensbedragen in.” / “Voor één van de gekozen jaren ontbreken box 3-parameters.” / “Kies of sprake is van fiscaal partnerschap.”

Testset

1. Basiscase
    INVUL: Belasting jaar 1 € 1.000, jaar 2 € 1.200. Verwacht verschil € 200, 20%.
2. Edge-case
    INVUL: Vermogen lager dan heffingsvrij vermogen in beide jaren. Verwacht beide belastingen € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Belastbaar rendement jaar 1 € 5.000 tegen 30%, jaar 2 € 6.000 tegen 30%. Verwacht € 1.500 en € 1.800, verschil € 300.

Belasting op groene beleggingen

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/belasting-groene-beleggingen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het box 3-voordeel en eventuele heffingskorting voor groene beleggingen.
2. Exacte formules/stappenvolgorde
    INVUL: vrijgesteldeGroeneBeleggingen = min(groeneBeleggingen, vrijstellingGroeneBeleggingen). belasteGroeneBeleggingen = max(0, groeneBeleggingen - vrijstellingGroeneBeleggingen). Box 3 wordt berekend over overige bezittingen plus belaste groene beleggingen. Heffingskorting: groeneHeffingskorting = vrijgesteldeGroeneBeleggingen * heffingskortingPercentage / 100. Netto voordeel = box3BelastingZonderGroen - box3BelastingMetGroen + groeneHeffingskorting`.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vermogen per peildatum 1 januari. Percentages en vrijstelling via box3Parameters[jaar].
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Vrijstelling en belasting eventueel hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: vrijgesteldeGroeneBeleggingen, belasteGroeneBeleggingen, groeneHeffingskorting, box3Voordeel, totaalFiscaalVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking met en zonder groene beleggingen; resterende niet-vrijgestelde groene beleggingen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Groene beleggingen < 0 ongeldig. Ontbrekende groene parameters is onvoldoende. Niet-kwalificerende beleggingen tellen als gewone beleggingen.
2. Domeinbeperkingen
    INVUL: groeneBeleggingen >= 0; vrijstelling >= 0; heffingskortingpercentage 0..100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag aan groene beleggingen in.” / “Voor dit jaar ontbreken parameters voor groene beleggingen.” / “Deze belegging kwalificeert niet als groene belegging.”

Testset

1. Basiscase
    INVUL: Groene beleggingen € 50.000, vrijstelling € 30.000, heffingskorting 0,7%. Verwacht vrijgesteld € 30.000, belaste rest € 20.000, korting € 210.
2. Edge-case
    INVUL: Groene beleggingen € 0. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Box3 zonder groen € 1.000, met groen € 700, heffingskorting € 200. Verwacht totaal voordeel € 500.

Box 3 belasting volgens de spaarvariant

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/box3-spaarvariant.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van box 3-belasting volgens de spaarvariant/forfaitaire vermogensmix op basis van spaargeld, beleggingen en schulden.
2. Exacte formules/stappenvolgorde
    INVUL: bezittingen = spaargeld + beleggingen + overigeBezittingen. aftrekbareSchulden = max(0, schulden - schuldDrempel). nettoVermogen = max(0, bezittingen - aftrekbareSchulden). grondslag = max(0, nettoVermogen - heffingsvrijVermogen). Bepaal forfaitair rendement per categorie: rendementSpaargeld = spaargeld * forfaitSpaargeld / 100, rendementBeleggingen = beleggingen * forfaitBeleggingen / 100, rendementSchulden = aftrekbareSchulden * forfaitSchulden / 100. rendementsgrondslag = max(0, bezittingen - aftrekbareSchulden). rendementVoorGrondslag = max(0, rendementSpaargeld + rendementBeleggingen - rendementSchulden). belastbaarRendement = rendementVoorGrondslag * grondslag / rendementsgrondslag indien rendementsgrondslag > 0. box3Belasting = belastbaarRendement * box3Tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vermogen per peildatum 1 januari. Percentages per jaar via box3Parameters[jaar].
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s via fiscale parameter. Percentages met 2 decimalen. Interne pro-rata berekening zonder tussentijds afronden.

Output-contract

1. Primaire outputs
    INVUL: nettoVermogen, grondslagSparenEnBeleggen, forfaitairRendement, belastbaarRendement, box3Belasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per vermogenscategorie, schuldendrempel, heffingsvrij vermogen, forfaitaire rendementen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar en fiscaal partnerschap tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vermogenscategorieën < 0 ongeldig. Ontbrekende box 3-parameters is onvoldoende. Rendementsgrondslag 0 geeft belasting 0.
2. Domeinbeperkingen
    INVUL: Alle bezittingen en schulden >= 0; fiscale parameters beschikbaar; heffingsvrij vermogen afhankelijk van partnerstatus.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogensbedragen in.” / “Voor dit jaar ontbreken box 3-parameters.” / “Kies of sprake is van fiscaal partnerschap.”

Testset

1. Basiscase
    INVUL: Netto vermogen € 100.000, heffingsvrij € 50.000, forfaitair rendement totaal € 4.000, tarief 30%. Grondslagratio 50%. Verwacht belastbaar rendement € 2.000, belasting € 600.
2. Edge-case
    INVUL: Netto vermogen onder heffingsvrij vermogen. Verwacht belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Belastbaar rendement € 10.000, tarief 36%. Verwacht box 3-belasting € 3.600.

Box 3 rechtsherstel

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/box3-rechtsherstel-spaarvariant.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van oude box 3-heffing met rechtsherstel volgens spaarvariant en berekenen van mogelijk verschil/teruggaaf.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken belastingOudStelsel volgens oude forfaitaire methode. Bereken belastingRechtsherstel volgens spaarvariant: spaargeld, beleggingen en schulden met eigen forfaits. verschil = belastingOudStelsel - belastingRechtsherstel. teruggaaf = max(0, verschil) indien rechtsherstel lager is. Als rechtsherstel hoger is, doorgaans geen extra heffing in rechtsherstelscenario: naheffing = 0 tenzij parameter anders.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vermogen per peildatum. Tarieven en forfaits per belastingjaar. Geen maandconversie.
4. Afrondingsregels
    INVUL: Belasting en teruggaaf op 2 decimalen of hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: belastingOudStelsel, belastingRechtsherstel, verschil, mogelijkeTeruggaaf, voordeligsteBerekening.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie oude methode versus spaarvariant; categorieën spaargeld/beleggingen/schulden.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; verschil positief als teruggaaf; jaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende parameters oude of rechtsherstelmethode is onvoldoende. Negatieve vermogenscategorieën ongeldig.
2. Domeinbeperkingen
    INVUL: Vermogenscategorieën >= 0; jaartabellen voor gekozen jaar beschikbaar; rechtsherstel alleen voor jaren waarvoor regeling van toepassing is.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogensbedragen in.” / “Voor dit jaar ontbreken rechtsherstelparameters.” / “Rechtsherstel is voor dit jaar niet van toepassing.”

Testset

1. Basiscase
    INVUL: Oude belasting € 1.500, rechtsherstel € 1.000. Verwacht teruggaaf € 500.
2. Edge-case
    INVUL: Rechtsherstel hoger dan oud. Verwacht teruggaaf € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Oud € 2.000, nieuw € 750. Verwacht verschil € 1.250.

Box 3 tegenbewijsregeling

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/tegenbewijsregeling-box-3-werkelijk-rendement.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van forfaitaire box 3-heffing met heffing op werkelijk rendement om te bepalen of tegenbewijs voordelig is.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken box3BelastingForfaitair volgens box 3-spaarvariant. Bereken werkelijkRendement volgens werkelijke-rendementsmethode. belastingWerkelijk = max(0, werkelijkRendement) * box3Tarief / 100. voordeelTegenbewijs = box3BelastingForfaitair - belastingWerkelijk. tegenbewijsVoordelig = voordeelTegenbewijs > 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Werkelijk rendement per kalenderjaar. Vermogen per peildatum. Tarieven via box3Parameters[jaar].
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Verschil op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: box3BelastingForfaitair, belastingWerkelijkRendement, voordeelTegenbewijs, tegenbewijsVoordelig, werkelijkRendement.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie forfaitaire rendementen versus werkelijke opbrengsten/kosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; duidelijke conclusie “tegenbewijs voordelig: ja/nee”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende werkelijke rendementen is onvoldoende. Ontbrekende forfaitaire parameters is onvoldoende. Negatief werkelijk rendement toegestaan.
2. Domeinbeperkingen
    INVUL: Box 3-tarief 0..100; werkelijke kosten/opbrengsten numeriek; belasting niet lager dan 0 tenzij verliesverrekening parameter bestaat.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul het werkelijk rendement in.” / “Voor dit jaar ontbreken box 3-parameters.” / “Vul geldige opbrengsten en kosten in.”

Testset

1. Basiscase
    INVUL: Forfaitaire belasting € 2.000, werkelijke belasting € 1.000. Verwacht voordeel € 1.000, voordelig ja.
2. Edge-case
    INVUL: Werkelijke belasting hoger dan forfaitair. Verwacht voordeel negatief, voordelig nee.
3. Regresstest tegen bekende uitkomst
    INVUL: Werkelijk rendement € 5.000, tarief 36%, forfaitaire belasting € 2.500. Verwacht werkelijk € 1.800, voordeel € 700.

Box 3 vermogensbelasting

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/box3-vermogensbelasting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van box 3-belasting over vermogen in sparen en beleggen.
2. Exacte formules/stappenvolgorde
    INVUL: bezittingen = spaargeld + beleggingen + vastgoed + overigeBezittingen. aftrekbareSchulden = max(0, schulden - schuldDrempel). rendementsgrondslag = max(0, bezittingen - aftrekbareSchulden). grondslag = max(0, rendementsgrondslag - heffingsvrijVermogen). Bereken forfaitair rendement volgens jaarmethode. belastbaarRendement = forfaitairRendement * grondslag / rendementsgrondslag indien rendementsgrondslag > 0. box3Belasting = belastbaarRendement * box3Tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vermogen per 1 januari. Tarieven en vrijstellingen per belastingjaar. Fiscaal partner verdubbelt of wijzigt vrijstellingen volgens parameter.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s via fiscale parameter. Percentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: bezittingen, aftrekbareSchulden, rendementsgrondslag, grondslagSparenEnBeleggen, belastbaarRendement, box3Belasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing per vermogenssoort, schulden, vrijstelling, forfaitair rendement en tarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; peildatum en belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve bezittingen of schulden ongeldig. Ontbrekende jaartabel onvoldoende. Rendementsgrondslag 0 geeft belasting 0.
2. Domeinbeperkingen
    INVUL: Bezittingen en schulden >= 0; box3Parameters beschikbaar; partnerstatus bekend.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogensbedragen in.” / “Voor dit jaar ontbreken box 3-parameters.” / “Kies of sprake is van fiscaal partnerschap.”

Testset

1. Basiscase
    INVUL: Rendementsgrondslag € 100.000, heffingsvrij € 50.000, forfaitair rendement € 4.000, tarief 30%. Verwacht belastbaar rendement € 2.000, belasting € 600.
2. Edge-case
    INVUL: Rendementsgrondslag lager dan vrijstelling. Verwacht belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Belastbaar rendement € 1.000, tarief 36%. Verwacht belasting € 360.

Eerder beginnen met sparen

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/eerder-beginnen-met-sparen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken hoeveel extra vermogen ontstaat door eerder te beginnen met sparen of beleggen.
2. Exacte formules/stappenvolgorde
    INVUL: Scenario A vroeg starten: FV_A = startKapitaalA*(1+r)^nA + inlegA*((1+r)^nA - 1)/r. Scenario B later starten: FV_B = startKapitaalB*(1+r)^nB + inlegB*((1+r)^nB - 1)/r. Bij r = 0: FV = startKapitaal + inleg*n. voordeelEerderStarten = FV_A - FV_B.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement via (1 + jaarRendement/100)^(1/12)-1. Looptijd jaren naar maanden. Inleg per maand.
4. Afrondingsregels
    INVUL: Eindkapitaal en voordeel op 2 decimalen. Looptijd in hele maanden.

Output-contract

1. Primaire outputs
    INVUL: eindkapitaalVroegStarten, eindkapitaalLaatStarten, voordeelEerderStarten, extraRendementDoorTijd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse vermogensontwikkeling per scenario; totaal ingelegd per scenario.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement met 2 decimalen; scenario’s naast elkaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inleg of startkapitaal < 0 ongeldig. Looptijd < 0 ongeldig. Rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; looptijden >= 0; rendement per periode > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige bedragen in.” / “Vul een geldige looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Vroeg: € 100/mnd 10 jaar, laat: € 100/mnd 5 jaar, rendement 0%. Verwacht € 12.000 versus € 6.000, voordeel € 6.000.
2. Edge-case
    INVUL: Beide looptijden gelijk en bedragen gelijk. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Startkapitaal € 10.000, geen inleg, rendement 5%, 1 jaar. Verwacht € 10.500.

Effectieve spaarrente

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/effectieve-spaarrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de effectieve spaarrente per jaar bij samengestelde rente en rentebijschrijving meerdere keren per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: effectieveRente = ((1 + nominaleRente/100 / periodesPerJaar)^periodesPerJaar - 1) * 100. Bij maandelijkse rente: periodesPerJaar = 12; kwartaal 4; jaarlijks 1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Nominale rente als jaarpercentage. Perioderente = nominale rente / periodes per jaar. Output als jaarpercentage.
4. Afrondingsregels
    INVUL: Effectieve rente op 3 of 4 decimalen; UI standaard 2 decimalen. Interne berekening met volledige precisie.

Output-contract

1. Primaire outputs
    INVUL: nominaleSpaarrente, periodesPerJaar, effectieveSpaarrente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Perioderente en vergelijking met jaarlijkse rentebijschrijving.
3. Formatregels voor UI
    INVUL: Percentages met 2 tot 4 decimalen; periodes als tekstlabel maand/kwartaal/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Periodes per jaar <= 0 of niet-geheel is ongeldig. Nominale rente <= -100% * periodesPerJaar is ongeldig.
2. Domeinbeperkingen
    INVUL: periodesPerJaar > 0; 1 + nominaleRente/100/periodesPerJaar > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige nominale spaarrente in.” / “Vul een geldig aantal rentebijschrijvingen per jaar in.”

Testset

1. Basiscase
    INVUL: Nominaal 12%, maandelijks. Verwacht effectief (1+0,12/12)^12-1 = 12,6825%.
2. Edge-case
    INVUL: Nominaal 0%. Verwacht effectief 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Nominaal 10%, jaarlijks. Verwacht effectief 10%.

Eindkapitaal

Bron-URL: https://www.externe-bron.nl/modules/beleggen/eindkapitaal.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het eindkapitaal bij startkapitaal, periodieke inleg, looptijd en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: FV = startKapitaal*(1+r)^n + periodiekeInleg*((1+r)^n - 1)/r bij inleg einde periode. Bij r = 0: FV = startKapitaal + periodiekeInleg*n. Bij inleg begin periode: inlegcomponent vermenigvuldigen met (1+r).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement via effectieve formule. Looptijd jaren naar maanden. Inleg per maand/jaar naar gekozen periode.
4. Afrondingsregels
    INVUL: Eindkapitaal op 2 decimalen. Totaal ingelegd en rendement op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindkapitaal, totaalIngelegd, totaalRendement, startKapitaal, periodiekeInleg.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks opbouwschema en grafiek vermogen/inleg/rendement.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startkapitaal of inleg < 0 ongeldig. Looptijd < 0 ongeldig. Rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; looptijd >= 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig startkapitaal in.” / “Vul een geldige inleg in.” / “Vul een geldige looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Start € 0, inleg € 100/mnd, rendement 0%, 10 jaar. Verwacht eindkapitaal € 12.000.
2. Edge-case
    INVUL: Looptijd 0, start € 5.000. Verwacht eindkapitaal € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 10.000, geen inleg, rendement 5%, 1 jaar. Verwacht € 10.500.

Gemiddeld rendement

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/gemiddeld-rendement.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het gemiddelde rendement per periode of per jaar over meerdere rendementen of begin-/eindwaarden.
2. Exacte formules/stappenvolgorde
    INVUL: Rekenkundig gemiddelde: gemiddeld = Σ rendementen / aantal. Meetkundig gemiddelde: gemiddeldMeetkundig = (Π(1 + rendement_i/100))^(1/aantal) - 1. Bij begin- en eindwaarde: gemiddeldJaarRendement = (eindwaarde / beginwaarde)^(1/jaren) - 1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendementen invoeren als percentages. Output als percentage. Maandrendement naar jaar via (1+rMaand)^12 - 1.
4. Afrondingsregels
    INVUL: Gemiddeld rendement op 2 decimalen. Productberekeningen intern zonder tussentijds afronden.

Output-contract

1. Primaire outputs
    INVUL: rekenkundigGemiddeldRendement, meetkundigGemiddeldRendement, optioneel gemiddeldJaarRendement.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel van ingevoerde rendementen en cumulatief rendement.
3. Formatregels voor UI
    INVUL: Percentages met 2 decimalen; negatief rendement met minteken.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen rendementen ingevuld is onvoldoende. Rendement <= -100% ongeldig voor meetkundig gemiddelde. Beginwaarde <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Minimaal één rendement; voor meetkundig gemiddelde geldt 1+r_i > 0; jaren > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één rendement in.” / “Rendement mag niet lager zijn dan -100%.” / “Vul een positieve beginwaarde en looptijd in.”

Testset

1. Basiscase
    INVUL: Rendementen 10%, 20%, 0%. Rekenkundig verwacht 10%.
2. Edge-case
    INVUL: Rendement -100%. Verwacht foutmelding voor meetkundig gemiddelde.
3. Regresstest tegen bekende uitkomst
    INVUL: Begin € 100, eind € 121, looptijd 2 jaar. Verwacht gemiddeld jaarresultaat 10%.

Hoelang sparen

Bron-URL: https://www.externe-bron.nl/modules/beleggen/wanneerspaardoelbereikt.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoelang het duurt voordat een spaardoel wordt bereikt met startkapitaal, periodieke inleg en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Simuleer per periode: saldo = saldo*(1+r) + periodiekeInleg tot saldo >= doelKapitaal. Gesloten vorm kan worden gebruikt indien r > 0: n = ln((doel*r + inleg)/(start*r + inleg)) / ln(1+r). Bij r = 0: n = (doel - start) / inleg. Rond aantal perioden naar boven af.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement. Perioden naar jaren/maanden: jaren = floor(n/12), maanden = n % 12.
4. Afrondingsregels
    INVUL: Aantal perioden altijd naar boven afronden. Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aantalPerioden, looptijdJaren, looptijdMaanden, bereikteEindwaarde, totaalIngelegd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Opbouwschema tot doel en grafiek vermogensgroei.
3. Formatregels voor UI
    INVUL: Looptijd als x jaar en y maanden; eurobedragen met 2 decimalen; rendement met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Doel <= 0, start < 0, inleg < 0, rendement <= -100% per periode ongeldig. Als start >= doel, looptijd 0. Als inleg 0 en rendement <= 0 en start < doel, doel onbereikbaar.
2. Domeinbeperkingen
    INVUL: doel > 0; bedragen >= 0; r > -100%; maximaal aantal simulatieperioden instellen om oneindige loop te voorkomen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief spaardoel in.” / “Met deze invoer wordt het spaardoel niet bereikt.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Doel € 12.000, start € 0, inleg € 100/mnd, rendement 0%. Verwacht 120 maanden.
2. Edge-case
    INVUL: Start € 15.000, doel € 10.000. Verwacht looptijd 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Doel € 1.000, start € 0, inleg € 100, rendement 0%. Verwacht 10 perioden.

Inflatie berekening

Bron-URL: https://www.externe-bron.nl/modules/beleggen/inflatie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat inflatie doet met koopkracht of toekomstige waarde van geld.
2. Exacte formules/stappenvolgorde
    INVUL: Toekomstige prijs: toekomstigeWaarde = huidigeWaarde * (1 + inflatie/100)^jaren. Koopkracht huidige waarde in toekomst: reëleWaarde = huidigeWaarde / (1 + inflatie/100)^jaren. Koopkrachtverlies: verlies = huidigeWaarde - reëleWaarde.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inflatie als jaarpercentage. Maandelijkse inflatie naar jaar via (1+rMaand)^12 - 1. Looptijd in jaren.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Inflatiepercentage op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: toekomstigeWaarde, reeleWaarde, koopkrachtverlies, koopkrachtverliesPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse tabel met nominale waarde, reële waarde en verlies.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaren als geheel of 1 decimaal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedrag < 0 ongeldig. Looptijd < 0 ongeldig. Inflatie <= -100% per jaar ongeldig.
2. Domeinbeperkingen
    INVUL: Bedrag >= 0; jaren >= 0; 1 + inflatie/100 > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag in.” / “Vul een geldige looptijd in.” / “Vul een geldig inflatiepercentage in.”

Testset

1. Basiscase
    INVUL: € 1.000, inflatie 2%, 1 jaar. Verwacht toekomstige prijs € 1.020.
2. Edge-case
    INVUL: Inflatie 0%, 10 jaar. Verwacht waarde blijft gelijk.
3. Regresstest tegen bekende uitkomst
    INVUL: € 100, inflatie 10%, 2 jaar. Verwacht toekomstige prijs € 121.

Kosten bij beleggen / vermogensbeheer

Bron-URL: https://www.externe-bron.nl/beleggen/vermogensbeheer-beleggen-kosten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel kosten beleggen of vermogensbeheer kost per jaar en over de looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: vasteKosten = vasteKostenPerJaar. percentageKosten = gemiddeldVermogen * kostenPercentage / 100. transactiekosten = aantalTransacties * kostenPerTransactie. totaleKostenPerJaar = vasteKosten + percentageKosten + transactiekosten + fondskosten. Over meerdere jaren: simuleer vermogen = vermogen*(1+brutoRendement) + inleg - kosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandkosten naar jaar via *12. Kostenpercentage per jaar. Vermogen gemiddeld per jaar.
4. Afrondingsregels
    INVUL: Kosten op 2 decimalen. Kostenpercentage met 2 decimalen. Vermogensschema op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenPerJaar, kostenPercentageVanVermogen, totaleKostenLooptijd, nettoEindvermogen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie vaste kosten, beheerkosten, fondskosten, transactiekosten en cumulatieve kosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; kostenposten in tabel.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vermogen < 0, kosten < 0, percentages < 0 of aantal transacties < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Vermogen en kosten >= 0; percentages >= 0; looptijd >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig vermogen in.” / “Kosten mogen niet negatief zijn.” / “Vul een geldig kostenpercentage in.”

Testset

1. Basiscase
    INVUL: Vermogen € 100.000, beheerkosten 1%, vaste kosten € 100. Verwacht kosten € 1.100.
2. Edge-case
    INVUL: Alle kosten 0. Verwacht totale kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vermogen € 50.000, kosten 0,5%, transactiekosten € 50. Verwacht € 300.

Rente of rendement bedrag

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/rente-rendement-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel rente of rendement in euro’s hoort bij een bedrag en een rente-/rendementspercentage.
2. Exacte formules/stappenvolgorde
    INVUL: Enkelvoudig: rendementBedrag = kapitaal * rendementPercentage / 100 * jaren. Samengesteld: eindwaarde = kapitaal * (1 + rendementPercentage/100)^jaren; rendementBedrag = eindwaarde - kapitaal.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Percentage per jaar. Looptijd in jaren of maanden; maanden naar jaren via /12 bij enkelvoudig of periodiek samengestelde formule.
4. Afrondingsregels
    INVUL: Rendementbedrag en eindwaarde op 2 decimalen. Percentage met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: rendementBedrag, eindwaarde, kapitaal, rendementPercentage, looptijd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse opbouw bij samengestelde rente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; methode enkelvoudig/samengesteld tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Kapitaal < 0, looptijd < 0, rendement <= -100% bij samengestelde berekening ongeldig.
2. Domeinbeperkingen
    INVUL: Kapitaal >= 0; looptijd >= 0; 1 + rendement/100 > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig kapitaal in.” / “Vul een geldig rendement in.” / “Vul een geldige looptijd in.”

Testset

1. Basiscase
    INVUL: Kapitaal € 10.000, rendement 5%, 1 jaar enkelvoudig. Verwacht rendement € 500.
2. Edge-case
    INVUL: Rendement 0%. Verwacht rendement € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Kapitaal € 100, rendement 10%, 2 jaar samengesteld. Verwacht eindwaarde € 121, rendement € 21.

Spaardoel

Bron-URL: https://www.externe-bron.nl/modules/beleggen/voorspaardoelbenodigdeinleg.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke periodieke inleg nodig is om een spaardoel te bereiken.
2. Exacte formules/stappenvolgorde
    INVUL: doel, start, r, n. FV_start = start*(1+r)^n. Inleg einde periode: inleg = (doel - FV_start) * r / ((1+r)^n - 1). Bij r = 0: inleg = (doel - start)/n. Als FV_start >= doel, inleg 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement. Looptijd jaren naar maanden. Inleg per maand als standaard.
4. Afrondingsregels
    INVUL: Benodigde inleg naar boven afronden op centen om doel te halen. Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: benodigdeInlegPerPeriode, benodigdeInlegPerMaand, doelKapitaal, verwachtEindkapitaal, totaalIngelegd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Opbouwschema en cumulatieve inleg/rendement.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement met 2 decimalen; looptijd als jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Doel <= 0, start < 0, looptijd <= 0, rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: doel > 0; start >= 0; n > 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief spaardoel in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Doel € 12.000, start € 0, rendement 0%, 10 jaar. Verwacht € 100/mnd.
2. Edge-case
    INVUL: Start € 15.000, doel € 10.000. Verwacht inleg € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Doel € 1.000, start € 0, rendement 0%, 10 maanden. Verwacht € 100/mnd.

Spaargeld/vermogen opmaken

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/spaargeld-opmaken.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoelang vermogen meegaat bij periodieke onttrekkingen en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Simuleer per periode: saldo = saldo*(1+r) - onttrekking. Stop wanneer saldo <= 0. Gesloten vorm bij r > 0: n = -ln(1 - start*r/onttrekking) / ln(1+r) indien onttrekking > start*r. Bij r = 0: n = start / onttrekking. Als onttrekking <= start*r bij positief rendement, raakt vermogen niet op.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement. Onttrekking per maand of jaar naar gekozen periode.
4. Afrondingsregels
    INVUL: Aantal perioden naar beneden voor volledig haalbare uitkeringen; eindrestant op 2 decimalen. Looptijd als jaren/maanden.

Output-contract

1. Primaire outputs
    INVUL: looptijdTotVermogenOp, aantalUitkeringen, laatsteUitkering, totaalOnttrokken, totaalRendement.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Afbouwschema per periode en grafiek restvermogen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; looptijd als x jaar en y maanden; melding als vermogen niet opraakt.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startvermogen <= 0, onttrekking <= 0, rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: startvermogen > 0; onttrekking > 0; r > -100%; max simulatieperioden instellen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief startvermogen in.” / “Vul een positieve onttrekking in.” / “Met deze invoer raakt het vermogen niet op.”

Testset

1. Basiscase
    INVUL: Start € 12.000, onttrekking € 1.000/mnd, rendement 0%. Verwacht 12 maanden.
2. Edge-case
    INVUL: Onttrekking € 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 10.000, onttrekking € 100, rendement 0%. Verwacht 100 perioden.

Sparen met een hogere rente

Bron-URL: https://www.externe-bron.nl/sparen/meer-sparen-met-hogere-spaarrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel extra opbrengst ontstaat door een hogere spaarrente.
2. Exacte formules/stappenvolgorde
    INVUL: Scenario oud: FV_oud = start*(1+rOud)^n + inleg*((1+rOud)^n - 1)/rOud. Scenario nieuw: FV_nieuw = start*(1+rNieuw)^n + inleg*((1+rNieuw)^n - 1)/rNieuw. Bij rente 0: gebruik start + inleg*n. extraOpbrengst = FV_nieuw - FV_oud.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse spaarrente naar maandrente via effectieve formule. Looptijd naar perioden.
4. Afrondingsregels
    INVUL: Eindkapitalen en extra opbrengst op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindkapitaalOudeRente, eindkapitaalNieuweRente, extraOpbrengst, verschilRentePercentagepunt.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse vergelijking oud/nieuw en cumulatief voordeel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentepercentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Start/inleg < 0, looptijd < 0, rente <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; looptijd >= 0; rentes geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige spaarbedragen in.” / “Vul geldige rentepercentages in.” / “Vul een geldige looptijd in.”

Testset

1. Basiscase
    INVUL: Start € 10.000, geen inleg, oude rente 1%, nieuwe rente 2%, 1 jaar. Verwacht € 10.100 versus € 10.200, extra € 100.
2. Edge-case
    INVUL: Oude rente = nieuwe rente. Verwacht extra opbrengst € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 1.000, oud 0%, nieuw 10%, 1 jaar. Verwacht extra € 100.

Sparen of beleggen

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/sparen-of-beleggen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van verwacht eindvermogen bij sparen versus beleggen.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken spaarvariant met spaarrente: FV_sparen = start*(1+rSparen)^n + inleg*((1+rSparen)^n - 1)/rSparen. Bereken beleggingsvariant met verwacht rendement en kosten: rNettoBeleggen = rendementBeleggen - kostenPercentage; FV_beleggen = start*(1+rNetto)^n + inleg*((1+rNetto)^n - 1)/rNetto. verschil = FV_beleggen - FV_sparen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarpercentages naar maandrendement. Kostenpercentage per jaar. Inleg per maand.
4. Afrondingsregels
    INVUL: Eindvermogens en verschil op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindvermogenSparen, eindvermogenBeleggen, verschil, verwachtVoordeligsteKeuze, totaalIngelegd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Scenario-opbouw per jaar; gevoeligheid voor lager/hoger beleggingsrendement.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; waarschuwing dat beleggen risico kent.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedragen < 0, looptijd < 0, rendement <= -100% per periode ongeldig. Beleggen zonder rendementsaanname is onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; looptijd >= 0; rendementen geldig; kosten >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige bedragen in.” / “Vul geldige rente- en rendementspercentages in.” / “Vul een geldige looptijd in.”

Testset

1. Basiscase
    INVUL: Start € 10.000, geen inleg, sparen 2%, beleggen 5%, 1 jaar. Verwacht verschil € 300.
2. Edge-case
    INVUL: Zelfde rendement voor sparen en beleggen, geen kosten. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 1.000, sparen 0%, beleggen 10%, 2 jaar. Verwacht beleggen € 1.210, sparen € 1.000.

Uitkering box 3 kapitaalverzekering

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/uitkering-kapitaalverzekering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de netto uitkering en eventuele box 3-effecten van een kapitaalverzekering.
2. Exacte formules/stappenvolgorde
    INVUL: uitkering = opgebouwdeWaarde. premiesBetaald = Σ premies. rendement = uitkering - premiesBetaald. Indien belast in box 3: waarde telt mee als bezitting per peildatum en box 3-belasting wordt via box3-module berekend. Indien vrijstelling/overgangsrecht van toepassing: belastbareWaarde = max(0, uitkering - vrijstelling). nettoUitkering = uitkering - eventueleBelasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Premies per maand naar totaal via * aantalMaanden. Vermogen per peildatum. Vrijstellingen via jaartabel.
4. Afrondingsregels
    INVUL: Uitkering, premies en belasting op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoUitkering, premiesBetaald, rendement, belastbareWaarde, belasting, nettoUitkering.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Premie-overzicht, waardeontwikkeling, box 3-effect en eventuele vrijstelling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; fiscale status duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering < 0, premies < 0, ontbrekende fiscale status of vrijstellingsparameters is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; fiscale parameters beschikbaar indien belasting wordt berekend.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige uitkering in.” / “Vul geldige premies in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Uitkering € 100.000, premies € 80.000, geen belasting. Verwacht rendement € 20.000, netto € 100.000.
2. Edge-case
    INVUL: Uitkering € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Uitkering € 50.000, belasting € 5.000. Verwacht netto € 45.000.

Vastgoed rendement

Bron-URL: https://www.externe-bron.nl/beleggen/vastgoed-rendement-woning-verhuren.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en netto rendement op verhuurd vastgoed.
2. Exacte formules/stappenvolgorde
    INVUL: jaarhuur = maandhuur * 12. brutoAanvangsrendement = jaarhuur / aankoopprijs * 100. exploitatiekosten = onderhoud + beheer + verzekering + belastingen + leegstand + overigeKosten. nettoHuur = jaarhuur - exploitatiekosten. nettoRendement = nettoHuur / eigenInlegOfWaarde * 100. Inclusief financiering: cashflow = nettoHuur - hypotheekrente - aflossing. Totaalrendement: totaalRendement = nettoHuur + waardestijging - kosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaar via *12. Rendement als jaarpercentage. Kosten per maand naar jaar via *12.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Rendementen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: jaarhuur, brutoRendement, nettoHuur, nettoRendement, cashflowPerJaar, cashflowPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenoverzicht, financieringslasten, leegstand, waardestijging en totaalrendement.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; maand- en jaarbedragen apart tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aankoopprijs/waarde <= 0 ongeldig. Huur of kosten < 0 ongeldig. Eigen inleg <= 0 ongeldig indien rendement op eigen geld wordt berekend.
2. Domeinbeperkingen
    INVUL: Waarde > 0; huur en kosten >= 0; leegstandspercentage 0..100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde of aankoopprijs in.” / “Vul een geldige huur in.” / “Kosten mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Aankoopprijs € 300.000, maandhuur € 1.250, kosten € 3.000/jaar. Jaarhuur € 15.000; bruto rendement 5%; netto huur € 12.000; netto rendement 4%.
2. Edge-case
    INVUL: Huur € 0. Verwacht rendement 0% minus kosten.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarhuur € 10.000, waarde € 200.000. Verwacht bruto rendement 5%.

Veilig sparen

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/veilig-sparen-deposito.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van opbrengst en risicospreiding bij veilig sparen, bijvoorbeeld via deposito’s en depositogarantiegrens.
2. Exacte formules/stappenvolgorde
    INVUL: Renteopbrengst deposito: eindwaarde = inleg * (1 + rente/100)^looptijdJaren of bij jaarlijkse uitkering rentePerJaar = inleg * rente/100. Depositogarantie: gedektBedrag = min(inlegPerBank, garantieGrensPerBank). ongedektBedrag = max(0, inlegPerBank - garantieGrensPerBank). Bij meerdere banken: sommeer per bank.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente als jaarpercentage. Looptijd in jaren of maanden. Maanden naar jaren via /12.
4. Afrondingsregels
    INVUL: Rente en eindwaarde op 2 decimalen. Gedekt/ongedekt bedrag op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindwaarde, renteOpbrengst, gedektBedrag, ongedektBedrag, aantalBenodigdeBankenVoorVolledigeDekking.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Overzicht per bank/deposito met inleg, rente, looptijd, gedekt en ongedekt.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentepercentage met 2 decimalen; garantiegrens als parameter tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inleg < 0, rente <= -100%, looptijd < 0, garantiegrens < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Inleg >= 0; looptijd >= 0; garantiegrens >= 0; rente geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige inleg in.” / “Vul een geldige rente in.” / “Vul een geldige garantiegrens in.”

Testset

1. Basiscase
    INVUL: Inleg € 10.000, rente 3%, 1 jaar. Verwacht eindwaarde € 10.300.
2. Edge-case
    INVUL: Inleg € 0. Verwacht opbrengst € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Inleg € 150.000, garantiegrens € 100.000. Verwacht gedekt € 100.000, ongedekt € 50.000.

Verhuurde woning in box 3

Bron-URL: https://www.externe-bron.nl/beleggen/waarde-en-belasting-verhuurde-box3-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de fiscale waarde en box 3-belasting van een verhuurde woning.
2. Exacte formules/stappenvolgorde
    INVUL: jaarhuur = maandhuur * 12. huurpercentage = jaarhuur / wozWaarde * 100. Zoek leegwaarderatio in jaartabel. waardeVerhuurdeWoning = wozWaarde * leegwaarderatio / 100. Neem deze waarde mee als vastgoed/belegging in box 3. Bereken box 3-belasting via box3-module: box3Belasting = belastbaarRendement * box3Tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaarhuur via *12. Vermogen per 1 januari. Ratio/tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Waarde en belasting op 2 decimalen of hele euro’s via fiscale parameter. Huurpercentage met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: wozWaarde, jaarhuur, leegwaarderatio, waardeVerhuurdeWoning, box3Belasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toegepaste ratio-schijf, box 3-specificatie, vergelijking waarde leeg/verhuurd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; WOZ- en belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: WOZ-waarde <= 0, huur < 0, ontbrekende ratio- of box3Parameters ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: WOZ > 0; huur >= 0; verhuursituatie kwalificeert; jaartabellen beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige WOZ-waarde in.” / “Vul een geldige huur in.” / “Voor dit jaar ontbreken leegwaarderatio- of box 3-parameters.”

Testset

1. Basiscase
    INVUL: WOZ € 300.000, ratio 80%. Verwacht waarde € 240.000.
2. Edge-case
    INVUL: Geen kwalificerende verhuur. Verwacht waarde = WOZ.
3. Regresstest tegen bekende uitkomst
    INVUL: Waarde verhuurd € 250.000, forfaitair rendement 6%, tarief 30%, geen vrijstelling. Verwacht belasting € 4.500.

Vermogensafbouw

Bron-URL: https://www.externe-bron.nl/modules/beleggen/vermogensafbouw.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe vermogen afneemt bij periodieke onttrekkingen, rendement en kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Per periode: rendementBedrag = saldo * r; kosten = saldo * kostenPercentage/100 + vasteKosten; saldoNieuw = saldo + rendementBedrag - kosten - onttrekking. Herhaal tot looptijd is bereikt of saldo <= 0. Laatste onttrekking corrigeren tot resterend saldo.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement/kostenpercentage naar maandpercentage via effectieve formule of nominale verdeling. Onttrekking per maand standaard.
4. Afrondingsregels
    INVUL: Saldo, rendement, kosten en onttrekkingen op 2 decimalen. Laatste periode corrigeren zodat saldo niet negatief wordt tenzij toegestaan.

Output-contract

1. Primaire outputs
    INVUL: eindvermogen, aantalPeriodenTotOp, totaalOnttrokken, totaalRendement, totaleKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Afbouwschema per periode/jaar en grafiek saldoverloop.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement/kosten met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startvermogen < 0, onttrekking < 0, rendement <= -100% per periode, kosten < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Startvermogen >= 0; onttrekking >= 0; looptijd >= 0; r geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig startvermogen in.” / “Vul een geldige onttrekking in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Start € 12.000, onttrekking € 1.000/mnd, rendement 0%, kosten 0. Verwacht vermogen op na 12 maanden.
2. Edge-case
    INVUL: Onttrekking € 0, rendement 0%. Verwacht eindvermogen blijft gelijk.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 10.000, onttrekking € 100, 10 perioden, rendement 0%. Verwacht eindvermogen € 9.000.

Vermogensbeheer & beleggen TCO

Bron-URL: https://www.externe-bron.nl/beleggen/vermogensbeheer-beleggen-tco.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van total cost of ownership van beleggen/vermogensbeheer over meerdere jaren en het effect op eindvermogen.
2. Exacte formules/stappenvolgorde
    INVUL: Per jaar: brutoRendementBedrag = vermogenBegin * brutoRendement / 100; lopendeKosten = vermogenGemiddeld * lopendeKostenPercentage / 100; beheerKosten = vermogenGemiddeld * beheerFee / 100; transactiekosten = aantalTransacties * kostenPerTransactie; totaleKostenJaar = lopendeKosten + beheerKosten + transactiekosten + vasteKosten; vermogenEind = vermogenBegin + brutoRendementBedrag + inleg - totaleKostenJaar. TCO = Σ totaleKostenJaar. Kostenimpact = eindvermogen zonder kosten - eindvermogen met kosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kostenpercentages per jaar. Maandinleg naar jaar via *12 of per maand simuleren.
4. Afrondingsregels
    INVUL: Kosten en vermogens op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenLooptijd, eindvermogenMetKosten, eindvermogenZonderKosten, kostenImpact, gemiddeldeKostenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse TCO-tabel met beheerfee, fondskosten, transactiekosten, vaste kosten en vermogensimpact.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; TCO duidelijk als totaal over looptijd.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vermogen/inleg/kosten < 0, looptijd < 0, rendement <= -100% ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen en kosten >= 0; kostenpercentages >= 0; looptijd >= 0; rendement geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig vermogen in.” / “Kosten mogen niet negatief zijn.” / “Vul een geldige looptijd in.”

Testset

1. Basiscase
    INVUL: Vermogen € 100.000, kosten 1%, geen rendement, 1 jaar. Verwacht kosten € 1.000, eindvermogen € 99.000.
2. Edge-case
    INVUL: Kosten 0. Verwacht kostenimpact € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vermogen € 50.000, vaste kosten € 100, percentagekosten 0,5%. Verwacht kosten € 350.

Vermogensgroei

Bron-URL: https://www.externe-bron.nl/modules/beleggen/vermogensgroei.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe vermogen groeit door rendement en periodieke inleg.
2. Exacte formules/stappenvolgorde
    INVUL: FV = startKapitaal*(1+r)^n + periodiekeInleg*((1+r)^n - 1)/r. Bij r = 0: FV = startKapitaal + periodiekeInleg*n. Bij inleg begin periode: inlegcomponent * (1+r).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement. Looptijd naar perioden. Inleg per gekozen periode.
4. Afrondingsregels
    INVUL: Eindvermogen, inleg en rendement op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindvermogen, totaalIngelegd, totaalRendement, rendementOpRendement, looptijd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks groeischema en grafiek inleg versus rendement.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendementen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Start/inleg < 0, looptijd < 0, rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; looptijd >= 0; r geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogensbedragen in.” / “Vul een geldige looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Start € 0, inleg € 100/mnd, rendement 0%, 12 maanden. Verwacht € 1.200.
2. Edge-case
    INVUL: Looptijd 0. Verwacht eindvermogen = startkapitaal.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 1.000, rendement 10%, 2 jaar, geen inleg. Verwacht € 1.210.

Vermogensopbouw

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/vermogensopbouw.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van vermogensopbouw met startvermogen, periodieke stortingen, rendement, inflatie en eventueel belasting/kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Per periode: saldo = saldo*(1+r) + storting - kosten - belasting. Zonder kosten/belasting gelijk aan eindkapitaalformule. Reële waarde: reeelSaldo = saldo / (1+inflatie)^jaren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarpercentages naar maandpercentages. Maandinleg standaard. Inflatie per jaar.
4. Afrondingsregels
    INVUL: Saldo en componenten op 2 decimalen. Percentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindvermogenNominaal, eindvermogenReeel, totaalIngelegd, totaalRendement, totaleKosten, totaleBelasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks schema met beginvermogen, stortingen, rendement, kosten, belasting en eindvermogen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; nominaal/reëel duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve bedragen ongeldig tenzij onttrekking expliciet wordt ondersteund. Rendement/inflatie <= -100% ongeldig.
2. Domeinbeperkingen
    INVUL: Startvermogen en storting >= 0; looptijd >= 0; percentages geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige bedragen in.” / “Vul geldige percentages in.” / “Vul een geldige looptijd in.”

Testset

1. Basiscase
    INVUL: Start € 0, storting € 100/mnd, 1 jaar, rendement 0%. Verwacht € 1.200.
2. Edge-case
    INVUL: Start € 10.000, geen storting, looptijd 0. Verwacht € 10.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 1.000, rendement 10%, 1 jaar. Verwacht € 1.100.

Vermogenswinstbelasting en vermogensaanwasbelasting

Bron-URL: https://www.externe-bron.nl/sparen-en-beleggen/vermogenswinstbelasting-vs-vermogensaanwasbelasting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van belasting bij vermogenswinstbelasting en vermogensaanwasbelasting.
2. Exacte formules/stappenvolgorde
    INVUL: Vermogensaanwasbelasting: jaarlijks aanwas = eindwaardeJaar - beginwaardeJaar + onttrekkingen - stortingen; belastingAanwasJaar = max(0, aanwas - vrijstelling) * tarief / 100. Vermogenswinstbelasting: belasting pas bij verkoop: vermogenswinst = verkoopwaarde - aankoopwaarde - kosten; belastingWinst = max(0, vermogenswinst - vrijstelling) * tarief / 100. Vergelijk netto eindvermogen na belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse aanwas per kalenderjaar. Tarief als percentage. Vermogenswinst bij realisatie/verkoopmoment.
4. Afrondingsregels
    INVUL: Belasting en netto eindvermogen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: belastingVermogensaanwas, belastingVermogenswinst, nettoEindvermogenAanwas, nettoEindvermogenWinst, verschil.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse aanwasbelasting, uitgestelde winstbelasting, netto vermogensontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; beide systemen naast elkaar tonen; tarief en vrijstelling tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aankoopwaarde < 0, verkoopwaarde < 0, tarief buiten 0..100 ongeldig. Geen verkoop bij winstbelasting maakt belasting nog niet verschuldigd; toon als latente belasting.
2. Domeinbeperkingen
    INVUL: Waarden >= 0; tarief 0..100; verliezen leiden tot 0 belasting tenzij verliesverrekening wordt ondersteund.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige vermogenswaarden in.” / “Vul een geldig belastingtarief in.” / “Zonder verkoop is vermogenswinstbelasting latent.”

Testset

1. Basiscase
    INVUL: Aankoop € 100.000, verkoop € 120.000, tarief 30%. Verwacht winst € 20.000, belasting € 6.000.
2. Edge-case
    INVUL: Verlies: aankoop € 100.000, verkoop € 90.000. Verwacht belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarlijkse aanwas € 10.000, tarief 36%, geen vrijstelling. Verwacht aanwasbelasting € 3.600.