Werk, Inkomen & Ontslag — Logica Invulblad

Categorie-slug: werk-inkomen-ontslag
Aantal tools in dit invulblad: 60

Algemene heffingskorting

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/algemene-heffingskorting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de algemene heffingskorting op basis van belastingjaar, leeftijd/AOW-status en verzamelinkomen of toetsingsinkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Haal uit box1Parameters[jaar].algemeneHeffingskorting de maximale korting, afbouwgrens, afbouwpercentage en minimum. Formule: als inkomen <= afbouwVanaf, dan korting = maximumKorting; anders korting = max(minimumKorting, maximumKorting - (inkomen - afbouwVanaf) * afbouwPercentage / 100). Voor AOW-gerechtigden gebruik aparte AOW-tabel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen altijd per kalenderjaar. Maandinkomen naar jaar via * 12. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Interne berekening zonder tussentijdse afronding. Output op hele euro’s of 2 decimalen volgens fiscale parameter; standaard 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: algemeneHeffingskorting, maximumKorting, afbouwBedrag, toegepastAfbouwPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing afbouw: inkomen, afbouwgrens, inkomen boven grens, korting vóór/na afbouw.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 12,34%; belastingjaar en AOW-status tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0 is ongeldig. Ontbrekend belastingjaar of ontbrekende parameter is onvoldoende.
2. Domeinbeperkingen
    INVUL: inkomen >= 0; belastingjaar moet bestaan in box1Parameters; AOW-status verplicht.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Kies een belastingjaar.” / “Voor dit jaar ontbreken de parameters voor de algemene heffingskorting.”

Testset

1. Basiscase
    INVUL: Maximum € 3.000, afbouw vanaf € 25.000, afbouw 5%, inkomen € 30.000. Verwacht korting € 2.750.
2. Edge-case
    INVUL: Inkomen onder afbouwgrens. Verwacht maximale korting.
3. Regresstest tegen bekende uitkomst
    INVUL: Maximum € 3.000, afbouw vanaf € 20.000, afbouw 6%, inkomen € 70.000. Verwacht € 0 bij minimum 0.

Arbeidskorting

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/arbeidskorting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de arbeidskorting op basis van arbeidsinkomen, belastingjaar en AOW-status.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik schijventabel box1Parameters[jaar].arbeidskorting. Bepaal per inkomensschijf de opbouw/afbouw: korting = basisSchijf + (arbeidsinkomen - schijfVanaf) * percentage / 100, begrens tussen 0 en maximumArbeidskorting. Bij afbouw: korting = max(0, maximum - (arbeidsinkomen - afbouwVanaf) * afbouwPercentage / 100).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Arbeidsinkomen per kalenderjaar. Maandloon naar jaar via *12, inclusief vakantiegeld/bonus indien opgegeven.
4. Afrondingsregels
    INVUL: Output op 2 decimalen of hele euro’s via fiscale parameter. Interne schijfberekening zonder afronding.

Output-contract

1. Primaire outputs
    INVUL: arbeidskorting, arbeidsinkomen, opbouwOfAfbouw, toegepasteSchijf.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijvenspecificatie en afbouwberekening.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar/AOW-status tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Arbeidsinkomen < 0 ongeldig. Geen arbeidsinkomen betekent korting € 0. Ontbrekende jaartabel onvoldoende.
2. Domeinbeperkingen
    INVUL: arbeidsinkomen >= 0; jaar moet in parameterbestand bestaan.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig arbeidsinkomen in.” / “Voor dit jaar ontbreken arbeidskortingparameters.”

Testset

1. Basiscase
    INVUL: Inkomen € 20.000, percentage 10%, max € 3.000. Verwacht € 2.000.
2. Edge-case
    INVUL: Arbeidsinkomen € 0. Verwacht arbeidskorting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maximum € 5.000, afbouw vanaf € 40.000, afbouw 6%, inkomen € 50.000. Verwacht € 4.400.

Autokosten met kilometer vergoeding

Bron-URL: https://www.externe-bron.nl/modules/werken/autokosten-met-kilometer-vergoeding.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een kilometervergoeding de werkelijke autokosten dekt en wat het netto tekort of voordeel is.
2. Exacte formules/stappenvolgorde
    INVUL: jaarkilometers = kmPerDag * reisdagenPerWeek * werkwekenPerJaar. vergoeding = jaarkilometers * vergoedingPerKm. variabeleKosten = jaarkilometers * variabeleKostenPerKm. vasteKosten = verzekering + wegenbelasting + onderhoudVast + afschrijving + overigeVasteKosten. totaleAutokosten = vasteKosten + variabeleKosten. saldo = vergoeding - totaleAutokosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Daggemiddelde naar jaar via * reisdagenPerWeek * werkwekenPerJaar. Maandkosten naar jaar via *12.
4. Afrondingsregels
    INVUL: Kilometerbedragen op 3 decimalen; euro-output op 2 decimalen; kilometers op hele km of 1 decimaal.

Output-contract

1. Primaire outputs
    INVUL: jaarkilometers, totaleVergoeding, totaleAutokosten, saldo, kostenPerKm.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing vaste kosten, variabele kosten en vergoeding.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; kilometervergoeding als € 0,23/km.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Kilometers, kosten of vergoeding < 0 ongeldig. Ontbrekende reisdagen of weken is onvoldoende.
2. Domeinbeperkingen
    INVUL: kmPerDag >= 0; 0 <= reisdagenPerWeek <= 7; 0 <= werkwekenPerJaar <= 53.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige kilometers in.” / “Vul geldige reisdagen en werkweken in.” / “Kosten en vergoeding mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: 50 km/dag, 5 dagen, 46 weken, vergoeding € 0,23/km. Verwacht 11.500 km, vergoeding € 2.645.
2. Edge-case
    INVUL: 0 km. Verwacht kosten/vergoeding uit km € 0, vaste kosten blijven meetellen indien ingevuld.
3. Regresstest tegen bekende uitkomst
    INVUL: 10.000 km, kosten € 0,30/km, vergoeding € 0,21/km. Verwacht saldo -€ 900.

Belasting box 1 in 2026 t.o.v. 2025

Bron-URL: https://www.externe-bron.nl/inkomen/belasting-box1-verschil.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van inkomstenbelasting en premies volksverzekeringen in box 1 tussen twee belastingjaren.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken per jaar: belastbaarBox1 = inkomenWerkWoning - aftrekposten. Pas schijven toe uit box1Parameters[jaar].schijven: belastingVoorKortingen = Σ schijfDeel * tarief. Bereken heffingskortingen volgens jaartabel. belastingNaKortingen = max(0, belastingVoorKortingen - heffingskortingen). verschil = belastingJaar2 - belastingJaar1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per kalenderjaar. Maandbedragen naar jaar via *12.
4. Afrondingsregels
    INVUL: Belastingbedragen op 2 decimalen of hele euro’s via fiscale parameter. Verschil op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: belastingJaar1, belastingJaar2, verschilBelasting, nettoVerschil, heffingskortingenJaar1, heffingskortingenJaar2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijventabel per jaar en vergelijking heffingskortingen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaren in kolommen; positief verschil = meer belasting.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0 ongeldig. Ontbrekende parameters voor één van de jaren onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomen en aftrekposten >= 0; belastingjaren aanwezig in parameterbestand.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Voor één van de jaren ontbreken box 1-parameters.”

Testset

1. Basiscase
    INVUL: Jaar 1 belasting € 10.000, jaar 2 € 9.500. Verwacht verschil -€ 500.
2. Edge-case
    INVUL: Inkomen € 0. Verwacht belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Inkomen € 50.000, vlak tarief 40%, korting € 3.000. Verwacht belasting € 17.000.

Belasting extra inkomen

Bron-URL: https://www.externe-bron.nl/modules/werken/belasting-extra-inkomen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel belasting en verlies aan kortingen/toeslagen ontstaat door extra inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken huidig netto: nettoHuidig = brutoHuidig - box1Belasting(brutoHuidig) + toeslagenHuidig. Bereken nieuw netto: nettoNieuw = brutoHuidig + extraInkomen - box1Belasting(brutoHuidig + extraInkomen) + toeslagenNieuw. nettoExtra = nettoNieuw - nettoHuidig. marginaleDruk = 1 - nettoExtra / extraInkomen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Extra inkomen per jaar. Maandbedrag naar jaar via *12. Output kan per jaar en maand worden getoond.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Marginale druk op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: extraBrutoInkomen, extraBelasting, verliesHeffingskortingen, verliesToeslagen, nettoExtraInkomen, marginaleDruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na extra inkomen.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar en maand; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Extra inkomen < 0 ongeldig voor deze tool; gebruik inkomenswijziging-tool voor daling. Ontbrekende jaartabel onvoldoende.
2. Domeinbeperkingen
    INVUL: Bruto inkomen >= 0; extra inkomen >= 0; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig huidig inkomen in.” / “Vul een positief extra inkomen in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Extra inkomen € 1.000, extra belasting € 400, geen toeslagenverlies. Verwacht netto extra € 600, marginale druk 40%.
2. Edge-case
    INVUL: Extra inkomen € 0. Verwacht netto extra € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Extra € 10.000, belasting € 3.700, verlies toeslagen € 1.300. Verwacht netto € 5.000, druk 50%.

Belasting teruggave voor jongeren

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/bijbaan-vakantiewerk-stage-belasting-terugkrijgen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Schatting maken van terug te krijgen loonheffing voor jongeren met bijbaan, vakantiewerk of stage.
2. Exacte formules/stappenvolgorde
    INVUL: jaarinkomen = loon + vakantiegeld + stagevergoeding + overigeArbeidsinkomsten. Bereken verschuldigde box 1-belasting en premies minus heffingskortingen. teruggaaf = max(0, ingehoudenLoonheffing - verschuldigdeBelasting). bijTeBetalen = max(0, verschuldigdeBelasting - ingehoudenLoonheffing).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaar via gewerkte maanden. Uurloon naar loon via uurloon * uren. Vakantiegeld meestal brutoloon * vakantiegeldPercentage / 100.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Belasting eventueel hele euro’s volgens parameter.

Output-contract

1. Primaire outputs
    INVUL: jaarinkomen, ingehoudenLoonheffing, verschuldigdeBelasting, verwachteTeruggaaf, eventueelBijTeBetalen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie loon, vakantiegeld, heffingskortingen en loonheffing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; conclusie “teruggaaf” of “bijbetalen”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Loon of loonheffing < 0 ongeldig. Geen inkomen ingevuld is onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomen en inhoudingen >= 0; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Vul de ingehouden loonheffing in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Ingehouden loonheffing € 500, verschuldigde belasting € 100. Verwacht teruggaaf € 400.
2. Edge-case
    INVUL: Geen loonheffing ingehouden. Verwacht teruggaaf € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarinkomen onder heffingskorting, ingehouden € 300. Verwacht teruggaaf € 300.

Bijstandsuitkering

Bron-URL: https://www.externe-bron.nl/inkomen/bijstandsuitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de bijstandsnorm en eventuele aanvullende bijstandsuitkering op basis van leefsituatie, leeftijd en inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek bijstandsnorm in socialeZekerheidParameters[datum].bijstand op basis van leefsituatie. inAanmerkingTeNemenInkomen = inkomen - vrijlatingen. uitkering = max(0, bijstandsnorm - inAanmerkingTeNemenInkomen). Vermogenstoets: indien vermogen > vermogensgrens, dan uitkering 0 of waarschuwing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bijstandsnormen per maand. Jaarinkomen naar maand via /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; uitkering per maand en per jaar tonen.

