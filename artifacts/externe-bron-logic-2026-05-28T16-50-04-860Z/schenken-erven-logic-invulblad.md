Schenken & Erven — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: schenken-erven
Aantal tools in dit invulblad: 14

Belastingaftrek bij giften

Bron-URL: https://www.externe-bron.nl/giften/belastingaftrek-giften-goede-doelen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van particuliere giften aftrekbaar is in de inkomstenbelasting en hoeveel belastingvoordeel dit oplevert.
2. Exacte formules/stappenvolgorde
    INVUL: Bepaal drempelInkomen volgens jaartabel/invoer. Voor gewone giften: drempel = max(minimumDrempel, drempelPercentage * drempelInkomen / 100). maximumAftrek = maximumPercentage * drempelInkomen / 100. aftrekGewoneGiften = min(max(0, gewoneGiften - drempel), maximumAftrek). Voor periodieke giften: aftrekPeriodiekeGiften = periodiekeGiften indien aan voorwaarden voldaan. Voor culturele ANBI kan factor gelden: verhoogdeGift = gift * multiplier, begrens op maximumVerhoging. totaleAftrek = aftrekGewoneGiften + aftrekPeriodiekeGiften + verhogingCultureleGift. belastingvoordeel = totaleAftrek * marginaalAftrekTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Giften en inkomen per kalenderjaar. Maandelijkse giften naar jaar via * 12. Percentages delen door 100. Tarieven/vrijstellingen via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aftrekbedragen eventueel op hele euro’s via fiscale parameter. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleGiften, aftrekbareGiften, nietAftrekbaarDeel, belastingvoordeel, nettoKostenGiften.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie gewone giften, periodieke giften, drempel, maximumaftrek, culturele ANBI-verhoging en toegepast aftrektarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; belastingjaar tonen; gewone en periodieke giften gescheiden tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Giften < 0, inkomen < 0 of aftrektarief buiten 0..100 is ongeldig. Geen giften ingevuld is onvoldoende. Ontbrekende jaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: giften >= 0; drempelInkomen >= 0; 0 <= aftrekTarief <= 100; gewone giften zijn alleen aftrekbaar boven drempel en tot maximum; periodieke giften alleen als voorwaarden zijn aangevinkt.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag aan giften in.” / “Vul een geldig drempelinkomen in.” / “Voor dit jaar ontbreken giftenaftrekparameters.” / “Periodieke giften zijn alleen aftrekbaar als aan de voorwaarden is voldaan.”

Testset

1. Basiscase
    INVUL: Drempelinkomen € 50.000, gewone giften € 1.000, drempel 1%, minimum € 0, maximum 10%, aftrektarief 40%. Verwacht drempel € 500, aftrek € 500, belastingvoordeel € 200.
2. Edge-case
    INVUL: Gewone giften € 400, drempel € 500. Verwacht aftrek € 0, belastingvoordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Periodieke gift € 1.200, aftrektarief 37%, voorwaarden voldaan. Verwacht aftrek € 1.200, voordeel € 444.

Belastingaftrek bij zakelijke giften

Bron-URL: https://www.externe-bron.nl/giften/belastingaftrek-zakelijke-giften-goede-doelen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het fiscale voordeel van zakelijke giften vanuit een onderneming of bv.
2. Exacte formules/stappenvolgorde
    INVUL: Bepaal soort gever: ibOndernemer of bv. Bij zakelijke gift/sponsoring met zakelijk belang: aftrekZakelijkeKosten = giftBedrag, waardoor belastingvoordeel = giftBedrag * marginaalTarief / 100. Bij bv-gift zonder direct zakelijk belang: pas giftenaftrekregels uit VPB-jaartabel toe: maximumAftrek = min(maximumBedrag, maximumPercentage * winst / 100). aftrekbareGift = min(giftBedrag, maximumAftrek). belastingvoordeel = aftrekbareGift * vpbTarief / 100. nettoKosten = giftBedrag - belastingvoordeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Gift en winst per boekjaar. Percentages delen door 100. Tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aftrekbedragen eventueel hele euro’s via fiscale parameter. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: giftBedrag, aftrekbareGift, belastingvoordeel, nettoKostenGift, nietAftrekbaarDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie geverstype, zakelijk karakter, maximumaftrek, toegepast tarief en restant niet-aftrekbaar.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; geverstype duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gift < 0, winst < 0 of tarief buiten 0..100 is ongeldig. Geverstype ontbreekt is onvoldoende. Ontbrekende fiscale parameters is onvoldoende.
