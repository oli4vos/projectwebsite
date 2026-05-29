Klimaat & Verduurzamen — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: overig
Aantal tools in dit invulblad: 12

CO2-uitstoot cruise vakantie

Bron-URL: https://www.externe-bron.nl/klimaat/maatschappelijke-kosten-co2-uitstoot-cruise-vakantie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de geschatte CO2-uitstoot en maatschappelijke kosten van een cruisevakantie, op basis van reisduur, aantal personen en emissiefactoren.
2. Exacte formules/stappenvolgorde
    INVUL: uitstootCruiseKg = aantalPersonen * aantalCruiseDagen * emissieKgCO2PerPersoonPerDag. Voeg optioneel heen-/terugreis toe: uitstootVervoerKg = afstandKm * emissieKgCO2PerKm * aantalPersonen. totaleUitstootKg = uitstootCruiseKg + uitstootVervoerKg. totaleUitstootTon = totaleUitstootKg / 1000. maatschappelijkeKosten = totaleUitstootTon * maatschappelijkeKostenPerTonCO2.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Dagen als gehele of decimale reisdagen. Kilogram CO2 naar ton via /1000. Kosten per ton CO2 in euro. Geen maand/jaarconversie.
4. Afrondingsregels
    INVUL: CO2 in kg op 0 decimalen; CO2 in ton op 2 decimalen; maatschappelijke kosten op 2 decimalen. Interne berekening zonder tussentijdse afronding.

Output-contract

1. Primaire outputs
    INVUL: totaleUitstootKgCO2, totaleUitstootTonCO2, maatschappelijkeKostenCO2, uitstootCruiseKgCO2, optioneel uitstootVervoerKgCO2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per component: cruise, vlucht/auto/trein naar vertrekhaven, hotelovernachtingen indien meegenomen. Optioneel vergelijking per persoon.
3. Formatregels voor UI
    INVUL: CO2 als kg CO₂ en ton CO₂; eurobedragen als € 1.234,56; emissiefactoren met maximaal 4 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aantal personen leeg, niet-numeriek of <= 0 is ongeldig. Aantal dagen leeg, niet-numeriek of < 0 is ongeldig. Emissiefactor of maatschappelijke kosten per ton ontbreekt is onvoldoende.
2. Domeinbeperkingen
    INVUL: aantalPersonen > 0; aantalCruiseDagen >= 0; emissieKgCO2PerPersoonPerDag >= 0; maatschappelijkeKostenPerTonCO2 >= 0; afstanden >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aantal personen in.” / “Vul een geldige reisduur in.” / “Voor deze berekening ontbreekt een emissiefactor.” / “Vul een geldige CO₂-prijs per ton in.”

Testset

1. Basiscase
    INVUL: 2 personen, 7 cruisedagen, emissiefactor 250 kg CO₂/persoon/dag, maatschappelijke kosten € 100/ton. Verwacht uitstoot 3.500 kg, 3,50 ton, kosten € 350.
2. Edge-case
    INVUL: 1 persoon, 0 cruisedagen, geen vervoer. Verwacht uitstoot 0 kg, kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: 4 personen, 10 dagen, 200 kg/dag, CO2-prijs € 150/ton. Verwacht uitstoot 8.000 kg, 8 ton, kosten € 1.200.

CO2-uitstoot vakantiereis

Bron-URL: https://www.externe-bron.nl/klimaat/maatschappelijke-kosten-co2-uitstoot-vakantiereis.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de CO2-uitstoot en maatschappelijke kosten van een vakantiereis op basis van vervoer, afstand, verblijf en aantal reizigers.
2. Exacte formules/stappenvolgorde
    INVUL: Per vervoersmiddel: uitstootVervoerKg = afstandKm * emissieKgCO2PerKmPerPersoon * aantalPersonen. Bij vlucht retour: afstandRetourKm = afstandEnkeleReisKm * 2. Optioneel verblijf: uitstootVerblijfKg = aantalPersonen * nachten * emissieKgCO2PerPersoonPerNacht. totaleUitstootKg = Σ vervoer + verblijf. totaleUitstootTon = totaleUitstootKg / 1000. maatschappelijkeKosten = totaleUitstootTon * maatschappelijkeKostenPerTonCO2.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Afstand in km. Emissiefactor in kg CO2 per km per persoon of kg per nacht. Kg naar ton via /1000. Kosten per ton in euro.