Output-contract

1. Primaire outputs
    INVUL: bijstandsnormPerMaand, inAanmerkingTeNemenInkomen, aanvullendeBijstand, vermogenstoets.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Norm, inkomstenkorting, vrijlatingen en vermogenstoets.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand met 2 decimalen; leefsituatie tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen/vermogen < 0 ongeldig. Leefsituatie ontbreekt onvoldoende. Ontbrekende normtabel onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd en leefsituatie moeten binnen normtabel vallen; vermogenstoets verplicht.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een leefsituatie.” / “Vul een geldig inkomen en vermogen in.” / “Voor deze datum ontbreken bijstandsnormen.”

Testset

1. Basiscase
    INVUL: Norm € 1.200, inkomen € 500. Verwacht bijstand € 700.
2. Edge-case
    INVUL: Inkomen hoger dan norm. Verwacht bijstand € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Norm € 1.500, vrijlating € 100, inkomen € 800. In aanmerking € 700, uitkering € 800.

Bijtelling en kosten auto van de zaak

Bron-URL: https://www.externe-bron.nl/inkomen/bijtelling-auto-van-de-zaak.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van fiscale bijtelling, netto kosten en eventueel werkgevers-/werknemerskosten van een auto van de zaak.
2. Exacte formules/stappenvolgorde
    INVUL: brutoBijtelling = cataloguswaarde * bijtellingsPercentage / 100 * privéGebruikFactor. nettoKostenBijtelling = brutoBijtelling * marginaalTarief / 100. eigenBijdrageAftrekbaar = min(eigenBijdragePriveGebruik, brutoBijtelling). belastbareBijtelling = max(0, brutoBijtelling - eigenBijdrageAftrekbaar). nettoKosten = belastbareBijtelling * marginaalTarief / 100 + nietAftrekbareEigenBijdrage.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bijtelling per jaar. Maandbedrag = jaarbedrag /12. Bijtellingpercentage via autoParameters[jaar] of invoer.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoBijtelling, belastbareBijtelling, nettoKostenBijtellingPerJaar, nettoKostenPerMaand, eigenBijdrage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Cataloguswaarde, bijtellingspercentage, tarief, eigen bijdrage en privégebruikstatus.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar en maand; percentages tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Cataloguswaarde < 0, bijtellingpercentage < 0, tarief buiten 0..100 ongeldig. Bij privégebruik onder fiscale grens kan bijtelling 0 zijn.
2. Domeinbeperkingen
    INVUL: Cataloguswaarde >= 0; percentages 0..100; eigen bijdrage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige cataloguswaarde in.” / “Vul een geldig bijtellingspercentage in.” / “Vul een geldig belastingtarief in.”

Testset

1. Basiscase
    INVUL: Cataloguswaarde € 40.000, bijtelling 22%, tarief 40%. Bruto € 8.800, netto € 3.520.
2. Edge-case
    INVUL: Geen privégebruik/bijtelling 0. Verwacht netto kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Cataloguswaarde € 30.000, 10%, tarief 50%. Verwacht netto € 1.500.

Bijtelling en kosten fiets van de zaak

Bron-URL: https://www.externe-bron.nl/inkomen/bijtelling-fiets-van-de-zaak.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de bruto en netto bijtelling voor een fiets van de zaak.
2. Exacte formules/stappenvolgorde
    INVUL: brutoBijtelling = consumentenAdviesPrijs * bijtellingsPercentageFiets / 100. belastbareBijtelling = max(0, brutoBijtelling - eigenBijdrage). nettoKosten = belastbareBijtelling * marginaalTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bijtelling per jaar. Maandlast = jaarbedrag /12. Percentage uit fietsParameters[jaar] of invoer.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoBijtellingFiets, belastbareBijtelling, nettoKostenPerJaar, nettoKostenPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Fietswaarde, bijtellingspercentage, eigen bijdrage en belastingtarief.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand en jaar; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Fietswaarde < 0, eigen bijdrage < 0, tarief buiten 0..100 ongeldig.
2. Domeinbeperkingen
    INVUL: Waarde >= 0; percentages 0..100; bijtelling niet negatief.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige fietswaarde in.” / “Vul een geldig belastingtarief in.”

Testset

1. Basiscase
    INVUL: Fiets € 3.000, bijtelling 7%, tarief 40%. Bruto € 210, netto € 84.
2. Edge-case
    INVUL: Eigen bijdrage hoger dan bijtelling. Verwacht belastbare bijtelling € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Fiets € 2.000, 7%, tarief 50%. Verwacht netto € 70.

Box 1 belastingdruk

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/box1-belastingdruk-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van gemiddelde en marginale belastingdruk in box 1.
2. Exacte formules/stappenvolgorde
    INVUL: belasting = box1Belasting(inkomen) - heffingskortingen. gemiddeldeDruk = belasting / inkomen * 100 indien inkomen > 0. marginaleDruk = (belasting(inkomen + delta) - belasting(inkomen)) / delta * 100, waarbij delta standaard € 1.000.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per jaar. Maand naar jaar via *12.
4. Afrondingsregels
    INVUL: Belasting op 2 decimalen; drukpercentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: box1Belasting, nettoInkomen, gemiddeldeBelastingdruk, marginaleBelastingdruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijven, heffingskortingen en marginale-druktabel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0 ongeldig. Inkomen 0 geeft gemiddelde druk 0 of “niet relevant”.
2. Domeinbeperkingen
    INVUL: Inkomen >= 0; delta > 0; box1Parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Voor dit jaar ontbreken box 1-parameters.”

Testset

1. Basiscase
    INVUL: Inkomen € 50.000, belasting € 15.000. Verwacht gemiddelde druk 30%.
2. Edge-case
    INVUL: Inkomen € 0. Verwacht belasting € 0, druk 0%/niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Belasting bij € 50.000 = € 15.000, bij € 51.000 = € 15.400. Verwacht marginale druk 40%.

Box 1 inkomen & belasting uitstellen

Bron-URL: https://www.externe-bron.nl/inkomen/box1-inkomen-belasting-uitstellen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van belastingdruk wanneer box 1-inkomen of aftrekposten worden verschoven tussen jaren.
2. Exacte formules/stappenvolgorde
    INVUL: Scenario direct: bereken belasting jaar 1 en jaar 2 zonder uitstel. Scenario uitstel: inkomenJaar1Nieuw = inkomenJaar1 - uitgesteldInkomen; inkomenJaar2Nieuw = inkomenJaar2 + uitgesteldInkomen. Bereken belastingScenarioDirect en belastingScenarioUitstel. voordeelUitstel = belastingDirect - belastingUitstel, eventueel plus contante waarde: cwVoordeel = voordeel / (1+discontovoet)^jaren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomens per kalenderjaar. Discontovoet per jaar.
4. Afrondingsregels
    INVUL: Belasting en voordeel op 2 decimalen. Percentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: belastingZonderUitstel, belastingMetUitstel, belastingVoordeel, contanteWaardeVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarvergelijking met inkomen, aftrek, schijven en kortingen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; positief voordeel duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitgesteld inkomen < 0 of groter dan inkomen jaar 1 ongeldig. Ontbrekende jaartabellen onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomens >= 0; uitstelbedrag binnen inkomen; jaren beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige inkomens in.” / “Het uit te stellen inkomen kan niet hoger zijn dan het inkomen in jaar 1.” / “Voor één van de jaren ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Directe belasting € 20.000, uitstelbelasting totaal € 18.000. Verwacht voordeel € 2.000.
2. Edge-case
    INVUL: Uitstelbedrag € 0. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vlak tarief 40%, uitstel tussen gelijke tarieven. Verwacht nominaal voordeel € 0.

Brandstofkosten berekenen

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/brandstofkosten-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van brandstofkosten op basis van afstand, verbruik en brandstofprijs.
2. Exacte formules/stappenvolgorde
    INVUL: Bij verbruik in l/100 km: liters = afstandKm * verbruikPer100Km / 100. Bij km/l: liters = afstandKm / kmPerLiter. kosten = liters * prijsPerLiter. Kosten per km = kosten / afstandKm.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Dagafstand naar jaar via werkdagen. Prijs per liter. Afstanden in km.
4. Afrondingsregels
    INVUL: Liters op 2 decimalen; kosten op 2 decimalen; kosten/km op 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: litersBrandstof, totaleBrandstofkosten, kostenPerKm, afstandKm.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kosten per dag/week/maand/jaar indien frequentie ingevuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; liters met 2 decimalen; km met 1 of 0 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Afstand < 0, verbruik <= 0, prijs < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Afstand >= 0; verbruik > 0; prijs >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige afstand in.” / “Vul een positief verbruik in.” / “Vul een geldige brandstofprijs in.”

Testset

1. Basiscase
    INVUL: 100 km, 6 l/100 km, € 2/l. Verwacht 6 liter, € 12.
2. Edge-case
    INVUL: 0 km. Verwacht kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: 500 km, 5 l/100 km, € 1,80/l. Verwacht 25 liter, € 45.

Bruto jaarinkomen

Bron-URL: https://www.externe-bron.nl/inkomen/bruto-jaarinkomen-berekenen-uit-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Benaderen welk bruto jaarinkomen hoort bij gewenst netto jaar- of maandinkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik inverse bruto-netto via numerieke zoekmethode. Binaire zoek tussen 0 en bovengrens. Per stap: netto = brutoNetto(bruto, jaar, loonheffingskorting, pensioenpremie, etc.). Stop als abs(netto - gewenstNetto) < € 0,01. brutoJaarinkomen = gevondenBruto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Gewenst netto per maand naar jaar via *12. Bruto jaar naar maand via /12.
4. Afrondingsregels
    INVUL: Bruto inkomen op 2 decimalen; iteratietolerantie € 0,01.

Output-contract

1. Primaire outputs
    INVUL: brutoJaarinkomen, brutoMaandinkomen, gewenstNetto, berekendNetto, loonheffing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Loonstrookachtige specificatie en gebruikte parameters.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gewenst netto < 0 ongeldig. Ontbrekende fiscale parameters onvoldoende. Als netto niet haalbaar binnen bovengrens: fout.
2. Domeinbeperkingen
    INVUL: Netto >= 0; max iteraties; bovengrens automatisch verhogen tot haalbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig netto inkomen in.” / “Het bruto inkomen kon niet worden bepaald.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Vlak tarief 40%, geen korting, gewenst netto € 30.000. Verwacht bruto € 50.000.
2. Edge-case
    INVUL: Netto € 0. Verwacht bruto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Tarief 50%, korting 0, netto € 2.000/mnd. Verwacht bruto € 4.000/mnd.

Bruto-netto inkomen

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/bruto-netto-inkomen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto inkomen uit bruto inkomen op jaarbasis.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaarinkomen = brutoPeriodiek * periodenPerJaar + vakantiegeld + bonus + overigeBeloningen. Trek werknemerspremies/pensioen af indien van toepassing. Bereken loon-/inkomstenbelasting via box 1-schijven en heffingskortingen. nettoJaarinkomen = brutoJaarinkomen - loonheffing - werknemersbijdragen + nettoVergoedingen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand *12, vierweken *13, week *52, dag * werkdagen, uur * uren.
4. Afrondingsregels
    INVUL: Output op 2 decimalen. Periodieke netto bedragen herberekenen uit jaarbedrag of per periode volgens gekozen methode.

Output-contract