2. Domeinbeperkingen
    INVUL: giftBedrag >= 0; winst >= 0; 0 <= belastingTarief <= 100; zakelijk/niet-zakelijk bepaalt aftrekregime.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig giftbedrag in.” / “Kies of de gift zakelijk of niet-zakelijk is.” / “Vul een geldige winst in.” / “Voor dit jaar ontbreken zakelijke giftenparameters.”

Testset

1. Basiscase
    INVUL: Bv-gift € 10.000, winst € 200.000, maximum 50% van winst, tarief 25%. Verwacht aftrek € 10.000, voordeel € 2.500.
2. Edge-case
    INVUL: Gift € 0. Verwacht aftrek en voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Gift € 20.000, maximumaftrek € 5.000, VPB 20%. Verwacht aftrek € 5.000, voordeel € 1.000, niet-aftrekbaar € 15.000.

Erfbelasting

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/erfbelasting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel erfbelasting een erfgenaam verschuldigd is over een verkrijging uit een nalatenschap.
2. Exacte formules/stappenvolgorde
    INVUL: brutoVerkrijging = erfdeel + legaten + overigeVerkrijgingen. aftrekbareSchuldenEnKosten = toerekenbareSchulden + uitvaartkosten + overigeAftrekposten. nettoVerkrijging = max(0, brutoVerkrijging - aftrekbareSchuldenEnKosten). Zoek vrijstelling op basis van relatie tot erflater in erfbelastingTabel. belastbareVerkrijging = max(0, nettoVerkrijging - vrijstelling). Bereken erfbelasting via schijven: belasting = Σ belastDeelSchijf * tariefRelatieSchijf.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bedragen per overlijden/nalatenschap. Tarieven en vrijstellingen per overlijdensjaar. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; belasting eventueel op hele euro’s via fiscale parameter. Schijfberekening intern zonder tussentijdse afronding.

Output-contract

1. Primaire outputs
    INVUL: nettoVerkrijging, vrijstelling, belastbareVerkrijging, erfbelasting, nettoNaErfbelasting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijvenspecificatie; relatiecategorie; aftrekposten; uitkomst per erfgenaam indien meerdere erfgenamen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; relatiecategorie en overlijdensjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verkrijging < 0, relatie ontbreekt of overlijdensjaar zonder tabel is ongeldig/onvoldoende. Schulden/kosten < 0 ongeldig. Netto verkrijging 0 is geldig.
2. Domeinbeperkingen
    INVUL: brutoVerkrijging >= 0; aftrekposten >= 0; relatie moet in tabel voorkomen; vrijstellingen/tarieven beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige verkrijging in.” / “Kies de relatie tot de erflater.” / “Voor dit overlijdensjaar ontbreken tarieven of vrijstellingen.” / “Aftrekposten mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Verkrijging € 100.000, vrijstelling € 20.000, tarief 10%. Verwacht belastbaar € 80.000, erfbelasting € 8.000.
2. Edge-case
    INVUL: Verkrijging lager dan vrijstelling. Verwacht erfbelasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Belastbare verkrijging € 150.000, schijf 1 € 100.000 tegen 10%, restant tegen 20%. Verwacht belasting € 20.000.

Geven in privé of de bv