4. Afrondingsregels
    INVUL: Uitstoot kg op 0 decimalen; ton op 2 decimalen; kosten op 2 decimalen. Interne berekening zonder tussentijds afronden.

Output-contract

1. Primaire outputs
    INVUL: totaleUitstootKgCO2, totaleUitstootTonCO2, maatschappelijkeKostenCO2, uitstootVervoerKgCO2, uitstootVerblijfKgCO2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per vervoersmiddel: afstand, emissiefactor, personen, uitstoot. Optioneel uitstoot per persoon.
3. Formatregels voor UI
    INVUL: Afstand als km; CO2 als kg CO₂/ton CO₂; eurobedragen met 2 decimalen; emissiefactoren met 4 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aantal personen <= 0, afstand < 0, nachten < 0, emissiefactor ontbreekt of negatief is ongeldig/onvoldoende. Geen vervoersmiddel ingevuld is onvoldoende.
2. Domeinbeperkingen
    INVUL: aantalPersonen > 0; afstandKm >= 0; nachten >= 0; emissiefactoren >= 0; CO2-prijs >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aantal reizigers in.” / “Vul een geldige afstand in.” / “Kies minimaal één vervoersmiddel.” / “Voor dit vervoersmiddel ontbreekt een emissiefactor.”

Testset

1. Basiscase
    INVUL: 2 personen, retourafstand 2.000 km, factor 0,15 kg/km/persoon, 7 nachten factor 10 kg/nacht/persoon, CO2-prijs € 100/ton. Verwacht vervoer 600 kg, verblijf 140 kg, totaal 740 kg, kosten € 74.
2. Edge-case
    INVUL: Afstand 0, nachten 0, 1 persoon. Verwacht uitstoot 0.
3. Regresstest tegen bekende uitkomst
    INVUL: 1 persoon, auto 1.000 km, factor 0,18 kg/km, CO2-prijs € 200/ton. Verwacht 180 kg, 0,18 ton, kosten € 36.

CO2-uitstoot woon-werkverkeer

Bron-URL: https://www.externe-bron.nl/klimaat/maatschappelijke-kosten-co2-woonwerkverkeer.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van jaarlijkse CO2-uitstoot en maatschappelijke kosten van woon-werkverkeer.
2. Exacte formules/stappenvolgorde
    INVUL: retourAfstandPerWerkdagKm = enkeleReisKm * 2. jaarAfstandKm = retourAfstandPerWerkdagKm * werkdagenPerWeek * werkwekenPerJaar. uitstootKg = jaarAfstandKm * emissieKgCO2PerKm. Bij carpool: uitstootPerPersoonKg = uitstootKg / aantalInzittenden. maatschappelijkeKosten = uitstootPerPersoonKg / 1000 * maatschappelijkeKostenPerTonCO2.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Week naar jaar via werkdagenPerWeek * werkwekenPerJaar. Kg naar ton via /1000. Kosten per ton in euro.
4. Afrondingsregels
    INVUL: Jaarafstand op 0 of 1 decimalen. Uitstoot kg op 0 decimalen. Kosten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: jaarAfstandKm, uitstootKgCO2PerJaar, uitstootTonCO2PerJaar, maatschappelijkeKostenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitstoot per werkdag, per week, per maand en per jaar. Optionele vergelijking met alternatief vervoermiddel.
3. Formatregels voor UI
    INVUL: Afstand als km; CO2 als kg CO₂; eurobedragen met 2 decimalen; werkweken als geheel of 1 decimaal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Enkele reis < 0, werkdagen per week buiten bereik, werkweken < 0, emissiefactor ontbreekt of negatief is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= werkdagenPerWeek <= 7; 0 <= werkwekenPerJaar <= 53; aantalInzittenden >= 1; emissiefactor >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige enkele reisafstand in.” / “Vul een geldig aantal werkdagen per week in.” / “Voor dit vervoermiddel ontbreekt een emissiefactor.” / “Aantal inzittenden moet minimaal 1 zijn.”