1. Primaire outputs
    INVUL: brutoJaarinkomen, nettoJaarinkomen, nettoPerMaand, loonheffing, heffingskortingen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie bruto componenten, aftrekposten, belasting en netto componenten.
3. Formatregels voor UI
    INVUL: Eurobedragen per periode en jaar; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto inkomen < 0 ongeldig. Ontbrekende frequentie of jaar onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; periodenPerJaar > 0; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto inkomen in.” / “Kies een betaalperiode.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Bruto € 50.000, belasting € 15.000. Verwacht netto € 35.000.
2. Edge-case
    INVUL: Bruto € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vlak tarief 40%, korting € 3.000, bruto € 50.000. Verwacht netto € 33.000.

Bruto-netto kilometervergoeding

Bron-URL: https://www.externe-bron.nl/inkomen/kilometervergoeding-bruto-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van een kilometervergoeding netto/onbelast is en welk deel belast wordt.
2. Exacte formules/stappenvolgorde
    INVUL: totaleKm = kmPerPeriode * perioden. onbelasteVergoedingPerKm = min(vergoedingPerKm, fiscaleVrijeKmVergoeding). belasteVergoedingPerKm = max(0, vergoedingPerKm - fiscaleVrijeKmVergoeding). onbelast = totaleKm * onbelasteVergoedingPerKm. brutoBelast = totaleKm * belasteVergoedingPerKm. nettoBelastDeel = brutoBelast * (1 - marginaalTarief/100). nettoTotaal = onbelast + nettoBelastDeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kilometers per dag/week/maand naar jaar. Fiscale vrije vergoeding via loonParameters[jaar].
4. Afrondingsregels
    INVUL: Km-vergoeding op 3 decimalen; eurobedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleVergoedingBruto, onbelastDeel, belastDeelBruto, nettoVergoeding, belastingOverBelastDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Km, vergoeding per km, fiscale vrije ruimte en tarief.
3. Formatregels voor UI
    INVUL: Euro per km als € 0,230; totalen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Km < 0, vergoeding < 0, tarief buiten 0..100 ongeldig.
2. Domeinbeperkingen
    INVUL: Km en vergoeding >= 0; vrije vergoeding >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige kilometers in.” / “Vul een geldige kilometervergoeding in.” / “Voor dit jaar ontbreekt de fiscale vrije kilometervergoeding.”

Testset

1. Basiscase
    INVUL: 1.000 km, vergoeding € 0,30, vrij € 0,23, tarief 40%. Onbelast € 230, belast bruto € 70, netto totaal € 272.
2. Edge-case
    INVUL: Vergoeding lager dan vrij bedrag. Verwacht geen belast deel.
3. Regresstest tegen bekende uitkomst
    INVUL: 10.000 km, vergoeding € 0,25, vrij € 0,20, tarief 50%. Verwacht netto € 2.250.

Bruto-netto partneralimentatie

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/bruto-netto-partneralimentatie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto effect van partneralimentatie voor betaler en ontvanger.
2. Exacte formules/stappenvolgorde
    INVUL: Voor betaler: belastingZonder = box1Belasting(inkomen), belastingMet = box1Belasting(inkomen - aftrekbarePartneralimentatie), fiscaalVoordeel = belastingZonder - belastingMet, nettoKosten = alimentatie - fiscaalVoordeel. Voor ontvanger: belastingZonder = box1Belasting(inkomen), belastingMet = box1Belasting(inkomen + alimentatie), extraBelasting = belastingMet - belastingZonder, nettoOntvangen = alimentatie - extraBelasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alimentatie per maand naar jaar via *12. Output per maand en jaar.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Belasting volgens fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: brutoPartneralimentatie, nettoKostenBetaler, fiscaalVoordeelBetaler, nettoOntvangenOntvanger, extraBelastingOntvanger.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na alimentatie voor beide partijen.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand en jaar; betaler/ontvanger gescheiden tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Alimentatie < 0, inkomen < 0, ontbrekende fiscale parameters ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Alimentatie en inkomens >= 0; aftrek alleen voor partneralimentatie, niet kinderalimentatie.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig alimentatiebedrag in.” / “Vul geldige inkomens in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Alimentatie € 12.000, tarief betaler 40%, ontvanger 30%. Netto kosten betaler € 7.200, netto ontvanger € 8.400.
2. Edge-case
    INVUL: Alimentatie € 0. Verwacht alle effecten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Alimentatie € 1.000/mnd, voordeel betaler € 400/mnd. Netto kosten € 600/mnd.

Bruto-netto rekentool keuze

Bron-URL: https://www.externe-bron.nl/inkomen/bruto-netto-rekentool-keuze.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen welke bruto-netto rekentool gebruikt moet worden op basis van inkomenssoort en gewenste richting.
2. Exacte formules/stappenvolgorde
    INVUL: Geen financiële berekening; beslisboom. Als inkomenssoort = salaris en richting bruto->netto, verwijs naar bruto-netto salaris. Als netto->bruto, verwijs naar brutoloon/bruto jaarinkomen. Als uitkering, verwijs naar uitkering bruto-netto. Als uurloon, verwijs naar uurloon bruto-netto. Als ontslagvergoeding, verwijs naar ontslagvergoeding netto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant; alleen keuzehulp. Eventuele bedragen blijven ongewijzigd.
4. Afrondingsregels
    INVUL: Niet relevant.

Output-contract

1. Primaire outputs
    INVUL: aanbevolenTool, reden, benodigdeInvoer, nietGeschikteTools.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Keuzetabel per inkomenssoort/richting.
3. Formatregels voor UI
    INVUL: Tekstuele output; toolnaam exact tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende inkomenssoort of richting is onvoldoende. Onbekende inkomenssoort geeft algemene bruto-netto tool.
2. Domeinbeperkingen
    INVUL: Inkomenssoort moet uit toegestane enum komen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies welk soort inkomen u wilt berekenen.” / “Kies of u van bruto naar netto of van netto naar bruto wilt rekenen.”

Testset

1. Basiscase
    INVUL: Inkomenssoort salaris, richting bruto-netto. Verwacht aanbevolen tool Bruto-netto salaris.
2. Edge-case
    INVUL: Onbekend. Verwacht fallback Bruto-netto inkomen.
3. Regresstest tegen bekende uitkomst
    INVUL: Ontslagvergoeding. Verwacht tool Ontslag- of transitievergoeding netto.

Bruto-netto salaris

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/bruto-netto-salaris.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto salaris uit bruto salaris per periode.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaar = brutoSalarisPerPeriode * periodenPerJaar + vakantiegeld + bonus + vasteToeslagen. pensioenWerknemer = brutoPensioengrondslag * pensioenPercentage / 100 of invoer. belastbaarLoon = brutoJaar - pensioenWerknemer - overigeAftrek. Bereken loonheffing via jaarloonmethode: box1-schijven minus heffingskortingen. nettoJaar = brutoJaar - loonheffing - pensioenWerknemer - overigeInhoudingen + nettoVergoedingen. nettoPerPeriode = nettoJaar / periodenPerJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand *12, 4-weken *13, week *52. Vakantiegeld meestal brutoSalaris * vakantiegeldPercentage / 100.
4. Afrondingsregels
    INVUL: Output op 2 decimalen; loonheffing volgens parameter eventueel hele euro’s.

Output-contract

1. Primaire outputs
    INVUL: nettoSalarisPerPeriode, nettoJaarSalaris, loonheffing, pensioenInhouding, brutoJaarloon.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Loonstrookcomponenten: bruto, vakantiegeld, pensioen, loonheffing, kortingen, netto.
3. Formatregels voor UI
    INVUL: Eurobedragen per periode en jaar; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto salaris < 0, periodenPerJaar <= 0, ontbrekend jaar ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Bruto en inhoudingen >= 0; percentages 0..100; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto salaris in.” / “Kies een betaalperiode.” / “Voor dit jaar ontbreken loonbelastingparameters.”

Testset

1. Basiscase
    INVUL: Bruto jaar € 50.000, inhouding belasting € 15.000, geen overige. Verwacht netto € 35.000.
2. Edge-case
    INVUL: Bruto € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vlak tarief 40%, korting € 3.000, bruto € 50.000. Verwacht netto € 33.000.

Brutoloon

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/brutoloon.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk brutoloon nodig is voor een gewenst nettoloon.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik inverse bruto-netto via binaire zoekmethode. low = 0, high = gewensteNetto * 3 en verhoog high tot brutoNetto(high) >= gewensteNetto. Zoek bruto waarbij netto(bruto) ≈ gewensteNetto. Houd rekening met loonheffingskorting, pensioen en periode.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Netto per periode naar jaar via periodenPerJaar. Resultaat terugrekenen naar gekozen periode.
4. Afrondingsregels
    INVUL: Bruto op 2 decimalen; tolerantie € 0,01.

Output-contract

1. Primaire outputs
    INVUL: benodigdBrutoloon, gewenstNettoloon, berekendNettoloon, loonheffing, brutoJaarloon.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Loonstrookachtige specificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per periode en jaar; verschil tussen gewenst en berekend tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gewenst netto < 0 ongeldig. Ontbrekende periode of jaar onvoldoende.
2. Domeinbeperkingen
    INVUL: Netto >= 0; parameters beschikbaar; max iteraties.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig nettoloon in.” / “Het brutoloon kon niet worden bepaald.”

Testset

1. Basiscase
    INVUL: Netto € 3.000, vlak tarief 40%. Verwacht bruto € 5.000.
2. Edge-case
    INVUL: Netto € 0. Verwacht bruto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Netto jaar € 30.000, tarief 50%, geen korting. Verwacht bruto € 60.000.

Dagloon & dagloon UWV

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/dagloon-uwv-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van dagloon voor UWV-uitkeringen op basis van sv-loon in referteperiode.
2. Exacte formules/stappenvolgorde
    INVUL: svLoonReferteperiode = Σ svLoon. dagloon = svLoonReferteperiode / aantalDagloondagenReferteperiode. Pas maximumdagloon toe: dagloonGemaximeerd = min(dagloon, maximumDagloon[datum]).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon over referteperiode optellen. Aantal dagloondagen meestal uit parameter, bijvoorbeeld 261 per jaar, maar exact via uwvParameters.
4. Afrondingsregels
    INVUL: Dagloon op 2 decimalen. Maximum toepassen na berekening.

Output-contract

1. Primaire outputs
    INVUL: svLoonReferteperiode, aantalDagloondagen, dagloon, gemaximeerdDagloon.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maand-/periodeoverzicht sv-loon en toegepast maximum.
3. Formatregels voor UI
    INVUL: Eurobedragen per dag en referteperiode met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Sv-loon < 0, dagloondagen <= 0, ontbrekend maximum onvoldoende.
2. Domeinbeperkingen
    INVUL: Sv-loon >= 0; dagloondagen > 0; datum aanwezig in UWV-parameters.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig sv-loon in.” / “Vul een geldig aantal dagloondagen in.” / “Voor deze datum ontbreekt het maximumdagloon.”

Testset

1. Basiscase
    INVUL: Sv-loon € 52.200, dagloondagen 261. Verwacht dagloon € 200.
2. Edge-case
    INVUL: Dagloon boven maximum. Verwacht gemaximeerd op maximum.
3. Regresstest tegen bekende uitkomst
    INVUL: Sv-loon € 26.100, dagloondagen 261. Verwacht € 100.

Daling algemene heffingskorting