Bron-URL: https://www.externe-bron.nl/giften/geven-prive-of-zakelijk.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken of een gift fiscaal gunstiger is vanuit privé of vanuit de bv.
2. Exacte formules/stappenvolgorde
    INVUL: Privévariant: bereken aftrekbare gift via particuliere giftenaftrek: belastingvoordeelPrive = aftrekbareGiftPrive * ibAftrekTarief / 100; nettoKostenPrive = giftBedrag - belastingvoordeelPrive. Bv-variant: aftrekbareGiftBv = min(giftBedrag, maximumZakelijkeGiftOfVpbGift). vpbVoordeel = aftrekbareGiftBv * vpbTarief / 100. Indien geld eerst als dividend naar privé moet: box2Druk = dividendNodig * box2Tarief / 100 als scenario. nettoKostenBv = giftBedrag - vpbVoordeel + eventueleBox2Effecten. Vergelijk: voordeelBvTovPrive = nettoKostenPrive - nettoKostenBv.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Gift per jaar/boekjaar. Tarieven en grenzen via jaartabellen. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Verschil op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoKostenPrive, nettoKostenBv, voordeligsteKeuze, verschil, belastingvoordeelPrive, belastingvoordeelBv.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie particuliere aftrek, zakelijke/VPB-aftrek, box 2-effect en niet-aftrekbaar deel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; keuze tonen als “privé voordeliger”, “bv voordeliger” of “gelijk”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gift < 0, ontbrekende tarieven of ontbrekend geverstype is ongeldig/onvoldoende. Inkomen/winst nodig voor drempels/maxima.
2. Domeinbeperkingen
    INVUL: giftBedrag >= 0; inkomsten/winst >= 0; tarieven 0..100; jaartabellen beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig giftbedrag in.” / “Vul inkomen en bv-winst in voor een vergelijking.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Gift € 1.000, privé voordeel € 300, bv voordeel € 250. Verwacht privé netto € 700, bv netto € 750, privé voordeliger met € 50.
2. Edge-case
    INVUL: Gift € 0. Verwacht beide netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Gift € 10.000, privé aftrek 0, bv aftrek volledig, VPB 20%. Verwacht privé netto € 10.000, bv netto € 8.000.

Kosten crematie of begrafenis

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/kosten-uitvaart-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de totale kosten van een crematie of begrafenis op basis van gekozen kostenposten en eventuele verzekering/voorziening.
2. Exacte formules/stappenvolgorde
    INVUL: totaleBrutoKosten = Σ kostenposten, bijvoorbeeld uitvaartverzorger, kist/urn, crematie/begrafenis, grafrechten, ceremonie, rouwkaarten, bloemen, catering, vervoer, advertentie en overige kosten. dekking = uitvaartverzekering + deposito + overigeVergoedingen. zelfTeBetalen = max(0, totaleBrutoKosten - dekking). overschotDekking = max(0, dekking - totaleBrutoKosten).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Eenmalige bedragen in euro. Geen maand/jaarconversie, tenzij premie-inleg optioneel wordt getoond.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aantallen op gehele stuks.

Output-contract

1. Primaire outputs
    INVUL: totaleUitvaartkosten, totaleDekking, zelfTeBetalen, overschotDekking.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per kostenpost; vergelijking crematie/begrafenis indien beide scenario’s zijn ingevoerd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; kostenposten in tabel; totaal duidelijk onderaan.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Kostenposten < 0 zijn ongeldig. Geen kostenposten ingevuld is onvoldoende. Dekking < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: Alle kosten en dekkingen >= 0; aantallen >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kostenpost in.” / “Kosten mogen niet negatief zijn.” / “Dekking mag niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Kosten € 8.000, verzekering € 5.000. Verwacht zelf te betalen € 3.000.
2. Edge-case
    INVUL: Dekking hoger dan kosten: kosten € 5.000, dekking € 7.000. Verwacht zelf te betalen € 0, overschot € 2.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Kostenposten € 1.000, € 2.500, € 500; dekking € 1.000. Verwacht totale kosten € 4.000, zelf te betalen € 3.000.

Particuliere gewone gift

Bron-URL: https://www.externe-bron.nl/giften/particuliere-gift-aftrekbaar.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een particuliere gewone gift aftrekbaar is en welk bedrag boven de drempel aftrekbaar blijft.
2. Exacte formules/stappenvolgorde
    INVUL: drempel = max(minimumDrempel, drempelPercentage * drempelInkomen / 100). maximumAftrek = maximumPercentage * drempelInkomen / 100. aftrekbaar = min(max(0, giftBedrag - drempel), maximumAftrek). nietAftrekbaar = giftBedrag - aftrekbaar. belastingvoordeel = aftrekbaar * marginaalAftrekTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Gift en drempelinkomen per kalenderjaar. Maandelijkse giften naar jaar via *12. Percentages via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Drempel/aftrek eventueel hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: giftBedrag, drempel, maximumAftrek, aftrekbaarBedrag, belastingvoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitleg drempelberekening, maximum en netto kosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; gewone gift duidelijk onderscheiden van periodieke gift.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gift < 0 of inkomen < 0 ongeldig. Geen ANBI/SBBI-status indien vereist maakt aftrek onvoldoende/niet relevant. Ontbrekende jaartabel onvoldoende.