Testset

1. Basiscase
    INVUL: Enkele reis 20 km, 5 dagen/week, 46 weken/jaar, factor 0,18 kg/km, CO2-prijs € 100/ton. Verwacht jaarafstand 9.200 km, uitstoot 1.656 kg, kosten € 165,60.
2. Edge-case
    INVUL: Werkdagen per week 0. Verwacht jaarafstand 0, uitstoot 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Enkele reis 10 km, 1 dag/week, 50 weken, factor 0,2 kg/km. Verwacht 1.000 km, 200 kg.

Elektriciteitskosten apparaat

Bron-URL: https://www.externe-bron.nl/wonen/energiekosten-elektrisch-apparaat.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel elektriciteit een apparaat verbruikt en wat dit kost per dag, maand en jaar.
2. Exacte formules/stappenvolgorde
    INVUL: vermogenKw = vermogenWatt / 1000. verbruikKwhPerDag = vermogenKw * gebruiksurenPerDag. verbruikKwhPerJaar = verbruikKwhPerDag * gebruiksdagenPerJaar. kostenPerJaar = verbruikKwhPerJaar * stroomprijsPerKwh. kostenPerMaand = kostenPerJaar / 12. kostenPerDagGemiddeld = kostenPerJaar / 365.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Watt naar kilowatt via /1000. Dag naar jaar via * gebruiksdagenPerJaar. Jaar naar maand via /12. Stroomprijs in euro/kWh.
4. Afrondingsregels
    INVUL: kWh op 2 decimalen; kosten op 2 decimalen; vermogen in W of kW met passende decimalen.

Output-contract

1. Primaire outputs
    INVUL: verbruikKwhPerDag, verbruikKwhPerJaar, kostenPerDag, kostenPerMaand, kostenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel vergelijking met alternatief apparaat; CO2-uitstoot bij stroommixfactor.
3. Formatregels voor UI
    INVUL: Vermogen als W of kW; energie als kWh; prijs als €/kWh; eurobedragen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vermogen < 0, gebruiksuren < 0, gebruiksuren > 24, gebruiksdagen > 366 of stroomprijs < 0 is ongeldig. Vermogen 0 is geldig.
2. Domeinbeperkingen
    INVUL: vermogenWatt >= 0; 0 <= gebruiksurenPerDag <= 24; 0 <= gebruiksdagenPerJaar <= 366; stroomprijsPerKwh >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig vermogen in.” / “Gebruiksuren moeten tussen 0 en 24 liggen.” / “Vul een geldige stroomprijs in.”

Testset

1. Basiscase
    INVUL: Vermogen 1000 W, 2 uur/dag, 365 dagen, prijs € 0,40/kWh. Verwacht 2 kWh/dag, 730 kWh/jaar, kosten € 292/jaar.
2. Edge-case
    INVUL: Vermogen 0 W. Verwacht verbruik en kosten 0.
3. Regresstest tegen bekende uitkomst
    INVUL: 500 W, 4 uur/dag, 100 dagen, € 0,30/kWh. Verwacht 200 kWh, kosten € 60.

Energiekosten berekenen

Bron-URL: https://www.externe-bron.nl/wonen/energiekosten-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van totale energiekosten op basis van stroomverbruik, gasverbruik, tarieven, vaste kosten en eventuele teruglevering.
2. Exacte formules/stappenvolgorde
    INVUL: kostenStroom = verbruikKwh * stroomprijsPerKwh. kostenGas = verbruikM3 * gasprijsPerM3. terugleverVergoeding = terugleverKwh * vergoedingPerKwh. vasteKostenTotaal = vasteKostenPerMaand * 12 of direct jaarbedrag. energiebelastingEnOpslagen = parameterTabelOfInvoer. totaalJaar = kostenStroom + kostenGas + vasteKostenTotaal + energiebelastingEnOpslagen - terugleverVergoeding - verminderingEnergiebelasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandbedragen naar jaar via *12. kWh en m³ per jaar. Tarieven in euro per eenheid. Jaar naar maand via /12.