Bron-URL: https://www.externe-bron.nl/inkomen/algemene-heffingskorting-daling-per-box.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel algemene heffingskorting daalt door extra inkomen in box 1, box 2 en/of box 3.
2. Exacte formules/stappenvolgorde
    INVUL: inkomenVoorAfbouwOud = box1 + box2 + box3 volgens relevante definitie uit parameter. Bereken kortingOud. Voeg extra inkomen toe per box: inkomenNieuw = inkomenOud + extraBox1 + extraBox2 + extraBox3. Bereken kortingNieuw. daling = kortingOud - kortingNieuw.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens per kalenderjaar.
4. Afrondingsregels
    INVUL: Korting en daling op 2 decimalen of hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: algemeneHeffingskortingVoor, algemeneHeffingskortingNa, dalingHeffingskorting, effectiefExtraTarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing inkomen per box en afbouwberekening.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve inkomens ongeldig tenzij expliciet aftrek/verlies wordt ondersteund. Ontbrekende afbouwparameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomens >= 0; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige inkomens in.” / “Voor dit jaar ontbreken parameters voor de algemene heffingskorting.”

Testset

1. Basiscase
    INVUL: Afbouw 5%, extra inkomen € 1.000. Verwacht daling € 50.
2. Edge-case
    INVUL: Inkomen onder afbouwgrens en blijft onder grens. Verwacht daling € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Korting voor € 2.000, na € 1.500. Verwacht daling € 500.

Duur dienstverband & opzegtermijn

Bron-URL: https://www.externe-bron.nl/ontslag/dienstverband-en-opzegtermijn.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van duur dienstverband en wettelijke/contractuele opzegtermijn.
2. Exacte formules/stappenvolgorde
    INVUL: duurDienstverband = einddatum - startdatum in jaren/maanden/dagen. Wettelijke opzegtermijn werkgever op basis van duur via arbeidsrechtParameters[jaar].opzegtermijnWerkgever. Werknemer meestal 1 maand tenzij contractueel anders. Bij UWV/procedure kan proceduretijd in mindering komen met minimumresttermijn volgens parameter.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Datums exact kalenderkundig. Opzegtermijn in maanden. Einddatum opzegging vaak einde maand indien parameter eindeMaand = true.
4. Afrondingsregels
    INVUL: Duur tonen in volledige jaren, maanden, dagen. Opzegtermijn in hele maanden/dagen volgens tabel.

Output-contract

1. Primaire outputs
    INVUL: duurDienstverband, opzegtermijnWerkgever, opzegtermijnWerknemer, mogelijkeEinddatum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Datumoverzicht start, opzegdatum, einddatum, eventuele proceduretijd.
3. Formatregels voor UI
    INVUL: Datums als dd-mm-jjjj; duur als x jaar, y maanden, z dagen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Einddatum vóór startdatum ongeldig. Startdatum ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Geldige datums; contractuele termijn mag wettelijke regels niet onjuist overschrijven zonder waarschuwing.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige startdatum in.” / “De einddatum mag niet vóór de startdatum liggen.” / “Voor dit jaar ontbreken opzegtermijnparameters.”

Testset

1. Basiscase
    INVUL: Dienstverband 6 jaar, tabel werkgever 2 maanden. Verwacht opzegtermijn 2 maanden.
2. Edge-case
    INVUL: Startdatum = einddatum. Verwacht duur 0 dagen.
3. Regresstest tegen bekende uitkomst
    INVUL: Start 01-01-2020, eind 01-01-2025. Verwacht 5 jaar.

Feestdagen

Bron-URL: https://www.externe-bron.nl/modules/werken/feestdagen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen/berekenen van officiële feestdagen voor een jaar, eventueel met weekdag.
2. Exacte formules/stappenvolgorde
    INVUL: Vaste feestdagen op vaste datum. Pasen berekenen met computus-algoritme; Goede Vrijdag = Pasen - 2 dagen; Hemelvaart = Pasen + 39 dagen; Pinksteren = Pasen + 49/50 dagen. Koningsdag verschuift volgens nationale regel indien parameter dat voorschrijft.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant; datumberekening per kalenderjaar.
4. Afrondingsregels
    INVUL: Niet relevant.

Output-contract

1. Primaire outputs
    INVUL: feestdagen[] met naam, datum, weekdag, officieel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Markering of feestdag op werkdag/weekend valt.
3. Formatregels voor UI
    INVUL: Datum als dd-mm-jjjj; weekdag voluit in Nederlands.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Jaar ontbreekt of buiten ondersteund bereik is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Jaar tussen bijvoorbeeld 1900 en 2100 of volgens kalenderlibrary.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig jaar in.” / “Voor dit jaar kunnen de feestdagen niet worden berekend.”

Testset

1. Basiscase
    INVUL: Jaar 2024. Verwacht Nieuwjaarsdag 01-01-2024.
2. Edge-case
    INVUL: Jaar buiten bereik. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Pasen 2024. Verwacht 31-03-2024.

Gemiddeld netto maandinkomen

Bron-URL: https://www.externe-bron.nl/inkomen/gemiddeld-netto-maandinkomen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van gemiddeld netto maandinkomen uit wisselende netto inkomsten.
2. Exacte formules/stappenvolgorde
    INVUL: totaalNetto = Σ nettoInkomstenPerPeriode. aantalMaanden = periodeInMaanden. gemiddeldNettoMaandinkomen = totaalNetto / aantalMaanden. Indien inkomsten per week: eerst naar maand of totaalperiode omrekenen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Week naar jaar *52, naar maand /12. Vierweken *13 / 12. Jaar naar maand /12.
4. Afrondingsregels
    INVUL: Netto maandinkomen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaalNettoInkomen, aantalMaanden, gemiddeldNettoMaandinkomen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per maand/periode en afwijking ten opzichte van gemiddelde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; perioden duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve inkomsten ongeldig tenzij correctiepost expliciet toegestaan. Aantal maanden <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Minimaal één inkomensbedrag; aantal maanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één netto inkomen in.” / “Vul een geldige periode in.”

Testset

1. Basiscase
    INVUL: Netto € 2.000, € 2.500, € 1.500 over 3 maanden. Verwacht € 2.000.
2. Edge-case
    INVUL: Eén maand € 1.000. Verwacht € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarinkomen netto € 36.000. Verwacht € 3.000/mnd.

Huurtoeslag in 2026

Bron-URL: https://www.externe-bron.nl/inkomen/huurtoeslag-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van recht op huurtoeslag en hoogte per maand/jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Controleer leeftijd, zelfstandige woonruimte, rekenhuur, vermogen en huishoudtype. rekenhuur = kaleHuur + subsidiabeleServicekosten. Zoek kwaliteitskortingsgrens, aftoppingsgrens, maximale huurgrens, basishuur en eigen bijdrage in toeslagenParameters[jaar].huurtoeslag. huurtoeslag = max(0, subsidiabelHuurdeel - eigenBijdrage) volgens staffel. Vermogen boven grens geeft 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Huurtoeslag per maand. Jaarbedrag = maandbedrag *12. Toetsingsinkomen per jaar.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen of hele euro’s volgens toeslagparameter.

Output-contract

1. Primaire outputs
    INVUL: huurtoeslagPerMaand, huurtoeslagPerJaar, rekenhuur, eigenBijdrage, rechtOpHuurtoeslag.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardencheck, huurgrenzen, inkomens-/vermogenstoets.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; conclusie recht ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Huur < 0, inkomen/vermogen < 0, ontbrekend huishoudtype of jaar onvoldoende.
2. Domeinbeperkingen
    INVUL: Huur binnen grenzen; vermogen onder grens; leeftijd/woonruimtevoorwaarden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige huur in.” / “Vul een geldig toetsingsinkomen en vermogen in.” / “Voor dit jaar ontbreken huurtoeslagparameters.”

Testset

1. Basiscase
    INVUL: Subsidiair huurdeel € 500, eigen bijdrage € 300. Verwacht toeslag € 200/mnd.
2. Edge-case
    INVUL: Vermogen boven grens. Verwacht toeslag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rechthebbend, berekende toeslag € 150/mnd. Verwacht jaar € 1.800.

Inkomensafhankelijke combinatiekorting

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/inkomensafhankelijke-combinatiekorting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van inkomensafhankelijke combinatiekorting op basis van arbeidsinkomen, kindvoorwaarden en jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Controleer voorwaarden: kind jonger dan leeftijdsgrens, ingeschreven op adres, arbeidsinkomen boven minimum, alleenstaande of minstverdienende partner. Indien niet voldaan: IACK = 0. Indien voldaan: IACK = min(maxKorting, opbouwPercentage * max(0, arbeidsinkomen - opbouwVanaf) / 100 + basisbedrag) volgens box1Parameters[jaar].iack.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Arbeidsinkomen per jaar. Maand naar jaar *12.
4. Afrondingsregels
    INVUL: Korting op 2 decimalen of hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: inkomensafhankelijkeCombinatiekorting, rechtOpKorting, arbeidsinkomen, toegepasteOpbouw.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardencheck en opbouwberekening.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; voorwaarden ja/nee tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Arbeidsinkomen < 0 ongeldig. Ontbrekende kindgegevens/partnerstatus onvoldoende.
2. Domeinbeperkingen
    INVUL: Kind moet aan leeftijds- en inschrijvingsvoorwaarden voldoen; arbeidsinkomen >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig arbeidsinkomen in.” / “Vul de gegevens van het kind en partnerstatus in.” / “Voor dit jaar ontbreken IACK-parameters.”

Testset

1. Basiscase
    INVUL: Arbeidsinkomen boven opbouw, berekende korting € 2.000. Verwacht € 2.000.
2. Edge-case
    INVUL: Geen kwalificerend kind. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Basis 0, opbouw 10%, inkomen boven grens € 10.000, max € 3.000. Verwacht € 1.000.

Inkomstenbelasting bij (grote) inkomenswijziging

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/inkomstenbelasting-bij-inkomenswijziging.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van belasting- en netto-effect van een grote inkomenswijziging.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken belastingOud = box1Belasting(oudInkomen). Bereken belastingNieuw = box1Belasting(nieuwInkomen). verschilBelasting = belastingNieuw - belastingOud. brutoVerschil = nieuwInkomen - oudInkomen. nettoVerschil = brutoVerschil - verschilBelasting + verschilToeslagen. marginaleDruk = 1 - nettoVerschil/brutoVerschil indien brutoVerschil ≠ 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomens per jaar. Maand naar jaar *12; output per maand /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: belastingOud, belastingNieuw, nettoVerschil, brutoVerschil, marginaleDruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na inclusief heffingskortingen en toeslagen.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar en maand; verschil positief/negatief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomens < 0 ongeldig. Ontbrekende parameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomens >= 0; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige oude en nieuwe inkomens in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Oud netto € 30.000, nieuw netto € 35.000. Verwacht netto verschil € 5.000.
2. Edge-case
    INVUL: Oud = nieuw. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto stijging € 10.000, belastingstijging € 4.000. Verwacht netto € 6.000.

Kinderopvangtoeslag