2. Domeinbeperkingen
    INVUL: giftBedrag >= 0; drempelInkomen >= 0; instelling voldoet aan voorwaarden; aftrek nooit lager dan 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig giftbedrag in.” / “Vul een geldig drempelinkomen in.” / “De gift is alleen aftrekbaar bij een kwalificerende instelling.” / “Voor dit jaar ontbreken giftenaftrekparameters.”

Testset

1. Basiscase
    INVUL: Gift € 1.000, drempel € 300, maximum € 5.000, aftrektarief 40%. Verwacht aftrek € 700, voordeel € 280.
2. Edge-case
    INVUL: Gift exact gelijk aan drempel. Verwacht aftrek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Gift € 10.000, drempel € 500, maximum € 2.000. Verwacht aftrek € 2.000.

Periodieke giften

Bron-URL: https://www.externe-bron.nl/giften/periodieke-giften.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van aftrek en belastingvoordeel van periodieke giften die aan de voorwaarden voldoen.
2. Exacte formules/stappenvolgorde
    INVUL: Controleer voorwaarden: gift aan kwalificerende instelling, schriftelijke overeenkomst, vaste en gelijkmatige uitkeringen, looptijd volgens fiscale regels. Indien voorwaarden voldaan: aftrekbaar = jaarlijksePeriodiekeGift, zonder gewone-giftendrempel. Bij culturele ANBI: verhoging = min(jaarlijkseGift * (multiplier - 1), maximumVerhoging). totaleAftrek = aftrekbaar + verhoging. belastingvoordeel = totaleAftrek * marginaalAftrekTarief / 100. nettoKosten = jaarlijkseGift - belastingvoordeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandelijkse gift naar jaar via *12; kwartaal via *4; jaarlijkse gift direct. Percentages via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Looptijd in hele jaren. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: jaarlijksePeriodiekeGift, aftrekbareGift, belastingvoordeel, nettoKostenPerJaar, looptijdJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Totale gift over looptijd, totale belastingvoordeel, culturele ANBI-verhoging en voorwaardencheck.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; periode als maand/kwartaal/jaar; voorwaarden als “voldoet” of “voldoet niet”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gift < 0, aftrektarief buiten 0..100, looptijd te kort of voorwaarden niet aangevinkt is ongeldig/niet-aftrekbaar. Ontbrekende jaartabel onvoldoende.
2. Domeinbeperkingen
    INVUL: jaarlijkseGift >= 0; looptijdJaren voldoet aan fiscale minimumduur; 0 <= aftrekTarief <= 100; instelling kwalificeert.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige periodieke gift in.” / “De gift voldoet niet aan de voorwaarden voor periodieke giften.” / “Vul een geldig aftrektarief in.”

Testset

1. Basiscase
    INVUL: Periodieke gift € 100/mnd, aftrektarief 40%, voorwaarden voldaan. Verwacht jaar gift € 1.200, voordeel € 480.
2. Edge-case
    INVUL: Voorwaarden niet voldaan. Verwacht periodieke-giftenaftrek € 0 of doorverwijzing naar gewone gift.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarlijkse gift € 2.000, tarief 37%. Verwacht voordeel € 740.

Schenkbelasting

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/schenkbelasting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel schenkbelasting verschuldigd is over een schenking op basis van relatie, jaar en vrijstelling.
2. Exacte formules/stappenvolgorde
    INVUL: totaleSchenkingenJaar = schenking + eerdereSchenkingenZelfdeJaar. Zoek vrijstelling op basis van relatie en soort vrijstelling in schenkbelastingTabel. belastbareSchenking = max(0, totaleSchenkingenJaar - vrijstelling). Bereken schenkbelasting via tariefschijven voor relatiecategorie: belasting = Σ belastDeelSchijf * tariefRelatieSchijf. nettoOntvangen = schenking - belasting als belasting door ontvanger wordt betaald.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Schenkingen per kalenderjaar per schenker/ontvanger-combinatie. Percentages via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen; belasting eventueel hele euro’s via fiscale parameter. Schijfberekening intern zonder tussentijdse afronding.