4. Afrondingsregels
    INVUL: Kosten op 2 decimalen. Verbruik op 0 of 2 decimalen. Tarieven met 4 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kostenStroomPerJaar, kostenGasPerJaar, vasteKostenPerJaar, terugleverVergoeding, totaalKostenPerJaar, totaalKostenPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie variabele kosten, vaste kosten, belastingen, verminderingen en teruglevering.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; tarieven als €/kWh en €/m³; verbruik als kWh en m³.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verbruik of tarieven negatief is ongeldig, behalve teruglevering als aparte positieve invoer. Ontbrekende prijs bij positief verbruik is onvoldoende.
2. Domeinbeperkingen
    INVUL: verbruikKwh >= 0; verbruikM3 >= 0; tarieven >= 0; vaste kosten mogen negatief zijn alleen als expliciete korting.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig stroomverbruik in.” / “Vul een geldig gasverbruik in.” / “Vul geldige energietarieven in.”

Testset

1. Basiscase
    INVUL: Stroom 2.000 kWh à € 0,40, gas 1.000 m³ à € 1,20, vaste kosten € 20/mnd. Verwacht totaal € 2.240/jaar.
2. Edge-case
    INVUL: Verbruik 0, vaste kosten 0. Verwacht totaal € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: 1.000 kWh * € 0,30, 500 m³ * € 1,00, vaste € 120/jaar, vermindering € 100. Verwacht totaal € 820.

Geluid warmtepomp of airco

Bron-URL: https://www.externe-bron.nl/wonen/buitenunit-warmtepomp-airco-minimale-afstand-tot-erfgrens.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke minimale afstand tot de erfgrens nodig is zodat het geluidsniveau van een buitenunit onder een grenswaarde blijft.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik vrijeveld-afname: Lp2 = Lp1 - 20 * log10(r2 / r1) - demping. Los afstand op: r2 = r1 * 10^((Lp1 - demping - grenswaardeDb) / 20). Als geluidsvermogen Lw wordt gebruikt: Lp(r) = Lw - 20*log10(r) - 11 - demping als benadering hemisferische uitstraling; los op: r = 10^((Lw - 11 - demping - grenswaardeDb)/20).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geluid in dB(A). Afstand in meter. Geen tijd- of euroconversie.
4. Afrondingsregels
    INVUL: Afstand op 2 decimalen of naar boven op 0,1 meter. Geluidsniveau op 1 decimaal. Rond minimale afstand bij advies conservatief naar boven af.

Output-contract

1. Primaire outputs
    INVUL: minimaleAfstandMeter, geluidsniveauOpErfgrensDb, grenswaardeDb, voldoetAanGrenswaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel geluidsniveau bij 1, 2, 3, 5 en 10 meter. Optionele correctie voor omkasting/scherm.
3. Formatregels voor UI
    INVUL: Geluid als dB(A); afstand als m; ja/nee-uitkomst duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geluidsniveau ontbreekt is onvoldoende. Afstand referentie <= 0 is ongeldig. Grenswaarde ontbreekt is onvoldoende. Demping mag negatief alleen als reflectietoeslag expliciet wordt toegestaan.
2. Domeinbeperkingen
    INVUL: referentieAfstand > 0; grenswaardeDb realistisch bijvoorbeeld 0..120; geluidsniveauDb realistisch 0..140.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig geluidsniveau in.” / “Vul een geldige referentieafstand in.” / “Vul een geldige grenswaarde in.”

Testset

1. Basiscase
    INVUL: Lp1 = 50 dB(A) op 1 m, grens 40 dB(A), demping 0. Verwacht afstand 3,16 m.
2. Edge-case
    INVUL: Lp1 = 40 dB(A) op 1 m, grens 40. Verwacht afstand 1 m of lager; minimaal referentieafstand tonen als 1 m.