Bron-URL: https://www.externe-bron.nl/inkomen/kinderopvangtoeslag-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van kinderopvangtoeslag per maand/jaar op basis van opvanguren, uurtarief, soort opvang en inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Per kind/opvangsoort: subsidiabeleUren = min(opvangUren, maximumUrenPerMaand, urenKoppelingAanWerk) indien van toepassing. subsidiabelTarief = min(uurtarief, maximumUurtarief[opvangsoort]). kostenSubsidiabel = subsidiabeleUren * subsidiabelTarief. Zoek vergoedingspercentage voor eerste/volgende kind via toeslagenParameters[jaar].kinderopvangtoeslag op toetsingsinkomen. toeslag = kostenSubsidiabel * percentage / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uren en tarief per maand. Jaarbedrag = maandbedrag *12.
4. Afrondingsregels
    INVUL: Toeslag op 2 decimalen of hele euro’s volgens toeslagparameter. Uren op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kinderopvangtoeslagPerMaand, kinderopvangtoeslagPerJaar, eigenKostenPerMaand, subsidiabeleKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Per kind: uren, tarief, maximumtarief, percentage, toeslag.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; percentages met 2 decimalen; opvangsoort tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uren/tarief/inkomen < 0 ongeldig. Ontbrekende opvangsoort of parameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Uren binnen maximum; tarief begrensd op maximum; recht afhankelijk van werk/opleiding/traject.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige opvanguren en uurtarieven in.” / “Kies de opvangsoort.” / “Voor dit jaar ontbreken kinderopvangtoeslagparameters.”

Testset

1. Basiscase
    INVUL: 100 uur, tarief € 8, max € 8, vergoeding 50%. Verwacht toeslag € 400.
2. Edge-case
    INVUL: Uurtarief boven maximum: tarief € 10, max € 8. Gebruik € 8.
3. Regresstest tegen bekende uitkomst
    INVUL: Kosten subsidiabel € 1.000, percentage 70%. Verwacht toeslag € 700.

Kindgebonden budget

Bron-URL: https://www.externe-bron.nl/inkomen/kindgebonden-budget-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van kindgebonden budget op basis van aantal kinderen, leeftijden, inkomen, vermogen en huishoudtype.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek basisbedragen per kind/leeftijd en eventuele alleenstaande-ouderkop in toeslagenParameters[jaar].kindgebondenBudget. maximumKgb = somKindbedragen + alleenstaandeOuderkop. Bepaal afbouw: afbouw = max(0, toetsingsinkomen - afbouwgrens) * afbouwPercentage / 100. kgb = max(0, maximumKgb - afbouw). Vermogen boven grens geeft 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: KGB per jaar, maandbedrag = /12. Inkomen per jaar.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s volgens toeslagparameter.

Output-contract

1. Primaire outputs
    INVUL: kindgebondenBudgetPerJaar, kindgebondenBudgetPerMaand, maximumKgb, afbouw, rechtOpKgb.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Bedrag per kind, alleenstaande-ouderkop, inkomenstoets en vermogenstoets.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; kinderen in tabel.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aantal kinderen < 0, inkomen/vermogen < 0, ontbrekende leeftijd kind onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd kinderen binnen toeslagregels; vermogen onder grens; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige kindgegevens in.” / “Vul een geldig toetsingsinkomen en vermogen in.” / “Voor dit jaar ontbreken kindgebonden-budgetparameters.”

Testset

1. Basiscase
    INVUL: Maximum € 2.000, afbouw € 500. Verwacht KGB € 1.500.
2. Edge-case
    INVUL: Vermogen boven grens. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarbedrag € 1.200. Verwacht maand € 100.

Koopkracht in 2026

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/koopkracht-verandering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van verandering in koopkracht tussen twee jaren door inkomen, belasting, toeslagen en inflatie.
2. Exacte formules/stappenvolgorde
    INVUL: besteedbaarJaar1 = nettoInkomenJaar1 + toeslagenJaar1 - vasteLastenJaar1. besteedbaarJaar2Nominaal = nettoInkomenJaar2 + toeslagenJaar2 - vasteLastenJaar2. besteedbaarJaar2Reeel = besteedbaarJaar2Nominaal / (1 + inflatie/100). koopkrachtVerschil = besteedbaarJaar2Reeel - besteedbaarJaar1. koopkrachtPercentage = koopkrachtVerschil / besteedbaarJaar1 * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandbedragen naar jaar via *12. Inflatie per jaar.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; percentage op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: besteedbaarInkomenJaar1, besteedbaarInkomenJaar2Nominaal, besteedbaarInkomenJaar2Reeel, koopkrachtVerschil, koopkrachtPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing loon, belasting, toeslagen, vaste lasten, inflatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; koopkracht positief/negatief markeren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Besteedbaar jaar 1 <= 0 maakt percentage niet relevant. Inflatie <= -100% ongeldig.
2. Domeinbeperkingen
    INVUL: Inkomsten/lasten >= 0; inflatie geldig; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige inkomens en lasten in.” / “Vul een geldig inflatiepercentage in.”

Testset

1. Basiscase
    INVUL: Besteedbaar 2025 € 30.000, 2026 nominaal € 31.000, inflatie 0%. Verwacht +€ 1.000, 3,33%.
2. Edge-case
    INVUL: Inflatie 10%, nominaal gelijk. Verwacht koopkrachtverlies.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaar1 € 100, jaar2 nominaal € 110, inflatie 10%. Reëel jaar2 € 100, verschil € 0.

Looncheck horeca-cao

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/looncheck-horeca-cao.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Controleren of betaald loon minimaal gelijk is aan het loon volgens horeca-cao of minimumloon.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek caoUurloon in caoParameters.horeca[datum] op basis van functiegroep, leeftijd, ervaringsjaren en arbeidsduur. betaaldUurloon = brutoLoon / gewerkteUren. minimumVanToepassing = max(caoUurloon, wettelijkMinimumUurloon). verschilPerUur = betaaldUurloon - minimumVanToepassing. verschilPerMaand = verschilPerUur * urenPerMaand.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maanduren = urenPerWeek * 52 / 12. Periodebedragen naar uurloon via uren.
4. Afrondingsregels
    INVUL: Uurloon op 2 decimalen; verschillen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: betaaldUurloon, caoUurloon, minimumUurloon, verschilPerUur, verschilPerMaand, voldoetAanCao.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Functiegroep, leeftijd, arbeidsduur en datum/cao-versie.
3. Formatregels voor UI
    INVUL: Eurobedragen per uur/maand; conclusie ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Loon/uren < 0, uren 0, ontbrekende functiegroep/leeftijd/datum onvoldoende.
2. Domeinbeperkingen
    INVUL: Uren > 0; functiegroep moet in cao-tabel staan; datum ondersteund.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige loon- en urengegevens in.” / “Kies een functiegroep.” / “Voor deze datum ontbreken cao-gegevens.”

Testset

1. Basiscase
    INVUL: Betaald € 13, cao € 12. Verwacht voldoet ja, verschil € 1.
2. Edge-case
    INVUL: Uren 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Betaald € 10, minimum € 12, 100 uur. Verwacht tekort € 200.

Maandsalaris naar uurloon

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/maandsalaris-naar-uurloon.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van bruto maandsalaris naar bruto uurloon.
2. Exacte formules/stappenvolgorde
    INVUL: urenPerMaand = urenPerWeek * 52 / 12. uurloon = maandsalaris / urenPerMaand. Inclusief vakantiegeld: uurloonInclVakantiegeld = maandsalaris * (1 + vakantiegeldPercentage/100) / urenPerMaand.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weekuren naar maanduren via *52/12. Vakantiegeldpercentage delen door 100.
4. Afrondingsregels
    INVUL: Uurloon op 2 decimalen; uren op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoUurloon, brutoUurloonInclVakantiegeld, urenPerMaand, brutoMaandsalaris.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarloon en maanduren.
3. Formatregels voor UI
    INVUL: Euro per uur met 2 decimalen; uren met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maandsalaris < 0, urenPerWeek <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Maandsalaris >= 0; urenPerWeek > 0; vakantiegeldpercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig maandsalaris in.” / “Vul een positief aantal uren per week in.”

Testset

1. Basiscase
    INVUL: Maand € 3.000, 40 uur/week. Uren maand 173,33, uurloon € 17,31.
2. Edge-case
    INVUL: Uren 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Maand € 1.733,33, 40 uur/week. Verwacht circa € 10/uur.

Middeling inkomen

Bron-URL: https://www.externe-bron.nl/modules/werken/middeling-inkomen-box1.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van mogelijke belastingteruggaaf door middeling van box 1-inkomen over drie jaren.
2. Exacte formules/stappenvolgorde
    INVUL: totaalInkomen = inkomenJaar1 + inkomenJaar2 + inkomenJaar3. gemiddeldInkomen = totaalInkomen / 3. Bereken oorspronkelijke belasting som over 3 jaren. Bereken herrekende belasting alsof elk jaar gemiddeld inkomen had, met tarieven per oorspronkelijk jaar. verschil = oorspronkelijkeBelasting - herrekendeBelasting. teruggaaf = max(0, verschil - drempelMiddeling).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomens per kalenderjaar. Geen maandconversie tenzij input maandinkomen is.
4. Afrondingsregels
    INVUL: Belasting op 2 decimalen of hele euro’s; gemiddelde inkomen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: gemiddeldInkomen, oorspronkelijkeBelasting, herrekendeBelasting, verschil, teruggaafNaDrempel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per jaar met inkomen, oorspronkelijke belasting en herrekende belasting.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaren in tabel.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Minder dan 3 jaren onvoldoende. Inkomen < 0 ongeldig tenzij verlies expliciet ondersteund.
2. Domeinbeperkingen
    INVUL: Middeling alleen voor jaren waarvoor regeling geldt en niet eerder gebruikt; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul drie inkomensjaren in.” / “Voor één van de jaren ontbreken belastingparameters.” / “Deze jaren zijn niet geschikt voor middeling.”

Testset

1. Basiscase
    INVUL: Oorspronkelijk € 30.000, herrekend € 25.000, drempel € 545. Verwacht teruggaaf € 4.455.
2. Edge-case
    INVUL: Verschil lager dan drempel. Verwacht teruggaaf € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Drie gelijke inkomens. Verwacht verschil € 0.

Minimumloon

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/minimumloon.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van wettelijk minimumloon per uur, maand of periode op basis van leeftijd en datum.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek minimumuurloon in minimumloonParameters[datum] op basis van leeftijd. minimumPerWeek = minimumUurloon * urenPerWeek. minimumPerMaand = minimumUurloon * urenPerWeek * 52 / 12. Voor gewerkte uren: minimumLoon = minimumUurloon * gewerkteUren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Week naar maand via *52/12. Uurloon als basis.
4. Afrondingsregels
    INVUL: Uurloon op 2 decimalen; periodebedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: minimumUurloon, minimumPerWeek, minimumPerMaand, minimumVoorGewerkteUren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Leeftijdscategorie, datum/tijdvak en arbeidsduur.
3. Formatregels voor UI
    INVUL: Eurobedragen per uur/week/maand; datum tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leeftijd ontbreekt of buiten tabel ongeldig. Uren < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Leeftijd binnen minimumloontabel; uren >= 0; datum ondersteund.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige leeftijd in.” / “Vul een geldig aantal uren in.” / “Voor deze datum ontbreken minimumloongegevens.”

Testset

1. Basiscase
    INVUL: Minimumuurloon € 13, 40 uur/week. Verwacht week € 520, maand € 2.253,33.
2. Edge-case
    INVUL: 0 gewerkte uren. Verwacht loon € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Uurloon € 10, 100 uur. Verwacht € 1.000.