Output-contract

1. Primaire outputs
    INVUL: totaleSchenking, vrijstelling, belastbareSchenking, schenkbelasting, nettoOntvangen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijvenspecificatie; relatiecategorie; toegepaste vrijstelling; eerdere schenkingen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; relatie en schenkjaar tonen; bruto/netto labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schenking < 0, relatie ontbreekt of jaartabel ontbreekt is ongeldig/onvoldoende. Vrijstellingstype niet passend bij relatie is ongeldig of niet relevant.
2. Domeinbeperkingen
    INVUL: schenking >= 0; relatie moet in tabel voorkomen; vrijstelling slechts toepassen indien voorwaarden zijn voldaan; eerdere schenkingen >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig schenkingsbedrag in.” / “Kies de relatie tussen schenker en ontvanger.” / “Deze vrijstelling past niet bij de gekozen relatie.” / “Voor dit jaar ontbreken tarieven of vrijstellingen.”

Testset

1. Basiscase
    INVUL: Schenking € 50.000, vrijstelling € 5.000, tarief 10%. Verwacht belastbaar € 45.000, belasting € 4.500.
2. Edge-case
    INVUL: Schenking lager dan vrijstelling. Verwacht belasting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Belastbare schenking € 150.000, eerste schijf € 100.000 tegen 10%, restant tegen 20%. Verwacht belasting € 20.000.

Schenken netto-bruto

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/schenken-netto-bruto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke bruto schenking nodig is zodat de ontvanger na schenkbelasting een gewenst netto bedrag overhoudt.
2. Exacte formules/stappenvolgorde
    INVUL: Gegeven gewenst nettoBedrag. Zoek bruto schenking B zodat B - schenkbelasting(B) = nettoBedrag. Gebruik binaire zoekmethode tussen nettoBedrag en een hoge bovengrens. Per iteratie: bereken schenkbelasting volgens vrijstelling en schijven. Stop als afwijking < € 0,01. Ook omgekeerd tonen: bij bekende bruto schenking netto = bruto - belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Schenking per kalenderjaar. Tarieven/vrijstellingen via jaartabel. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bruto benodigde schenking op 2 decimalen. Belasting op 2 decimalen. Iteratie toleranties 0,005.

Output-contract

1. Primaire outputs
    INVUL: gewenstNettoBedrag, benodigdeBrutoSchenking, schenkbelasting, vrijstelling, belastbareSchenking.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijvenspecificatie en bruto-netto relatie; waarschuwing wie belasting betaalt.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; relatie/schenkjaar tonen; “bruto” en “netto” duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Netto bedrag < 0, relatie ontbreekt of jaartabel ontbreekt is ongeldig/onvoldoende. Netto bedrag 0 is geldig.
2. Domeinbeperkingen
    INVUL: nettoBedrag >= 0; relatie moet in tabel voorkomen; binaire zoekbovengrens moet gevonden worden binnen max iteraties.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig netto bedrag in.” / “Kies de relatie tussen schenker en ontvanger.” / “Voor dit jaar ontbreken tarieven of vrijstellingen.” / “De bruto schenking kon niet worden bepaald.”

Testset

1. Basiscase
    INVUL: Vrijstelling € 0, vlak tarief 10%, gewenst netto € 9.000. Verwacht bruto € 10.000, belasting € 1.000.
2. Edge-case
    INVUL: Gewenst netto € 0. Verwacht bruto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Vrijstelling € 5.000, tarief 10%, gewenst netto € 14.000. Verwacht bruto € 15.000, belasting € 1.000.

Waarde erfdeel langstlevende ouder