3. Regresstest tegen bekende uitkomst
    INVUL: Lw = 60 dB(A), grens 40, demping 0. Verwacht afstand 10^((60-11-40)/20)=2,82 m.

Geluidsniveau op afstand

Bron-URL: https://www.externe-bron.nl/wonen/buitenunit-warmtepomp-airco-geluidsniveau-op-afstand.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk geluidsniveau op een bepaalde afstand overblijft van een bron zoals warmtepomp of airco.
2. Exacte formules/stappenvolgorde
    INVUL: Als referentieniveau bekend: Lp2 = Lp1 - 20 * log10(r2 / r1) - demping + toeslagReflectie. Als geluidsvermogen bekend: Lp(r) = Lw - 20*log10(r) - 11 - demping + toeslagReflectie. Bij meerdere identieke bronnen: L_totaal = L_enkel + 10*log10(aantalBronnen).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geluid in dB(A), afstand in meter. Geen euro- of periodeconversie.
4. Afrondingsregels
    INVUL: Geluidsniveau op 1 decimaal. Afstand op 2 decimalen. Totaalniveau op 1 decimaal.

Output-contract

1. Primaire outputs
    INVUL: geluidsniveauOpAfstandDb, afstandMeter, bronNiveauDb, voldoetAanGrenswaarde indien grenswaarde is ingevuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel met niveaus op standaardafstanden; optioneel meerdere bronnen en dempingscomponenten.
3. Formatregels voor UI
    INVUL: Geluidsniveau als dB(A); afstand als m; logaritmische optelling niet als gewone som presenteren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Afstand <= 0, referentieafstand <= 0, geluidsniveau ontbreekt of aantal bronnen < 1 is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: afstandMeter > 0; referentieAfstand > 0; aantalBronnen >= 1; dB-waarden realistisch 0..140.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige afstand in.” / “Vul een geldig geluidsniveau in.” / “Aantal bronnen moet minimaal 1 zijn.”

Testset

1. Basiscase
    INVUL: 50 dB(A) op 1 m, afstand 2 m, geen demping. Verwacht 43,98 dB(A) circa 44,0.
2. Edge-case
    INVUL: Afstand gelijk referentieafstand. Verwacht hetzelfde niveau.
3. Regresstest tegen bekende uitkomst
    INVUL: Eén bron 40 dB(A) op afstand, 2 identieke bronnen. Verwacht totaal 43,0 dB(A).

Ramen isoleren met dubbel glas

Bron-URL: https://www.externe-bron.nl/wonen/energiebesparing-raam-isoleren.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel energie, CO2 en kosten worden bespaard door ramen te vervangen door beter isolerend glas.
2. Exacte formules/stappenvolgorde
    INVUL: besparingWarmteKwh = glasOppervlakM2 * (uWaardeOud - uWaardeNieuw) * graaddagen * 24 / 1000 * correctieFactor. besparingGasM3 = besparingWarmteKwh / kwhPerM3Gas / ketelRendement. kostenBesparingJaar = besparingGasM3 * gasprijsPerM3. co2BesparingKg = besparingGasM3 * emissieKgCO2PerM3Gas. nettoInvestering = investering - subsidie. terugverdientijd = nettoInvestering / kostenBesparingJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: W naar kWh via * uren /1000. Gas m³ naar kWh via parameter, bijvoorbeeld kwhPerM3Gas. Rendement als factor, percentage /100. Jaarbesparing.
4. Afrondingsregels
    INVUL: kWh en m³ op 0 of 1 decimaal; eurobedragen op 2 decimalen; terugverdientijd op 1 decimaal jaar.

Output-contract

1. Primaire outputs
    INVUL: besparingKwhWarmtePerJaar, besparingGasM3PerJaar, besparingEuroPerJaar, co2BesparingKgPerJaar, terugverdientijdJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie oude/nieuwe U-waarde, investering, subsidie en cumulatieve besparing.