Netto extra inkomen bij meer werken

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/meer-gaan-werken-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel netto extra inkomen overblijft bij meer werken.
2. Exacte formules/stappenvolgorde
    INVUL: extraBruto = extraUrenPerWeek * brutoUurloon * wekenPerJaar. Bereken netto huidig en netto nieuw inclusief belasting, heffingskortingen en toeslagen. nettoExtra = nettoNieuw - nettoHuidig. effectiefNettoUurloon = nettoExtra / (extraUrenPerWeek * wekenPerJaar).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weekuren naar jaar via * wekenPerJaar; jaar naar maand /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; netto uurloon op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: extraBrutoInkomen, extraNettoInkomen, effectiefNettoUurloon, marginaleDruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Effect belasting, heffingskortingen en toeslagen.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar/maand/uur; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Extra uren < 0, uurloon < 0, weken <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Uren >= 0; uurloon >= 0; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige extra uren en uurloon in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Extra bruto € 10.000, extra belasting/toeslagverlies € 4.000. Netto extra € 6.000.
2. Edge-case
    INVUL: Extra uren 0. Verwacht netto extra € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Extra bruto € 1.000, netto € 600. Marginale druk 40%.

Netto inkomen bij meer/minder werken

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/meer-minder-werken-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van netto inkomen bij wijziging van arbeidsduur.
2. Exacte formules/stappenvolgorde
    INVUL: brutoNieuw = brutoHuidig * nieuweUren / huidigeUren of uurloon * nieuweUren * wekenPerJaar. Bereken nettoHuidig en nettoNieuw inclusief belasting/kortingen/toeslagen. nettoVerschil = nettoNieuw - nettoHuidig.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weekuren naar jaar via *52 of werkwekenparameter. Jaar naar maand /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; uren op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoHuidig, nettoNieuw, nettoVerschil, brutoVerschil, effectiefNettoUurloonVerschil.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking huidig/nieuw met belasting, toeslagen en kortingen.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; uren per week.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Huidige uren <= 0, nieuwe uren < 0, bruto < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Uren binnen realistische grenzen; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige huidige en nieuwe uren in.” / “Vul een geldig inkomen in.”

Testset

1. Basiscase
    INVUL: Netto huidig € 2.000/mnd, nieuw € 2.400/mnd. Verwacht verschil € 400/mnd.
2. Edge-case
    INVUL: Nieuwe uren = huidige uren. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Huidige 40 uur, nieuwe 32 uur, bruto lineair. Verwacht bruto 80% van huidig.

Netto loonsverhoging

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/netto-loonsverhoging.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel van een bruto loonsverhoging netto overblijft.
2. Exacte formules/stappenvolgorde
    INVUL: brutoNieuw = brutoHuidig + loonsverhoging of brutoHuidig * (1 + verhogingPercentage/100). Bereken nettoHuidig en nettoNieuw. nettoLoonsverhoging = nettoNieuw - nettoHuidig. marginaleDruk = 1 - nettoLoonsverhoging / brutoLoonsverhoging.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Loonsverhoging per maand naar jaar via *12. Percentage op bruto periodebedrag.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; percentage op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoLoonsverhoging, nettoLoonsverhoging, nettoNieuw, marginaleDruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking oude/nieuwe loonstrook.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto huidig < 0, verhoging < 0 ongeldig voor deze tool.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig huidig loon in.” / “Vul een geldige loonsverhoging in.”

Testset

1. Basiscase
    INVUL: Bruto verhoging € 1.000, extra belasting € 400. Netto € 600.
2. Edge-case
    INVUL: Verhoging € 0. Netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 100/mnd, netto € 60/mnd. Druk 40%.

Netto verhoging uitkering

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/netto-verhoging-uitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel netto overblijft van een bruto verhoging van een uitkering.
2. Exacte formules/stappenvolgorde
    INVUL: brutoUitkeringNieuw = brutoUitkeringHuidig + verhoging. Bereken netto huidig en netto nieuw via uitkering bruto-netto inclusief loonheffingskorting, Zvw-bijdrage indien relevant en toeslagen. nettoVerhoging = nettoNieuw - nettoHuidig.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maanduitkering naar jaar via *12. Jaar naar maand /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoVerhoging, nettoVerhoging, nettoUitkeringHuidig, nettoUitkeringNieuw, marginaleDruk.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Belasting, heffingskortingen en toeslageneffect.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering of verhoging < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; uitkeringstype ondersteund; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige uitkering in.” / “Vul een geldige verhoging in.”

Testset

1. Basiscase
    INVUL: Bruto verhoging € 100, belasting € 30. Verwacht netto € 70.
2. Edge-case
    INVUL: Verhoging 0. Verwacht netto 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarverhoging € 1.200, netto € 900. Druk 25%.

Netto voordeel box 1 aftrek

Bron-URL: https://www.externe-bron.nl/inkomen/netto-voordeel-box-1-aftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto belastingvoordeel van een aftrekpost in box 1.
2. Exacte formules/stappenvolgorde
    INVUL: belastingZonderAftrek = box1Belasting(inkomen). belastingMetAftrek = box1Belasting(max(0, inkomen - aftrekpost)), met tariefsaanpassing aftrekposten indien van toepassing: aftrekvoordeel begrenzen op maxAftrektarief. nettoVoordeel = belastingZonderAftrek - belastingMetAftrek.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Aftrekpost per jaar. Maandbedrag naar jaar *12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekpost, nettoBelastingvoordeel, effectiefAftrektarief, belastingZonderAftrek, belastingMetAftrek.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijfeffect en eventuele tariefsaanpassing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; effectief tarief met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen of aftrekpost < 0 ongeldig. Ontbrekende parameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomen/aftrek >= 0; aftrek niet lager dan belastbaar inkomen tenzij doorschuif/verliesregeling expliciet.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen en aftrekbedrag in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Aftrek € 1.000, aftrektarief 40%. Verwacht voordeel € 400.
2. Edge-case
    INVUL: Aftrek € 0. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aftrek € 10.000, max tarief 36,93%. Verwacht voordeel € 3.693.

Nettoloon

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/nettoloon.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van nettoloon uit brutoloon per periode.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaar = brutoloon * periodenPerJaar. belastbaarLoon = brutoJaar - pensioen - werknemersbijdragen. loonheffing = box1Belasting(belastbaarLoon) - heffingskortingen. nettoJaar = brutoJaar - loonheffing - pensioen - overigeInhoudingen + nettoVergoedingen. nettoPerPeriode = nettoJaar / periodenPerJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand 12, vierweken 13, week 52, dag/uur op basis van uren.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoloonPerPeriode, nettoJaarloon, loonheffing, heffingskortingen, brutoJaarloon.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Loonstrookcomponenten.
3. Formatregels voor UI
    INVUL: Eurobedragen per periode en jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Brutoloon < 0, perioden ontbreekt, jaarparameters ontbreken ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; perioden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig brutoloon in.” / “Kies een betaalperiode.” / “Voor dit jaar ontbreken loonbelastingparameters.”

Testset

1. Basiscase
    INVUL: Bruto € 3.000, inhoudingen € 900. Verwacht netto € 2.100.
2. Edge-case
    INVUL: Bruto € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaar bruto € 50.000, belasting € 17.000. Verwacht netto € 33.000.

Ontslag- of transitievergoeding netto

Bron-URL: https://www.externe-bron.nl/ontslag/ontslag-of-transitievergoeding-bruto-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto ontslagvergoeding/transitievergoeding na belasting.
2. Exacte formules/stappenvolgorde
    INVUL: inkomenMetVergoeding = regulierJaarinkomen + brutoVergoeding. belastingZonder = box1Belasting(regulierJaarinkomen). belastingMet = box1Belasting(inkomenMetVergoeding). belastingOverVergoeding = belastingMet - belastingZonder. nettoVergoeding = brutoVergoeding - belastingOverVergoeding.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Vergoeding als eenmalig jaarinkomen in jaar van uitbetaling.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoVergoeding, belastingOverVergoeding, nettoVergoeding, effectiefBelastingtarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Box 1-vergelijking zonder/met vergoeding.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; tarief met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vergoeding < 0, inkomen < 0, ontbrekende parameters ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige bruto vergoeding in.” / “Vul een geldig jaarinkomen in.”

Testset

1. Basiscase
    INVUL: Vergoeding € 10.000, extra belasting € 4.000. Verwacht netto € 6.000.
2. Edge-case
    INVUL: Vergoeding € 0. Netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vergoeding € 50.000, tarief 50%. Verwacht netto € 25.000.

Ontslagvergoeding ambtenaar

Bron-URL: https://www.externe-bron.nl/ontslag/ontslagvergoeding-ambtenaar.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van ontslagvergoeding voor ambtenaar op basis van gekozen regeling, salaris en diensttijd.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik regelingstabel ambtenarenParameters[jaar][regeling]. Generiek: vergoedingBruto = maandsalarisInclVasteComponenten * factorDiensttijd * correctiefactor, eventueel begrensd op maximum. Netto via ontslagvergoeding bruto-netto: netto = bruto - extraBox1Belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Diensttijd in jaren/maanden. Maandsalaris als basis. Jaarinkomen voor netto-effect.
4. Afrondingsregels
    INVUL: Diensttijd op 2 decimalen jaren of volledige maanden; vergoeding op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoOntslagvergoeding, nettoOntslagvergoeding, diensttijd, toegepasteRegeling, belastingOverVergoeding.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Salariscomponenten, factor en eventuele maximering.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; regeling duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Salaris < 0, negatieve diensttijd, ontbrekende regeling ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Regeling moet in parameterbestand staan; diensttijd >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig salaris en diensttijd in.” / “Kies een ontslagregeling.” / “Voor deze regeling ontbreken parameters.”

Testset

1. Basiscase
    INVUL: Maandsalaris € 4.000, factor 3. Verwacht bruto € 12.000.
2. Edge-case
    INVUL: Diensttijd 0. Verwacht vergoeding 0 of minimum volgens regeling.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 20.000, belasting € 8.000. Netto € 12.000.

Sociaal minimum

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/sociaal-minimum-inkomen-toeslagenwet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen of inkomen onder sociaal minimum ligt en hoeveel aanvulling nodig is.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek sociaalMinimum in socialeZekerheidParameters[datum] op basis van leeftijd, leefsituatie en partner. inkomenInAanmerking = inkomen + partnerInkomen - vrijlatingen. aanvulling = max(0, sociaalMinimum - inkomenInAanmerking).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Norm per maand. Jaarinkomen naar maand /12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: sociaalMinimum, inkomenInAanmerking, aanvullingTotSociaalMinimum, onderSociaalMinimum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Normtabel en inkomensspecificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; conclusie ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0, ontbrekende leefsituatie/datum onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomen >= 0; leefsituatie in normtabel.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Kies een leefsituatie.” / “Voor deze datum ontbreken normen.”

Testset

1. Basiscase
    INVUL: Norm € 1.500, inkomen € 1.200. Verwacht aanvulling € 300.
2. Edge-case
    INVUL: Inkomen hoger dan norm. Aanvulling € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Norm € 1.000, inkomen € 0. Aanvulling € 1.000.

Stamrecht eindkapitaal

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/stamrecht-eindkapitaal.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van eindkapitaal van stamrechtkapitaal bij rendement, looptijd en eventuele uitkeringen/kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Per periode: saldoNieuw = saldo * (1 + r) - uitkering - kosten. Zonder uitkeringen: eindkapitaal = startkapitaal * (1+r)^n. Met periodieke storting/onttrekking gebruik annuïteitsformule.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente via effectieve formule. Looptijd in maanden/jaren.
4. Afrondingsregels
    INVUL: Kapitaal, kosten en uitkeringen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindkapitaal, startkapitaal, totaalRendement, totaleUitkeringen, totaleKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks kapitaalverloop.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startkapitaal < 0, looptijd < 0, rente <= -100% ongeldig.