Bron-URL: https://www.externe-bron.nl/erven/waarde-erfdeel-langstlevende-ouder-bij-wettelijke-verdeling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de fiscale waarde van de vordering van kinderen en het vruchtgebruik/voordeel van de langstlevende ouder bij wettelijke verdeling.
2. Exacte formules/stappenvolgorde
    INVUL: nalatenschap = bezittingen - schulden - uitvaartkosten. aantalErfdelen = langstlevendeAanwezig ? aantalKinderen + 1 : aantalKinderen. nominaalErfdeelPerPersoon = nalatenschap / aantalErfdelen. Bij wettelijke verdeling krijgen kinderen een niet-opeisbare vordering. Waarde kindvordering = nominale vordering * waarderingsfactor afhankelijk van leeftijd langstlevende, renteafspraak en fiscale tabel. waardeVruchtgebruikLangstlevende = nominaleKindvorderingenTotaal - fiscaleWaardeKindvorderingenTotaal. Verkrijging langstlevende = eigen erfdeel + vruchtgebruikwaarde; verkrijging kind = fiscale waarde vordering.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Leeftijd in jaren op overlijdensdatum. Rentepercentage als jaarlijkse rente. Waarderingsfactor via jaartabel/vruchtgebruikfactoren.
4. Afrondingsregels
    INVUL: Erfdelen en waardes op 2 decimalen. Aantal erfgenamen als geheel getal. Factoren met 4 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nalatenschap, nominaalErfdeelPerKind, fiscaleWaardeVorderingPerKind, waardeVruchtgebruikLangstlevende, verkrijgingLangstlevende.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Overzicht per erfgenaam; factorentabel; nominale versus fiscale waarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; factoren met 4 decimalen; leeftijd in jaren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bezittingen/schulden ontbreken is onvoldoende. Aantal kinderen < 1 voor wettelijke verdeling is ongeldig. Leeftijd langstlevende ontbreekt is onvoldoende voor waardering. Nalatenschap negatief is geldig als negatieve nalatenschap, maar fiscale verkrijging wordt niet automatisch positief.
2. Domeinbeperkingen
    INVUL: aantalKinderen >= 1; leeftijd langstlevende binnen factorentabel; bezittingen en schulden >= 0; waarderingsfactor beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige bezittingen en schulden in.” / “Vul minimaal één kind in.” / “Vul de leeftijd van de langstlevende ouder in.” / “Voor deze leeftijd ontbreekt een waarderingsfactor.”

Testset

1. Basiscase
    INVUL: Nalatenschap € 300.000, langstlevende + 2 kinderen, factor kindvordering 0,60. Nominaal erfdeel € 100.000; waarde per kind € 60.000; vruchtgebruikwaarde totaal € 80.000; verkrijging langstlevende € 180.000.
2. Edge-case
    INVUL: Factor 1,00. Verwacht fiscale waarde kindvordering = nominale vordering, vruchtgebruikwaarde € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Nalatenschap € 400.000, 3 kinderen + langstlevende, factor 0,50. Nominaal per erfdeel € 100.000; waarde per kind € 50.000.

Waarde periodieke uitkering

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/waarde-periodieke-uitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de contante/fiscale waarde van een periodieke uitkering voor schenk- of erfbelasting.
2. Exacte formules/stappenvolgorde
    INVUL: Bij vaste looptijd: PV = uitkeringPerPeriode * (1 - (1+r)^(-n)) / r; bij r = 0: PV = uitkeringPerPeriode * n. Bij uitkering begin periode: PV_begin = PV * (1+r). Bij levensafhankelijke uitkering: PV = jaaruitkering * fiscaleFactor uit leeftijds-/geslacht-/looptijdtabel. Eventuele indexatie: gebruik rReëel = (1+r)/(1+indexatie)-1 of modelleer per jaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maanduitkering naar jaar via *12 of maandperioden met maandrente. Jaarlijkse rekenrente naar perioderente via effectieve formule. Factoren via jaartabel.