3. Formatregels voor UI
    INVUL: Oppervlak als m²; U-waarde als W/m²K; energie als kWh/m³ gas; eurobedragen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oppervlak <= 0, U-waarden ontbreken, nieuwe U-waarde groter/gelijk oud geeft geen besparing maar is geldig met waarschuwing. Gasprijs < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: oppervlak > 0; uWaardeOud >= 0; uWaardeNieuw >= 0; graaddagen >= 0; ketelRendement > 0; netto investering >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig glasoppervlak in.” / “Vul geldige U-waarden in.” / “De nieuwe U-waarde levert geen besparing op.” / “Vul een geldige gasprijs in.”

Testset

1. Basiscase
    INVUL: Oppervlak 10 m², U oud 5,0, U nieuw 1,5, graaddagen 2800, correctie 1, gas 10 kWh/m³, rendement 1, prijs € 1/m³. Verwacht warmte 2.352 kWh, gas 235,2 m³, besparing € 235,20.
2. Edge-case
    INVUL: U oud = U nieuw. Verwacht besparing 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Warmtebesparing 1.000 kWh, 10 kWh/m³, gasprijs € 1,20. Verwacht 100 m³, € 120.

Stijging energiekosten

Bron-URL: https://www.externe-bron.nl/wonen/stijging-energiekosten-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel energiekosten stijgen of dalen door wijziging in energieprijzen, verbruik of vaste kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Oud: oudeKosten = oudeKwh * oudeStroomprijs + oudeM3 * oudeGasprijs + oudeVasteKosten. Nieuw: nieuweKosten = nieuweKwh * nieuweStroomprijs + nieuweM3 * nieuweGasprijs + nieuweVasteKosten. verschilEuro = nieuweKosten - oudeKosten. verschilPercentage = verschilEuro / oudeKosten * 100 als oudeKosten > 0. verschilPerMaand = verschilEuro / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Verbruik per jaar. Maandkosten naar jaar via *12. Jaarverschil naar maand via /12.
4. Afrondingsregels
    INVUL: Kosten op 2 decimalen. Percentage op 2 decimalen. Tarieven met 4 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudeEnergiekostenPerJaar, nieuweEnergiekostenPerJaar, stijgingEuroPerJaar, stijgingEuroPerMaand, stijgingPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing stroom, gas, vaste kosten; scenariovergelijking.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; stijging/daling duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatief verbruik of negatieve tarieven zijn ongeldig. Oude kosten 0 maakt percentage niet relevant, maar euroverschil blijft geldig.
2. Domeinbeperkingen
    INVUL: Verbruik >= 0; tarieven >= 0; vaste kosten mogen negatief alleen als kortingparameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige verbruiken in.” / “Vul geldige oude en nieuwe tarieven in.” / “Percentageverschil is niet relevant bij oude kosten van € 0.”

Testset

1. Basiscase
    INVUL: Oude kosten € 2.000, nieuwe kosten € 2.500. Verwacht stijging € 500, 25%, € 41,67/mnd.
2. Edge-case
    INVUL: Oude kosten € 0, nieuwe € 100. Verwacht euroverschil € 100, percentage niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: 1.000 kWh oud € 0,30, nieuw € 0,45, geen gas/vaste kosten. Verwacht stijging € 150, 50%.

Warmtepomp besparing & terugverdientijd

Bron-URL: https://www.externe-bron.nl/wonen/warmtepomp-besparing-terugverdientijd-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van jaarlijkse besparing en terugverdientijd van een warmtepomp ten opzichte van gasverwarming.
2. Exacte formules/stappenvolgorde
    INVUL: Bepaal huidige warmtebehoefte: warmteKwh = huidigGasM3 * kwhPerM3Gas * ketelRendement. Elektriciteitsverbruik warmtepomp: stroomWarmtepompKwh = warmteKwh / SCOP. Oude kosten: oudeKosten = huidigGasM3 * gasprijsPerM3 + oudeVasteKostenGas. Nieuwe kosten: nieuweKosten = stroomWarmtepompKwh * stroomprijsPerKwh + resterendGasM3 * gasprijsPerM3 + nieuweVasteKosten. besparingPerJaar = oudeKosten - nieuweKosten. nettoInvestering = aanschafEnInstallatie - subsidie. terugverdientijd = nettoInvestering / besparingPerJaar als besparing > 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Gas m³ naar kWh via kwhPerM3Gas. SCOP is factor. Jaarbedragen. Jaar naar maand via /12.