2. Domeinbeperkingen
    INVUL: Kapitaal >= 0; looptijd >= 0; rente geldig.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig startkapitaal in.” / “Vul een geldige looptijd en rente in.”

Testset

1. Basiscase
    INVUL: Start € 100.000, rente 5%, 1 jaar. Eind € 105.000.
2. Edge-case
    INVUL: Looptijd 0. Eind = start.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 10.000, rente 10%, 2 jaar. Eind € 12.100.

Sv-jaarloon

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/sv-jaarloon-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van sociaalverzekeringsloon per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: svJaarloon = brutoLoon + vakantiegeld + vasteToeslagen + bonus + belasteVergoedingen - nietSvLoonBestanddelen. Pas maximum premieloon toe indien relevant: premieloon = min(svJaarloon, maxPremieloon[jaar]).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon *12, 4-weken *13, week *52.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: svJaarloon, premieloon, brutoJaarloon, nietSvLoon.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie looncomponenten.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Looncomponenten < 0 ongeldig tenzij correctiepost. Ontbrekende periode onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; jaarparameters beschikbaar voor maximum.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige looncomponenten in.” / “Kies een betaalperiode.”

Testset

1. Basiscase
    INVUL: Maandloon € 3.000, vakantiegeld 8%. Verwacht bruto/sv € 38.880 indien geen correcties.
2. Edge-case
    INVUL: Loon 0. Verwacht sv-loon 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 50.000, niet-sv € 5.000. Sv € 45.000.

Tariefsaanpassing aftrekposten box 1

Bron-URL: https://www.externe-bron.nl/inkomen/tariefsaanpassing-aftrekposten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van verminderd belastingvoordeel van aftrekposten door tariefsaanpassing.
2. Exacte formules/stappenvolgorde
    INVUL: normaalVoordeel = aftrekpost * marginaalTarief / 100. maxVoordeel = aftrekpost * maximumAftrektarief / 100. correctie = max(0, normaalVoordeel - maxVoordeel). nettoVoordeel = normaalVoordeel - correctie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Aftrekpost per jaar. Percentages via box1Parameters[jaar].tariefsaanpassing.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; percentages op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekpost, normaalVoordeel, tariefsaanpassing, nettoVoordeel, maximumAftrektarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking zonder/met tariefsaanpassing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; tarieven tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aftrekpost < 0, tarief buiten 0..100, ontbrekende parameters ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Aftrek >= 0; tarieven 0..100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aftrekbedrag in.” / “Voor dit jaar ontbreken tariefsaanpassingsparameters.”

Testset

1. Basiscase
    INVUL: Aftrek € 10.000, marginaal 49%, max 37%. Normaal € 4.900, netto € 3.700, correctie € 1.200.
2. Edge-case
    INVUL: Marginaal lager dan max. Correctie € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aftrek € 1.000, max 36,93%. Netto voordeel € 369,30.

Tijdelijke verhuur eigen woning

Bron-URL: https://www.externe-bron.nl/inkomen/tijdelijke-verhuur-eigen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van belastbaar inkomen uit tijdelijke verhuur van de eigen woning.
2. Exacte formules/stappenvolgorde
    INVUL: brutoHuuropbrengst = huurPerPeriode * aantalPerioden. belastbaarPercentage = eigenWoningParameters[jaar].tijdelijkeVerhuurBelastPercentage. belastbareHuuropbrengst = brutoHuuropbrengst * belastbaarPercentage / 100. Voeg toe aan box 1: belastingEffect = box1Belasting(inkomen + belastbareHuuropbrengst) - box1Belasting(inkomen).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Dag/week/maandhuur naar jaarbedrag op basis van verhuurperiode.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoHuuropbrengst, belastbareHuuropbrengst, extraBelasting, nettoHuuropbrengst.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Verhuurperiode, percentage belast, box 1-effect.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentage belast tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Huur < 0, perioden < 0, inkomen < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Alleen tijdelijke verhuur eigen woning; percentage via parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige huuropbrengst in.” / “Vul een geldige verhuurperiode in.” / “Voor dit jaar ontbreken parameters.”

Testset

1. Basiscase
    INVUL: Huur € 1.000, belast 70%, tarief 40%. Belastbaar € 700, belasting € 280.
2. Edge-case
    INVUL: Huur € 0. Effect € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Huur € 10.000, belast 70%. Belastbaar € 7.000.

Toeslagen berekenen

Bron-URL: https://www.externe-bron.nl/inkomen/toeslagen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Gezamenlijk berekenen van zorgtoeslag, huurtoeslag, kinderopvangtoeslag en kindgebonden budget.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken toetsingsinkomen en vermogen. Roep per toeslagmodule aan: zorgtoeslag, huurtoeslag, kinderopvangtoeslag en kindgebonden budget. totaleToeslagenPerMaand = som toeslagenPerMaand. totaleToeslagenPerJaar = som toeslagenPerJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per jaar. Toeslagen per maand en jaar.
4. Afrondingsregels
    INVUL: Per toeslag op 2 decimalen of hele euro’s volgens toeslagparameter. Som na individuele afronding volgens parameter.

Output-contract

1. Primaire outputs
    INVUL: zorgtoeslag, huurtoeslag, kinderopvangtoeslag, kindgebondenBudget, totaleToeslagen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardencheck per toeslag en afbouw op inkomen/vermogen.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand en jaar; recht ja/nee per toeslag.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen/vermogen < 0 ongeldig. Ontbrekende huishoudgegevens onvoldoende.
2. Domeinbeperkingen
    INVUL: Toeslagparameters beschikbaar; per toeslag eigen voorwaarden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig toetsingsinkomen en vermogen in.” / “Vul de huishoudgegevens in.” / “Voor dit jaar ontbreken toeslagparameters.”

Testset

1. Basiscase
    INVUL: Zorg € 100, huur € 200, KOT € 300, KGB € 50. Totaal € 650/mnd.
2. Edge-case
    INVUL: Vermogen boven alle grenzen. Verwacht vermogensafhankelijke toeslagen € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Geen kinderen/huur, alleen zorgtoeslag € 100. Totaal € 100.

Toetsingsinkomen

Bron-URL: https://www.externe-bron.nl/inkomen/toetsingsinkomen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van toetsingsinkomen voor toeslagen.
2. Exacte formules/stappenvolgorde
    INVUL: toetsingsinkomen = verzamelinkomen indien bekend. Anders: box1Inkomen + box2Inkomen + box3Inkomen - persoonsgebondenAftrek volgens fiscale definitie. Voor partners: gezamenlijkToetsingsinkomen = toetsingsinkomenAanvrager + toetsingsinkomenPartner.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens per kalenderjaar. Maand naar jaar *12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s volgens fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: toetsingsinkomen, toetsingsinkomenPartner, gezamenlijkToetsingsinkomen, gebruikteMethode.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing box 1/2/3 en aftrekposten.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar; partnerbedragen apart tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve inkomens ongeldig tenzij verlies expliciet toegestaan. Geen verzamelinkomen en onvoldoende boxgegevens is onvoldoende.
2. Domeinbeperkingen
    INVUL: Jaarinkomens numeriek; partnerstatus bekend.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul het verzamelinkomen in of specificeer de inkomens per box.” / “Vul geldige inkomensbedragen in.”

Testset

1. Basiscase
    INVUL: Box1 € 40.000, box2 € 0, box3 € 1.000. Verwacht € 41.000.
2. Edge-case
    INVUL: Alle inkomens 0. Verwacht 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aanvrager € 30.000, partner € 20.000. Gezamenlijk € 50.000.

Transitievergoeding bij ontslag

Bron-URL: https://www.externe-bron.nl/ontslag/transitievergoeding-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto transitievergoeding op basis van maandsalaris en duur dienstverband.
2. Exacte formules/stappenvolgorde
    INVUL: Generieke wettelijke formule: transitievergoeding = maandsalaris * factorPerDienstjaar * dienstjaren, waarbij factor en maximering uit arbeidsrechtParameters[jaar].transitievergoeding komen. Voor deel van jaar: vergoedingDeeljaar = maandsalaris * factorPerDienstjaar * (resterendeDagen / dagenInJaar) of exacte wettelijke dagformule volgens parameter. Pas maximum toe: min(berekend, wettelijkMaximumOfJaarsalaris).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Diensttijd exact van startdatum tot einddatum. Maandsalaris inclusief vaste looncomponenten volgens parameter.
4. Afrondingsregels
    INVUL: Diensttijd exact; vergoeding op 2 decimalen; maximum na berekening toepassen.

Output-contract

1. Primaire outputs
    INVUL: brutoTransitievergoeding, duurDienstverband, maandsalarisVoorBerekening, wettelijkMaximum, toegepastMaximum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Diensttijdspecificatie en salariscomponenten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; datums als dd-mm-jjjj.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Einddatum vóór startdatum, maandsalaris < 0, ontbrekende jaarparameters ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Geldige datums; dienstverband > 0 voor vergoeding; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige start- en einddatum in.” / “Vul een geldig maandsalaris in.” / “Voor dit jaar ontbreken transitievergoedingsparameters.”

Testset

1. Basiscase
    INVUL: Maandsalaris € 3.000, diensttijd 3 jaar, factor 1/3. Verwacht € 3.000.
2. Edge-case
    INVUL: Diensttijd 0. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandsalaris € 4.000, 6 jaar, factor 1/3. Verwacht € 8.000.

Uitbetaling vakantiedagen

Bron-URL: https://www.externe-bron.nl/ontslag/uitbetaling-vakantiedagen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en netto uitbetaling van openstaande vakantiedagen bij einde dienstverband.
2. Exacte formules/stappenvolgorde
    INVUL: dagloon = brutoMaandsalaris / gemiddeldeWerkdagenPerMaand of uurloon * urenPerDag. brutoUitbetaling = openstaandeVakantiedagen * dagloon. Voeg vakantiegeld toe indien verschuldigd: brutoInclVakantiegeld = brutoUitbetaling * (1 + vakantiegeldPercentage/100). Netto via extra inkomen: netto = brutoIncl - extraBelasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand naar dag via werkdagenPerMaand; uur naar dag via urenPerDag.
4. Afrondingsregels
    INVUL: Dagen op 2 decimalen; bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoUitbetalingVakantiedagen, vakantiegeldOverUitbetaling, belasting, nettoUitbetaling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Dagloon, aantal dagen, uren en tarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; vakantiedagen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vakantiedagen < 0, salaris < 0, werkdagenPerMaand <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Dagen >= 0; salaris >= 0; fiscale parameters voor netto.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aantal vakantiedagen in.” / “Vul een geldig salaris in.”

Testset

1. Basiscase
    INVUL: 10 dagen, dagloon € 200. Bruto € 2.000.
2. Edge-case
    INVUL: 0 dagen. Bruto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 2.000, belasting 40%. Netto € 1.200.

Uitkering bruto-netto

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/uitkering-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto uitkering uit bruto uitkering.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaarUitkering = brutoPerPeriode * periodenPerJaar. Bereken loonheffing/premies volgens uitkeringstype en leeftijd/AOW-status. nettoJaar = brutoJaarUitkering - loonheffing - inhoudingen + heffingskortingenEffect. nettoPerPeriode = nettoJaar / periodenPerJaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand *12, vierweken *13, week *52.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoUitkeringPerPeriode, nettoJaarUitkering, loonheffing, brutoJaarUitkering.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie uitkeringstype, kortingen en inhoudingen.
3. Formatregels voor UI
    INVUL: Eurobedragen per periode/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto uitkering < 0, ontbrekend uitkeringstype/periode/jaar ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; uitkeringstype ondersteund; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige bruto uitkering in.” / “Kies een uitkeringstype en periode.”