4. Afrondingsregels
    INVUL: Contante waarde op 2 decimalen. Factoren met 4 decimalen. Uitkeringen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: waardePeriodiekeUitkering, uitkeringPerPeriode, aantalPerioden, rekenrente, totaalNominaal.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaar-/periodeschema met uitkering en contante waarde; gebruikte fiscale factor.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentepercentage met 2 decimalen; periode als maand/kwartaal/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering < 0, looptijd <= 0 bij vaste looptijd, rekenrente <= -100% per periode of ontbrekende factor bij levensafhankelijk is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: uitkering >= 0; n > 0; r > -100%; factor > 0 indien gebruikt.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige periodieke uitkering in.” / “Vul een positieve looptijd in.” / “Vul een geldige rekenrente in.” / “Voor deze levensafhankelijke uitkering ontbreekt een fiscale factor.”

Testset

1. Basiscase
    INVUL: Jaaruitkering € 10.000, 10 jaar, rente 0%. Verwacht waarde € 100.000.
2. Edge-case
    INVUL: Uitkering € 0. Verwacht waarde € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaaruitkering € 5.000, fiscale factor 12. Verwacht waarde € 60.000.

Waarde verhuurde woning

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/waarde-verhuurde-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de fiscale waarde van een verhuurde woning voor schenken/erven, op basis van WOZ-waarde en leegwaarderatio of andere waarderingsfactor.
2. Exacte formules/stappenvolgorde
    INVUL: jaarhuur = maandhuur * 12 indien maandhuur ingevoerd. huurpercentage = jaarhuur / wozWaarde * 100. Zoek leegwaarderatio in jaartabel op basis van huurpercentage en verhuursituatie. waardeVerhuurdeWoning = wozWaarde * leegwaarderatio / 100. Indien geen recht op leegwaarderatio of tijdelijke verhuur uitgesloten: waardeVerhuurdeWoning = wozWaarde.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaarhuur via *12. Leegwaarderatio als percentage. WOZ-waarde in euro.
4. Afrondingsregels
    INVUL: Huurpercentage met 2 decimalen. Waarde op 2 decimalen of hele euro’s via fiscale parameter. Ratio met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: wozWaarde, jaarhuur, huurpercentageVanWoz, leegwaarderatio, waardeVerhuurdeWoning.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toegepaste ratio-schijf; melding of leegwaarderatio wel/niet van toepassing is.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; WOZ-peiljaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: WOZ-waarde <= 0 is ongeldig. Huur < 0 ongeldig. Ontbrekende leegwaarderatio-tabel is onvoldoende. Huur 0 kan geldig zijn maar ratio moet uit tabel volgen of waarde gelijk WOZ volgens parameter.
2. Domeinbeperkingen
    INVUL: wozWaarde > 0; jaarhuur >= 0; verhuursituatie moet kwalificeren; jaartabel beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige WOZ-waarde in.” / “Vul een geldige huur in.” / “Voor dit jaar ontbreekt de leegwaarderatio-tabel.” / “De leegwaarderatio is niet van toepassing op deze verhuursituatie.”

Testset

1. Basiscase
    INVUL: WOZ € 300.000, leegwaarderatio 80%. Verwacht waarde € 240.000.
2. Edge-case
    INVUL: Geen kwalificerende verhuur. Verwacht waarde = WOZ.
3. Regresstest tegen bekende uitkomst
    INVUL: WOZ € 500.000, maandhuur € 1.000, ratio uit tabel 85%. Verwacht jaarhuur € 12.000, waarde € 425.000.

Waarde vruchtgebruik & blote eigendom

Bron-URL: https://www.externe-bron.nl/schenken-en-erven/waarde-vruchtgebruik-blote-eigendom.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de waarde van vruchtgebruik en blote eigendom van een goed voor schenk- of erfbelasting.
2. Exacte formules/stappenvolgorde
    INVUL: volleEigendomWaarde = waardeGoed. Bij levenslang vruchtgebruik: zoek vruchtgebruikFactor in fiscale factorentabel op basis van leeftijd vruchtgebruiker en eventueel geslacht/looptijd. waardeVruchtgebruik = volleEigendomWaarde * vruchtgebruikFactor / 100 of jaaropbrengst * kapitalisatiefactor volgens gekozen tabel. waardeBloteEigendom = volleEigendomWaarde - waardeVruchtgebruik. Bij tijdelijk vruchtgebruik met looptijd n: gebruik contante waarde van jaarlijkse opbrengst: PV = jaaropbrengst * (1 - (1+r)^(-n)) / r.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Waarde in euro. Leeftijd in jaren. Jaaropbrengst in euro per jaar. Rekenrente/factor via fiscale jaartabel.