4. Afrondingsregels
    INVUL: kWh/m³ op 0 of 1 decimaal; eurobedragen op 2 decimalen; terugverdientijd op 1 decimaal jaar.

Output-contract

1. Primaire outputs
    INVUL: warmtebehoefteKwhPerJaar, stroomverbruikWarmtepompKwh, oudeKostenPerJaar, nieuweKostenPerJaar, besparingPerJaar, terugverdientijdJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: CO2-besparing; netto investering; cumulatieve kasstroom per jaar; gevoeligheid voor gas- en stroomprijs.
3. Formatregels voor UI
    INVUL: Energie als kWh en m³; SCOP met 2 decimalen; eurobedragen met 2 decimalen; terugverdientijd als x,x jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gasverbruik < 0, SCOP <= 0, prijzen < 0, investering < 0 of subsidie groter dan investering is ongeldig. Besparing <= 0 maakt terugverdientijd niet relevant.
2. Domeinbeperkingen
    INVUL: huidigGasM3 >= 0; SCOP > 0; kwhPerM3Gas > 0; 0 <= subsidie <= investering; prijzen >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig gasverbruik in.” / “SCOP moet groter zijn dan 0.” / “Vul geldige energieprijzen in.” / “Er is geen positieve besparing; terugverdientijd is niet relevant.”

Testset

1. Basiscase
    INVUL: Gas 1.000 m³, 10 kWh/m³, rendement 1, SCOP 4, gasprijs € 1,20, stroom € 0,30, investering € 6.000, subsidie € 1.000. Verwacht warmte 10.000 kWh, stroom 2.500 kWh, oude kosten € 1.200, nieuwe € 750, besparing € 450, terugverdientijd 11,1 jaar.
2. Edge-case
    INVUL: SCOP 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Netto investering € 5.000, besparing € 1.000/jaar. Verwacht terugverdientijd 5 jaar.

Woning verduurzamen

Bron-URL: https://www.externe-bron.nl/wonen/verduurzamen-terugverdientijd-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van totale investering, jaarlijkse besparing, CO2-besparing en terugverdientijd voor één of meerdere verduurzamingsmaatregelen.
2. Exacte formules/stappenvolgorde
    INVUL: Per maatregel: nettoInvestering_i = investering_i - subsidie_i. besparingEuro_i = besparingGasM3_i * gasprijs + besparingKwh_i * stroomprijs + overigeBesparing_i. co2Besparing_i = besparingGasM3_i * factorGas + besparingKwh_i * factorStroom. Totaal: nettoInvestering = Σ nettoInvestering_i, besparingPerJaar = Σ besparingEuro_i, terugverdientijd = nettoInvestering / besparingPerJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Besparingen per jaar. Gas in m³, stroom in kWh. CO2-factoren in kg per eenheid. Jaarbesparing naar maand via /12.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen; energie op 0 of 1 decimaal; CO2 op 0 decimalen kg; terugverdientijd op 1 decimaal.

Output-contract

1. Primaire outputs
    INVUL: totaleInvestering, totaleSubsidie, nettoInvestering, besparingPerJaar, besparingPerMaand, terugverdientijdJaren, co2BesparingKgPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per maatregel; cumulatieve besparing; rangschikking op terugverdientijd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; energie als kWh/m³; terugverdientijd als x,x jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen maatregelen is onvoldoende. Investering of subsidie negatief is ongeldig. Subsidie groter dan investering per maatregel is ongeldig tenzij expliciet toegestaan. Besparing <= 0 maakt terugverdientijd niet relevant.
2. Domeinbeperkingen
    INVUL: investering_i >= 0; 0 <= subsidie_i <= investering_i; besparingen mogen negatief alleen als meerverbruik expliciet wordt toegestaan.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Voeg minimaal één maatregel toe.” / “Vul geldige investeringsbedragen in.” / “Subsidie mag niet hoger zijn dan de investering.” / “Er is geen positieve besparing; terugverdientijd is niet relevant.”