Testset

1. Basiscase
    INVUL: Bruto € 2.000, inhouding € 400. Netto € 1.600.
2. Edge-case
    INVUL: Bruto € 0. Netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto jaar € 24.000, belasting € 4.000. Netto € 20.000.

Uurloon bruto-netto

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/uurloon-bruto-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto uurloon en netto maand-/jaarinkomen uit bruto uurloon.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaar = brutoUurloon * urenPerWeek * wekenPerJaar + vakantiegeld + bonus. Bereken netto via bruto-netto salaris. nettoUurloon = nettoJaar / (urenPerWeek * wekenPerJaar).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weekuren naar jaaruren via * wekenPerJaar; jaar naar maand /12.
4. Afrondingsregels
    INVUL: Uurloon op 2 decimalen; jaar/maandbedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoUurloon, brutoJaarloon, nettoJaarloon, nettoMaandinkomen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Loonheffing en heffingskortingen.
3. Formatregels voor UI
    INVUL: Euro per uur met 2 decimalen; maand/jaarbedragen tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uurloon < 0, uren < 0, weken <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Uurloon en uren >= 0; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto uurloon in.” / “Vul geldige uren per week in.”

Testset

1. Basiscase
    INVUL: Uurloon € 20, 40 uur, 52 weken. Bruto jaar € 41.600.
2. Edge-case
    INVUL: 0 uur. Bruto/netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto jaar € 20.000, netto € 16.000, jaaruren 2.000. Netto uur € 8.

Uurloon naar maandsalaris

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/uurloon-naar-maandsalaris.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van uurloon naar bruto maandsalaris en jaarsalaris.
2. Exacte formules/stappenvolgorde
    INVUL: brutoWeekloon = uurloon * urenPerWeek. brutoJaarloon = brutoWeekloon * 52. brutoMaandsalaris = brutoJaarloon / 12. Inclusief vakantiegeld: brutoJaarInclVakantiegeld = brutoJaarloon * (1 + vakantiegeldPercentage/100).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Week naar maand via *52/12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandsalaris, brutoJaarloon, brutoWeekloon, brutoJaarloonInclVakantiegeld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uren per week, uurloon, vakantiegeld.
3. Formatregels voor UI
    INVUL: Eurobedragen per uur/week/maand/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uurloon < 0, uren < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Uurloon en uren >= 0; vakantiegeldpercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig uurloon in.” / “Vul geldige uren per week in.”

Testset

1. Basiscase
    INVUL: € 20/uur, 40 uur. Week € 800, maand € 3.466,67, jaar € 41.600.
2. Edge-case
    INVUL: 0 uur. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: € 10/uur, 40 uur. Maand € 1.733,33.

UWV-toeslag

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/uwv-toeslag-toeslagenwet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of recht bestaat op UWV-toeslag op grond van de Toeslagenwet en hoeveel aanvulling nodig is.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek sociaal minimum in uwvParameters[datum].toeslagenwet op basis van leefsituatie/leeftijd. inkomenInAanmerking = uitkering + overigInkomen + partnerInkomen - vrijlatingen. uwvToeslag = max(0, sociaalMinimum - inkomenInAanmerking), begrensd volgens regeling.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uitkering en norm per maand of dag; converteer met dagloonDagenPerMaand indien nodig.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: sociaalMinimum, inkomenInAanmerking, uwvToeslagPerMaand, rechtOpToeslag.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Norm, inkomsten, vrijlatingen en leefsituatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; conclusie ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0, ontbrekende leefsituatie/datum onvoldoende.
2. Domeinbeperkingen
    INVUL: Uitkeringstype moet kwalificeren; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige inkomensgegevens in.” / “Kies een leefsituatie.” / “Voor deze datum ontbreken UWV-toeslagparameters.”

Testset

1. Basiscase
    INVUL: Norm € 1.400, inkomen € 1.100. Toeslag € 300.
2. Edge-case
    INVUL: Inkomen hoger dan norm. Toeslag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Norm € 1.000, inkomen € 0. Toeslag € 1.000.

Vakantiegeld

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/vakantiegeld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en netto vakantiegeld.
2. Exacte formules/stappenvolgorde
    INVUL: brutoVakantiegeld = brutoLoonGrondslag * vakantiegeldPercentage / 100. Netto: belastingZonder = box1Belasting(regulierJaarloon), belastingMet = box1Belasting(regulierJaarloon + brutoVakantiegeld), belastingOverVakantiegeld = belastingMet - belastingZonder, nettoVakantiegeld = brutoVakantiegeld - belastingOverVakantiegeld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaargrondslag via *12 of opbouwperiode. Vakantiegeld meestal percentage per jaar.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoVakantiegeld, belastingOverVakantiegeld, nettoVakantiegeld, vakantiegeldPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Grondslag, opbouwperiode en bijzonder tarief/marginaal tarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentage met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Loon < 0, percentage < 0, opbouwperiode ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Loon >= 0; percentage >= 0; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig loon in.” / “Vul een geldig vakantiegeldpercentage in.”

Testset

1. Basiscase
    INVUL: Jaarloon € 30.000, vakantiegeld 8%. Bruto € 2.400.
2. Edge-case
    INVUL: Percentage 0%. Vakantiegeld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto vakantiegeld € 1.000, belasting 40%. Netto € 600.

Verzamelinkomen

Bron-URL: https://www.externe-bron.nl/inkomen/verzamelinkomen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van verzamelinkomen uit box 1, box 2 en box 3.
2. Exacte formules/stappenvolgorde
    INVUL: verzamelinkomen = belastbaarInkomenBox1 + belastbaarInkomenBox2 + belastbaarInkomenBox3. Indien persoonsgebonden aftrek apart wordt ingevoerd: aftrek toepassen volgens fiscale volgorde/parameter.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens per kalenderjaar. Maand naar jaar via *12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s volgens fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: verzamelinkomen, box1, box2, box3, persoonsgebondenAftrek.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitsplitsing per box.
3. Formatregels voor UI
    INVUL: Eurobedragen per jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve boxbedragen ongeldig tenzij verlies expliciet ondersteund. Alle velden leeg onvoldoende.
2. Domeinbeperkingen
    INVUL: Minimaal één boxbedrag; fiscale aftrekvolgorde beschikbaar indien aftrekposten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één inkomen per box in.” / “Vul geldige bedragen in.”

Testset

1. Basiscase
    INVUL: Box1 € 40.000, box2 € 5.000, box3 € 1.000. Verzamelinkomen € 46.000.
2. Edge-case
    INVUL: Alle boxen 0. Verzamelinkomen € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Box1 € 50.000, aftrek € 5.000, box2 € 0, box3 € 0. Verwacht € 45.000 indien aftrek op box1.

Wat kost dit per Nederlander

Bron-URL: https://www.externe-bron.nl/werk-en-inkomen/kosten-per-nederlander.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van totale kosten naar kosten per Nederlander, huishouden of belastingbetaler.
2. Exacte formules/stappenvolgorde
    INVUL: kostenPerInwoner = totaleKosten / aantalInwoners. kostenPerHuishouden = totaleKosten / aantalHuishoudens. kostenPerBelastingbetaler = totaleKosten / aantalBelastingbetalers.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Totale kosten per jaar of eenmalig. Indien meerjarig: kostenPerJaar = totaleKosten / aantalJaren.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; aantallen op hele personen.

Output-contract

1. Primaire outputs
    INVUL: kostenPerInwoner, kostenPerHuishouden, kostenPerBelastingbetaler, totaleKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aantallen en meerjarige uitsplitsing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; aantallen met duizendtallen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Totale kosten < 0, deleraantal <= 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Kosten >= 0; aantallen > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige totale kosten in.” / “Het aantal personen/huishoudens moet groter zijn dan nul.”

Testset

1. Basiscase
    INVUL: Kosten € 1.000.000, inwoners 100.000. Verwacht € 10.
2. Edge-case
    INVUL: Aantal inwoners 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Kosten € 18.000.000, inwoners 18.000.000. Verwacht € 1.

WW-uitkering

Bron-URL: https://www.externe-bron.nl/modules/werken/wwuitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto WW-uitkering en indicatieve duur.
2. Exacte formules/stappenvolgorde
    INVUL: dagloon = min(berekendDagloon, maximumDagloon). maandloonWW = dagloon * dagloondagenPerMaand. uitkeringEerstePeriode = maandloonWW * percentageEerstePeriode / 100. uitkeringDaarna = maandloonWW * percentageDaarna / 100. Duur volgens arbeidsverleden via uwvParameters[jaar].wwDuur.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Dagloon naar maand met dagloondagenparameter. Duur in maanden.
4. Afrondingsregels
    INVUL: Dagloon en uitkering op 2 decimalen. Duur op hele maanden volgens regeling.

Output-contract

1. Primaire outputs
    INVUL: dagloon, gemaximeerdDagloon, wwPerMaandEerstePeriode, wwPerMaandDaarna, duurWW.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Fase-overzicht eerste maanden en resterende maanden.
3. Formatregels voor UI
    INVUL: Eurobedragen per dag/maand; duur in maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Dagloon/loon < 0, ontbrekend arbeidsverleden of parameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Recht op WW afhankelijk van weken-/jareneis; maximumdagloon toepassen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig dagloon of sv-loon in.” / “Vul het arbeidsverleden in.” / “Voor dit jaar ontbreken WW-parameters.”

Testset

1. Basiscase
    INVUL: Dagloon € 200, dagloondagen 21,75, percentage 75%. Maand € 3.262,50.
2. Edge-case
    INVUL: Dagloon boven maximum. Verwacht maximum toegepast.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandloon € 4.000, percentage 70%. Verwacht € 2.800.

Zorgtoeslag

Bron-URL: https://www.externe-bron.nl/inkomen/zorgtoeslag-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van zorgtoeslag op basis van toetsingsinkomen, vermogen, partnerstatus en jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Controleer voorwaarden: 18+, Nederlandse zorgverzekering, vermogen onder grens. Zoek maximumzorgtoeslag, normpremie en afbouw in toeslagenParameters[jaar].zorgtoeslag. zorgtoeslag = max(0, maximumZorgtoeslag - max(0, toetsingsinkomen - afbouwVanaf) * afbouwPercentage / 100). Bij toeslagpartner gebruik gezamenlijke parameters.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Toetsingsinkomen per jaar. Zorgtoeslag per jaar en maand.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s volgens toeslagparameter.

Output-contract

1. Primaire outputs
    INVUL: zorgtoeslagPerMaand, zorgtoeslagPerJaar, rechtOpZorgtoeslag, afbouw, maximumZorgtoeslag.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Inkomenstoets, vermogenstoets, partnerstatus en afbouwberekening.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand/jaar; conclusie recht ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen/vermogen < 0, ontbrekende partnerstatus of jaar onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd minimaal 18; vermogen onder grens; parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig toetsingsinkomen en vermogen in.” / “Kies of u een toeslagpartner heeft.” / “Voor dit jaar ontbreken zorgtoeslagparameters.”

Testset

1. Basiscase
    INVUL: Maximum € 1.200, afbouw € 300. Verwacht € 900/jaar.
2. Edge-case
    INVUL: Vermogen boven grens. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarbedrag € 1.080. Verwacht maand € 90.