4. Afrondingsregels
    INVUL: Waardes op 2 decimalen of hele euro’s via fiscale parameter. Factoren met 4 decimalen of percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: waardeVolleEigendom, waardeVruchtgebruik, waardeBloteEigendom, vruchtgebruikFactor, typeVruchtgebruik.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Gebruikte leeftijd/factor; tijdelijke looptijd; jaarlijkse opbrengst; waarderingsmethode.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; factor/percentage duidelijk tonen; type vruchtgebruik labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Waarde goed < 0 ongeldig. Leeftijd of looptijd ontbreekt is onvoldoende afhankelijk van type. Factorentabel ontbreekt onvoldoende. Vruchtgebruikwaarde mag volle eigendom niet overschrijden.
2. Domeinbeperkingen
    INVUL: waardeGoed >= 0; leeftijd binnen factorentabel; looptijd > 0 bij tijdelijk vruchtgebruik; 0 <= waardeVruchtgebruik <= waardeVolleEigendom.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige waarde van het goed in.” / “Vul de leeftijd van de vruchtgebruiker in.” / “Voor deze leeftijd ontbreekt een vruchtgebruikfactor.” / “De waarde van het vruchtgebruik kan niet hoger zijn dan de volle eigendom.”

Testset

1. Basiscase
    INVUL: Volle eigendom € 300.000, vruchtgebruikfactor 40%. Verwacht vruchtgebruik € 120.000, blote eigendom € 180.000.
2. Edge-case
    INVUL: Factor 0%. Verwacht vruchtgebruik € 0, blote eigendom = volle eigendom.
3. Regresstest tegen bekende uitkomst
    INVUL: Volle eigendom € 500.000, factor 60%. Verwacht vruchtgebruik € 300.000, blote eigendom € 200.000.

Zakelijke giften

Bron-URL: https://www.externe-bron.nl/giften/zakelijke-giften.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de netto kosten en fiscale aftrekbaarheid van zakelijke giften, sponsoring of donaties door een onderneming.
2. Exacte formules/stappenvolgorde
    INVUL: Classificeer betaling: sponsoring/zakelijke kosten of gift. Bij zakelijke kosten: aftrekbaar = bedragExBtw, btw aftrekbaar indien btw-belaste prestatie en factuur aanwezig: btwAftrek = btwBedrag * aftrekPercentage/100. belastingvoordeel = aftrekbaar * belastingTarief / 100. Bij gift: gebruik zakelijke giftenaftrekregels en maxima. nettoKosten = bedragInclBtw - btwAftrek - belastingvoordeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bedragen per boekjaar. Btw percentage delen door 100. Belastingtarief via IB/VPB-jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Btw en belastingvoordeel op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoKosten, aftrekbaarBedrag, btwAftrek, belastingvoordeel, nettoKosten, nietAftrekbaarDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Classificatie sponsoring/gift; btw-specificatie; maximumaftrek; toegepast tarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; ex/incl btw duidelijk tonen; geverstype en classificatie tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedrag < 0, btw-tarief < 0, aftrekpercentage buiten 0..100, classificatie ontbreekt of belastingtarief ontbreekt is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: bedrag >= 0; 0 <= btwTarief; 0 <= btwAftrekPercentage <= 100; belastingtarief 0..100; zakelijke kosten alleen aftrekbaar bij zakelijk belang.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag in.” / “Kies of sprake is van sponsoring, zakelijke kosten of een gift.” / “Vul een geldig btw-percentage in.” / “Vul een geldig belastingtarief in.”

Testset

1. Basiscase
    INVUL: Sponsoring ex btw € 1.000, btw 21%, btw volledig aftrekbaar, belastingtarief 25%. Bruto incl € 1.210, btw aftrek € 210, belastingvoordeel € 250, netto kosten € 750.
2. Edge-case
    INVUL: Bedrag € 0. Verwacht alle uitkomsten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Gift € 10.000, aftrekbaar € 5.000, belastingtarief 20%, geen btw. Verwacht voordeel € 1.000, netto kosten € 9.000.