Testset

1. Basiscase
    INVUL: Maatregel A investering € 5.000, subsidie € 1.000, besparing € 500/jaar. Verwacht netto investering € 4.000, terugverdientijd 8 jaar.
2. Edge-case
    INVUL: Besparing € 0. Verwacht terugverdientijd niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Twee maatregelen: netto € 2.000 + € 3.000, besparing € 200 + € 300. Verwacht totaal netto € 5.000, besparing € 500, terugverdientijd 10 jaar.

Zonnepanelen terugverdientijd

Bron-URL: https://www.externe-bron.nl/wonen/zonnepanelen-terugverdientijd-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van opbrengst, jaarlijkse besparing, terugleveropbrengst en terugverdientijd van zonnepanelen.
2. Exacte formules/stappenvolgorde
    INVUL: jaarOpbrengstKwh = aantalPanelen * vermogenWpPerPaneel * opbrengstFactorKwhPerWp. directEigenVerbruikKwh = min(jaarOpbrengstKwh * eigenVerbruikPercentage/100, jaarVerbruikKwh). terugleveringKwh = max(0, jaarOpbrengstKwh - directEigenVerbruikKwh). waardeEigenVerbruik = directEigenVerbruikKwh * stroomprijsPerKwh. waardeTeruglevering = terugleveringKwh * terugleververgoedingPerKwh. jaarlijkseOpbrengstEuro = waardeEigenVerbruik + waardeTeruglevering - jaarlijkseExtraKosten. nettoInvestering = investering - subsidie. terugverdientijd = nettoInvestering / jaarlijkseOpbrengstEuro.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Wp naar jaaropbrengst via opbrengstfactor, bijvoorbeeld kWh per Wp per jaar. Percentages delen door 100. Jaaropbrengst naar maand via /12 voor indicatie.
4. Afrondingsregels
    INVUL: kWh op 0 decimalen; eurobedragen op 2 decimalen; terugverdientijd op 1 decimaal; percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: jaarOpbrengstKwh, directEigenVerbruikKwh, terugleveringKwh, jaarlijkseOpbrengstEuro, nettoInvestering, terugverdientijdJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Waarde eigen verbruik, waarde teruglevering, cumulatieve opbrengst per jaar, CO2-besparing.
3. Formatregels voor UI
    INVUL: Vermogen als Wp; energie als kWh; tarieven als €/kWh; eurobedragen met 2 decimalen; terugverdientijd als x,x jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aantal panelen < 0, vermogen < 0, opbrengstfactor < 0, investering < 0, stroomprijs/terugleververgoeding < 0 is ongeldig. Jaarlijkse opbrengst <= 0 maakt terugverdientijd niet relevant.
2. Domeinbeperkingen
    INVUL: aantalPanelen >= 0; vermogenWpPerPaneel >= 0; 0 <= eigenVerbruikPercentage <= 100; 0 <= subsidie <= investering; tarieven >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aantal zonnepanelen in.” / “Vul een geldig paneelvermogen in.” / “Eigen verbruik moet tussen 0% en 100% liggen.” / “Er is geen positieve opbrengst; terugverdientijd is niet relevant.”

Testset

1. Basiscase
    INVUL: 10 panelen, 400 Wp, opbrengstfactor 0,85 kWh/Wp, eigen verbruik 50%, stroomprijs € 0,30, terugleververgoeding € 0,10, investering € 5.000. Verwacht opbrengst 3.400 kWh, eigen 1.700 kWh, teruglevering 1.700 kWh, opbrengst € 680, terugverdientijd 7,4 jaar.
2. Edge-case
    INVUL: Aantal panelen 0. Verwacht opbrengst 0, terugverdientijd niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaaropbrengst 3.000 kWh, alles eigen verbruik, prijs € 0,40, netto investering € 6.000. Verwacht opbrengst € 1.200, terugverdientijd 5 jaar.