Pensioen, AOW, pensioengat, jaarruimte — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: pensioen-aow
Aantal tools in dit invulblad: 28

Aanvullend pensioen berekenen

Bron-URL: https://www.externe-bron.nl/pensioen/aanvullend-pensioen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel aanvullend pensioen nodig is om een gewenst pensioeninkomen te bereiken, en/of welk kapitaal of maandelijkse inleg daarvoor nodig is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: pensioenTekortPerJaar = gewenstPensioenPerJaar - verwachtAowPerJaar - verwachtWerkgeversPensioenPerJaar - overigePensioeninkomsten. Begrens tekort op minimaal 0. Stap 2: bepaal benodigde pensioenpot op pensioendatum: bij vaste uitkeringsduur n en perioderente r: benodigdePot = uitkeringPerPeriode * (1 - (1+r)^(-n)) / r; bij r = 0: benodigdePot = uitkeringPerPeriode * n. Stap 3: bepaal benodigde inleg tot pensioendatum: FV_start = huidigPensioenKapitaal * (1+r)^m; benodigde periodieke inleg bij einde periode: inleg = (benodigdePot - FV_start) * r / ((1+r)^m - 1); bij r = 0: inleg = (benodigdePot - huidigPensioenKapitaal) / m.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarbedragen naar maandbedragen via /12. Jaarlijks rendement naar maandrendement via rMaand = (1 + rendementJaar/100)^(1/12) - 1 of nominale variant via parameter. Looptijd in jaren naar maanden via *12.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Tekort en benodigde inleg op 2 decimalen. Looptijden in hele maanden. Negatief tekort tonen als € 0 tekort.

Output-contract

1. Primaire outputs
    INVUL: pensioenTekortPerJaar, pensioenTekortPerMaand, benodigdePensioenpot, benodigdeInlegPerMaand, verwachtPensioeninkomenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Opbouwschema tot pensioendatum; uitkeringsschema na pensioendatum; grafiek gewenst inkomen versus verwacht inkomen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; leeftijden als jaren en maanden; pensioenbedragen bruto tenzij expliciet netto gekozen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Gewenst pensioeninkomen ontbreekt of < 0 is ongeldig. Pensioenleeftijd vóór huidige leeftijd is ongeldig. Rendement <= -100% per periode is ongeldig. Ontbrekende AOW/pensioeninformatie maakt uitkomst onvoldoende.
2. Domeinbeperkingen
    INVUL: gewenstPensioen >= 0; pensioenleeftijd > huidigeLeeftijd; uitkeringsduur > 0; rendement per periode > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig gewenst pensioeninkomen in.” / “De pensioenleeftijd moet na de huidige leeftijd liggen.” / “Vul een geldig rendement in.” / “Vul voldoende pensioeninkomsten in.”

Testset

1. Basiscase
    INVUL: Gewenst pensioen € 40.000/jaar, AOW € 15.000, werkgeverspensioen € 15.000. Verwacht tekort € 10.000/jaar.
2. Edge-case
    INVUL: Gewenst pensioen € 30.000, verwacht inkomen € 35.000. Verwacht tekort € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Tekort € 12.000/jaar, uitkering 20 jaar, rendement 0%. Verwacht benodigde pot € 240.000.

AOW-leeftijd

Bron-URL: https://www.externe-bron.nl/pensioen/aow-leeftijd.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen van de AOW-leeftijd en AOW-ingangsdatum op basis van geboortedatum en de wettelijke AOW-leeftijdtabel.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees geboortedatum. Stap 2: zoek in aowLeeftijdTabel welke AOW-leeftijd geldt voor de geboortedatum of geboortejaarcohort. Stap 3: aowDatum = geboortedatum + aowLeeftijdJaren + aowLeeftijdMaanden. Stap 4: bereken resterende tijd tot AOW-datum vanaf peildatum: jaren, maanden, dagen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Leeftijd wordt kalenderkundig opgeteld bij geboortedatum. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Geen afronding; datum exact volgens tabel. Resterende tijd als jaren/maanden/dagen.

Output-contract

1. Primaire outputs
    INVUL: aowLeeftijdJaren, aowLeeftijdMaanden, aowDatum, resterendeTijdTotAow.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel tabelregel/cohort waarop de uitkomst is gebaseerd; melding “onder voorbehoud” voor toekomstige jaren indien wettelijk nog niet definitief.
3. Formatregels voor UI
    INVUL: Datum als dd-mm-jjjj; leeftijd als x jaar en y maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende, ongeldige of toekomstige geboortedatum is ongeldig. Geboortedatum buiten tabelbereik is onvoldoende.
2. Domeinbeperkingen
    INVUL: geboortedatum <= vandaag; AOW-tabel moet beschikbaar zijn voor geboortejaar/cohort.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige geboortedatum in.” / “Voor deze geboortedatum is geen AOW-leeftijd beschikbaar.” / “De AOW-leeftijd voor dit geboortejaar is nog niet definitief.”

Testset

1. Basiscase
    INVUL: Geboortedatum met tabelwaarde 67 jaar. Verwacht AOW-datum = geboortedatum + 67 jaar.
2. Edge-case
    INVUL: Geboortedatum vandaag of in toekomst. Verwacht bij toekomst: foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Geboortedatum 01-01-1960, tabelparameter AOW-leeftijd 67 jaar. Verwacht AOW-datum 01-01-2027.

Banksparen voor Pensioen

Bron-URL: https://www.externe-bron.nl/pensioen/banksparen-pensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel kapitaal wordt opgebouwd met banksparen voor pensioen op basis van startkapitaal, periodieke inleg, looptijd en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: r = periodiekRendement, n = aantalPerioden, P0 = startkapitaal, I = periodiekeInleg. Eindwaarde bij inleg einde periode: FV = P0*(1+r)^n + I*((1+r)^n - 1)/r. Bij r = 0: FV = P0 + I*n. Bij inleg begin periode: vermenigvuldig inlegcomponent met (1+r).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement via effectieve formule rMaand = (1 + rendementJaar/100)^(1/12) - 1, tenzij nominale variant gekozen. Looptijd jaren naar maanden via *12. Inleg per maand of jaar naar gekozen periode.
4. Afrondingsregels
    INVUL: Eindkapitaal op 2 decimalen. Rendement op 2 decimalen. Schema per jaar op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindKapitaal, totaleInleg, totaalRendement, looptijdMaanden, periodiekeInleg.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks opbouwschema met beginwaarde, inleg, rendement, eindwaarde. Grafiek kapitaalontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement als percentage; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startkapitaal of inleg < 0 is ongeldig. Looptijd < 0 ongeldig; looptijd 0 is geldig en geeft startkapitaal. Rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: startkapitaal >= 0; periodiekeInleg >= 0; looptijd >= 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig startkapitaal in.” / “Vul een geldige inleg in.” / “Vul een geldige looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Start € 0, inleg € 100/mnd, rendement 0%, looptijd 10 jaar. Verwacht eindkapitaal € 12.000.
2. Edge-case
    INVUL: Looptijd 0, start € 5.000. Verwacht eindkapitaal € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Start € 10.000, geen inleg, rendement 5%, 1 jaar. Verwacht € 10.500.

Bruto-netto AOW & pensioen

Bron-URL: https://www.externe-bron.nl/pensioen/bruto-netto-aow-pensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto inkomen uit AOW en pensioen op basis van bruto bedragen, leeftijd en belastingjaar.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaar = brutoAowJaar + brutoPensioenJaar + brutoLijfrenteJaar. Bepaal of AOW-leeftijd is bereikt. Pas box 1-tarieventabel toe voor AOW-gerechtigden. Bereken heffingskortingen, ouderenkorting en eventuele alleenstaande ouderenkorting via jaartabel. belastingNaKortingen = max(0, belastingVoorKortingen - kortingen). nettoJaar = brutoJaar - belastingNaKortingen - inhoudingenZvw. nettoMaand = nettoJaar / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandbedragen naar jaar via *12. Jaarbedragen naar maand via /12. Tarieven uit jaartabel.
4. Afrondingsregels
    INVUL: Jaar- en maandbedragen op 2 decimalen. Belastingcomponenten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoInkomenPerJaar, nettoInkomenPerJaar, nettoInkomenPerMaand, loonheffingInkomstenbelasting, heffingskortingen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie AOW, pensioen, lijfrente, belasting per schijf, kortingen en inhoudingen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; belastingjaar tonen; bruto/netto duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Alle bruto-inkomsten leeg is onvoldoende. Negatieve inkomsten zijn ongeldig tenzij correctiepost. Ontbrekende belastingjaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: brutoInkomen >= 0; fiscale parameters beschikbaar; leeftijd/geboortedatum nodig voor AOW-tarieven/kortingen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één bruto uitkering in.” / “Vul geldige bruto bedragen in.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Bruto jaar € 30.000, vlak belastingtarief 20%, kortingen € 0. Verwacht netto € 24.000.
2. Edge-case
    INVUL: Bruto € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 12.000, belasting 10%, korting € 500. Verwacht netto € 11.300.

Bruto-netto eerste pensioenjaar

Bron-URL: https://www.externe-bron.nl/pensioen/bruto-netto-eerste-pensioenjaar.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto inkomen in het eerste pensioenjaar, waarin een deel van het jaar vóór en een deel ná AOW-/pensioendatum valt.
2. Exacte formules/stappenvolgorde
    INVUL: Splits jaar in perioden vóór en na pensioendatum. loonVoorPensioen = maandLoon * maandenVoorPensioen. pensioenNaDatum = maandPensioen * maandenNaPensioen. aowNaDatum = maandAow * maandenNaAow. Tel jaarinkomen. Pas belastingtarieven toe op basis van exacte jaarregels; indien tool vereenvoudigt: reken volledig jaar met geldende fiscale status per periode en corrigeer tijdsevenredig. nettoJaar = brutoJaar - belasting - premies + kortingen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maanden tellen kalenderkundig of als fractie: dagenInPeriode / dagenInJaar. Maandbedragen naar jaar/fractie via vermenigvuldiging met maanden of dagfractie.
4. Afrondingsregels
    INVUL: Periodebedragen op 2 decimalen. Maanden als gehele maanden of dagfractie met 4 decimalen. Netto jaar op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoEerstePensioenjaar, nettoEerstePensioenjaar, nettoGemiddeldPerMaand, inkomenVoorPensioen, inkomenNaPensioen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Periode-overzicht vóór pensioen, na pensioen, AOW, pensioen, loon en belasting.
3. Formatregels voor UI
    INVUL: Datums dd-mm-jjjj; eurobedragen met 2 decimalen; perioden duidelijk uitgesplitst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Pensioendatum buiten belastingjaar is ongeldig voor deze tool of niet relevant. Inkomsten < 0 ongeldig. Ontbrekende fiscale parameters onvoldoende.
2. Domeinbeperkingen
    INVUL: Pensioendatum moet binnen gekozen jaar liggen; bedragen >= 0; jaartabellen beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige pensioendatum in.” / “De pensioendatum moet in het gekozen jaar liggen.” / “Vul geldige bruto bedragen in.”

Testset

1. Basiscase
    INVUL: Pensioenstart na 6 maanden; loon € 3.000/mnd voor 6 maanden; pensioen € 2.000/mnd voor 6 maanden; geen belasting. Verwacht bruto € 30.000.
2. Edge-case
    INVUL: Pensioendatum 1 januari. Verwacht volledig pensioenjaar, geen loonperiode.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto € 30.000, belasting 20%. Verwacht netto € 24.000.

Bruto-netto pensioen + ander inkomen

Bron-URL: https://www.externe-bron.nl/pensioen/bruto-netto-pensioen-met-inkomen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto pensioeninkomen wanneer naast pensioen ook ander inkomen aanwezig is.
2. Exacte formules/stappenvolgorde
    INVUL: totaalBox1 = pensioen + AOW + lijfrente + anderInkomen. Bereken belasting over totaal inkomen via jaartabel. Bepaal belasting zonder pensioen: belastingZonderPensioen = belasting(anderInkomen + AOW + lijfrente). extraBelastingDoorPensioen = belastingTotaal - belastingZonderPensioen. nettoPensioen = brutoPensioen - extraBelastingDoorPensioen. nettoTotaal = totaalBox1 - belastingTotaal.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomsten per jaar; maandbedragen via *12 of /12. Tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Marginaal tarief op pensioen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoPensioen, nettoPensioen, nettoTotaalInkomen, extraBelastingDoorPensioen, marginaalTariefPensioen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Belastingberekening met en zonder pensioen; schijvenspecificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaar/maand duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Pensioen of ander inkomen < 0 ongeldig. Geen pensioen ingevuld is onvoldoende. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomsten >= 0; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig pensioenbedrag in.” / “Vul geldige overige inkomsten in.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Pensioen € 10.000, ander inkomen € 20.000, vlak tarief 30%. Verwacht netto pensioen € 7.000.
2. Edge-case
    INVUL: Ander inkomen € 0. Verwacht gewone bruto-netto pensioenberekening.
3. Regresstest tegen bekende uitkomst
    INVUL: Extra pensioen € 5.000, marginaal tarief 40%. Verwacht netto extra € 3.000.

Bruto-netto vroegpensioen + ander inkomen

Bron-URL: https://www.externe-bron.nl/pensioen/bruto-netto-vroegpensioen-inkomen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto vroegpensioen vóór AOW-leeftijd in combinatie met ander inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: totaalBox1 = vroegpensioen + loon/uitkering/overigInkomen. Gebruik belastingtarieven vóór AOW-leeftijd. Bereken belasting en heffingskortingen via jaartabel. nettoTotaal = totaalBox1 - belastingNaKortingen - premies. Bereken ook netto vroegpensioen marginaal: belasting met en zonder vroegpensioen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandbedragen naar jaar via *12. Geen AOW-tarief toepassen als AOW-leeftijd niet bereikt is.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoVroegpensioen, nettoVroegpensioen, nettoTotaalInkomen, belastingEnPremies, marginaalTariefVroegpensioen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schijvenspecificatie; vergelijking vóór en na AOW-leeftijd indien relevant.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; status “vóór AOW-leeftijd” duidelijk tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geboortedatum/AOW-status ontbreekt is onvoldoende. Inkomsten < 0 ongeldig. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Vroegpensioendatum vóór AOW-datum; inkomsten >= 0; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig vroegpensioenbedrag in.” / “Deze tool is bedoeld voor inkomen vóór AOW-leeftijd.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Vroegpensioen € 20.000, ander inkomen € 10.000, vlak tarief 40%. Verwacht netto totaal € 18.000.
2. Edge-case
    INVUL: Vroegpensioen € 0. Verwacht netto vroegpensioen € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Extra vroegpensioen € 12.000, marginaal tarief 50%. Verwacht netto € 6.000.

Doorwerken na uw pensioen

Bron-URL: https://www.externe-bron.nl/pensioen/doorwerken-na-uw-pensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat doorwerken na pensioen netto oplevert naast AOW en pensioen.
2. Exacte formules/stappenvolgorde
    INVUL: inkomenZonderWerk = AOW + pensioen + lijfrente. inkomenMetWerk = inkomenZonderWerk + arbeidsinkomen. Bereken belasting en kortingen voor beide situaties via jaartabel AOW-gerechtigden. extraBelasting = belastingMetWerk - belastingZonderWerk. nettoExtraArbeid = arbeidsinkomen - extraBelasting - eventuelePremies. nettoTotaalMetWerk = inkomenMetWerk - belastingMetWerk.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Arbeidsinkomen per maand naar jaar via *12. Uitkomsten per jaar en per maand.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Marginaal tarief op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoExtraDoorwerken, nettoTotaalMetWerk, extraBelasting, marginaalTariefArbeidsinkomen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking zonder en met doorwerken; belasting- en kortingeneffect.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; per jaar en per maand tonen; arbeidsinkomen apart.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Arbeidsinkomen < 0 ongeldig. Ontbrekende pensioen/AOW kan 0 zijn. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Inkomsten >= 0; AOW-status bekend; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig arbeidsinkomen in.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Arbeidsinkomen € 10.000, marginaal tarief 30%. Verwacht netto extra € 7.000.
2. Edge-case
    INVUL: Arbeidsinkomen € 0. Verwacht netto extra € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Inkomen zonder werk belasting € 2.000, met werk belasting € 6.000, arbeidsinkomen € 10.000. Verwacht netto extra € 6.000.

Extra pensioenuitkering

Bron-URL: https://www.externe-bron.nl/pensioen/extra-pensioenuitkering-bruto-netto.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat een extra pensioenuitkering netto oplevert bovenop bestaand inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken belasting over bestaandInkomen en over bestaandInkomen + extraPensioen. extraBelasting = belastingNieuw - belastingOud. nettoExtraPensioen = extraPensioen - extraBelasting. marginaalTarief = extraBelasting / extraPensioen * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Extra uitkering per jaar of eenmalig. Maand naar jaar via *12 indien periodiek. Tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Marginaal tarief met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoExtraPensioen, nettoExtraPensioen, extraBelasting, marginaalTarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Belasting voor/na extra uitkering; schijvenspecificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Extra pensioen <= 0 ongeldig. Bestaand inkomen < 0 ongeldig. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: extraPensioen > 0; bestaand inkomen >= 0; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve extra pensioenuitkering in.” / “Vul een geldig bestaand inkomen in.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Extra pensioen € 1.000, marginaal tarief 30%. Verwacht netto € 700.
2. Edge-case
    INVUL: Extra pensioen € 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Extra € 5.000, extra belasting € 2.000. Verwacht netto € 3.000, marginaal 40%.

Hoogte AOW-uitkering

Bron-URL: https://www.externe-bron.nl/pensioen/hoogte-aow-uitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de bruto AOW-uitkering op basis van leefvorm, opbouwjaren en eventuele korting door jaren buiten Nederland.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek volledigeAowBedrag in AOW-jaartabel op basis van leefvorm: alleenstaand/samenwonend/gehuwd. opbouwPercentage = min(100, aantalVerzekerdeJaren * 2%), bij 50 opbouwjaren volledig. kortingPercentage = 100 - opbouwPercentage. brutoAow = volledigeAowBedrag * opbouwPercentage / 100. Netto kan via bruto-netto module.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: AOW-bedragen per maand of jaar uit tabel. Maand naar jaar via *12. Opbouw: 2% per verzekerd jaar.
4. Afrondingsregels
    INVUL: AOW-bedragen op 2 decimalen. Opbouwpercentage met 2 decimalen. Verzekerde jaren eventueel met 1 of 2 decimalen als maandnauwkeurig.

Output-contract

1. Primaire outputs
    INVUL: brutoAowPerMaand, brutoAowPerJaar, opbouwPercentage, kortingPercentage, leefvorm.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Opbouwjaren, ontbrekende jaren, volledige AOW-bedrag uit tabel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; leefvorm als label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leefvorm ontbreekt is onvoldoende. Verzekerde jaren < 0 ongeldig. AOW-tabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= verzekerdeJaren <= 50; leefvorm moet in tabel voorkomen; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een geldige leefvorm.” / “Vul een geldig aantal AOW-opbouwjaren in.” / “Voor dit jaar ontbreken AOW-bedragen.”

Testset

1. Basiscase
    INVUL: Volledig bedrag € 1.500/mnd, 50 verzekerde jaren. Verwacht € 1.500/mnd.
2. Edge-case
    INVUL: 0 verzekerde jaren. Verwacht AOW € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Volledig bedrag € 1.000, 40 jaren. Verwacht opbouw 80%, AOW € 800.

Jaarruimte & belastingteruggave

Bron-URL: https://www.externe-bron.nl/pensioen/jaarruimte-belastingteruggave.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van jaarruimte voor lijfrentepremie en de indicatieve belastingteruggave bij storting.
2. Exacte formules/stappenvolgorde
    INVUL: Gebruik jaarruimteformule uit jaartabel: premiegrondslag = max(0, inkomen - franchise), begrens op maximum volgens jaartabel. jaarruimte = max(0, jaarruimtePercentage * premiegrondslag - factorA - dotatieOudedagsreserve - overigeCorrecties). aftrekbareStorting = min(storting, jaarruimte). belastingteruggave = aftrekbareStorting * marginaalAftrekTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen en factor A per jaar. Percentages uit jaartabel. Maandinkomen naar jaar via *12.
4. Afrondingsregels
    INVUL: Jaarruimte op 2 decimalen of hele euro’s via fiscale parameter. Belastingteruggave op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: premiegrondslag, jaarruimte, aftrekbareStorting, belastingteruggave, nietAftrekbaarDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie inkomen, franchise, factor A, percentage en aftrektarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen ontbreekt of < 0 ongeldig. Factor A < 0 ongeldig. Ontbrekende jaarruimteparameters onvoldoende. Storting < 0 ongeldig.
2. Domeinbeperkingen
    INVUL: inkomen >= 0; factorA >= 0; storting >= 0; jaartabel beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Vul een geldige factor A in.” / “Voor dit jaar ontbreken jaarruimteparameters.” / “De storting mag niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Inkomen € 60.000, franchise € 15.000, percentage 30%, factor A € 5.000. Verwacht jaarruimte € 8.500.
2. Edge-case
    INVUL: Inkomen lager dan franchise. Verwacht jaarruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaarruimte € 10.000, storting € 8.000, aftrektarief 40%. Verwacht teruggave € 3.200.

Jaarruimte + reserveringsruimte

Bron-URL: https://www.externe-bron.nl/pensioen/pensioen-aanvullen-jaarruimte-en-reserveringsruimte.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel lijfrentestorting aftrekbaar is uit huidige jaarruimte plus niet-benutte jaarruimte uit eerdere jaren.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken huidige jaarruimte zoals jaarruimteformule. Bereken per voorgaand jaar ongebruikteJaarruimteJaar = max(0, jaarruimteJaar - gebruikteStortingJaar). Pas wettelijke maximumgrenzen/vervaltermijn uit jaartabel toe: reserveringsruimte = min(Σ toegestaneOngebruikteRuimte, maximumReserveringsruimte). totaleAftrekruimte = jaarruimte + reserveringsruimte. aftrekbareStorting = min(storting, totaleAftrekruimte).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens/factor A’s per jaar. Vervaltermijn in jaren. Tarieven en maxima via jaartabel.
4. Afrondingsregels
    INVUL: Ruimte en stortingen op 2 decimalen of hele euro’s via fiscale parameter. Totalen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: jaarruimte, reserveringsruimte, totaleAftrekruimte, aftrekbareStorting, nietAftrekbaarDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaaroverzicht van ongebruikte jaarruimte, gebruikte ruimte, vervallen ruimte en toegepaste maxima.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaren chronologisch; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende gegevens voor huidige jaarruimte is onvoldoende. Negatieve factor A/stortingen ongeldig. Geen historische jaren ingevuld betekent reserveringsruimte 0.
2. Domeinbeperkingen
    INVUL: Inkomens >= 0; factor A >= 0; gebruikte stortingen >= 0; jaartabellen beschikbaar voor alle jaren.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul de gegevens voor de huidige jaarruimte in.” / “Vul geldige historische jaarruimtes in.” / “Voor één of meer jaren ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Jaarruimte huidig € 5.000, reserveringsruimte € 10.000, storting € 12.000. Verwacht aftrekbaar € 12.000, resterend € 3.000.
2. Edge-case
    INVUL: Geen historische ruimte. Verwacht reserveringsruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Huidig € 2.000, historisch ongebruikt € 3.000, maximum € 4.000. Verwacht totale ruimte € 5.000.

Levensverwachting bij geboorte

Bron-URL: https://www.externe-bron.nl/pensioen/levensverwachting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen van de levensverwachting bij geboorte op basis van geboortejaar en geslacht volgens een levensverwachtingstabel.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek in levensverwachtingTabel op geboortejaar en geslacht. verwachteLeeftijdBijOverlijden = levensverwachtingJaren. verwachteOverlijdensjaar = geboortejaar + floor(levensverwachtingJaren), eventueel met maandfractie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Decimalen in levensverwachting omrekenen naar maanden: maanden = decimalen * 12. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Levensverwachting op 1 decimaal jaar. Maanden naar dichtstbijzijnde hele maand.

Output-contract

1. Primaire outputs
    INVUL: levensverwachtingJaren, verwachteLeeftijd, verwachtOverlijdensjaar, geslacht, geboortejaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel vergelijking man/vrouw en trendgrafiek per geboortejaar.
3. Formatregels voor UI
    INVUL: Leeftijd als x,x jaar; jaar als jjjj; bron-/tabeljaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geboortejaar ontbreekt, buiten tabelbereik of geslacht ontbreekt is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: Geboortejaar binnen tabelbereik; geslacht moet in tabel voorkomen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig geboortejaar in.” / “Kies een geslacht.” / “Voor dit jaar is geen levensverwachting beschikbaar.”

Testset

1. Basiscase
    INVUL: Tabelwaarde geboortejaar 2000, man = 75,0. Verwacht levensverwachting 75,0 jaar.
2. Edge-case
    INVUL: Geboortejaar buiten tabel. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Geboortejaar 1980, tabelwaarde 80,5. Verwacht 80 jaar en 6 maanden.

Netto AOW-, pensioen- of lijfrente-uitkering

Bron-URL: https://www.externe-bron.nl/pensioen/netto-aow-pensioen-lijfrente-uitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto uitkering uit één of meerdere AOW-, pensioen- of lijfrentebronnen.
2. Exacte formules/stappenvolgorde
    INVUL: brutoJaar = Σ brutoUitkeringenPerJaar. Bepaal fiscale status: vóór of na AOW-leeftijd. Bereken belasting via box 1-jaartabel. Bereken heffingskortingen/ouderenkorting via jaartabel. nettoJaar = brutoJaar - max(0, belastingVoorKortingen - kortingen) - eventueleZvwInhouding. nettoMaand = nettoJaar / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maanduitkering naar jaar via *12; kwartaal via *4; jaar naar maand via /12.
4. Afrondingsregels
    INVUL: Uitkeringen en netto bedragen op 2 decimalen. Belastingcomponenten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoUitkeringPerJaar, nettoUitkeringPerJaar, nettoUitkeringPerMaand, belastingEnPremies, heffingskortingen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per uitkeringsbron en belastingcomponent.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; bronlabels AOW/pensioen/lijfrente; jaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen uitkering ingevuld is onvoldoende. Negatieve bedragen ongeldig. Ontbrekende fiscale status of jaartabel onvoldoende.
2. Domeinbeperkingen
    INVUL: Uitkeringen >= 0; fiscale parameters beschikbaar; leeftijd/AOW-status bekend.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één bruto uitkering in.” / “Vul geldige bruto bedragen in.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Bruto € 24.000, belasting 25%, geen kortingen. Verwacht netto € 18.000.
2. Edge-case
    INVUL: Bruto € 0. Verwacht netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto maand € 1.000, tarief 20%. Verwacht netto maand € 800.

Netto nabestaandenpensioen of Anw-uitkering

Bron-URL: https://www.externe-bron.nl/pensioen/netto-nabestaandenpensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van netto nabestaandenpensioen en/of Anw-uitkering na belasting en eventuele inkomensafhankelijke korting.
2. Exacte formules/stappenvolgorde
    INVUL: brutoNabestaandenPensioenJaar = maandbedrag * 12. Anw: bepaal bruto Anw uit jaartabel en pas inkomenstoets toe indien actief: kortingAnw = max(0, relevantInkomen - vrijlating) * kortingspercentage. brutoAnwNaKorting = max(0, brutoAnw - kortingAnw). totaalBruto = brutoNabestaandenPensioen + brutoAnwNaKorting + overigInkomen. Bereken belasting/kortingen via jaartabel. netto = totaalBruto - belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maand naar jaar via *12; jaar naar maand via /12. Tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Kortingen en netto bedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoNabestaandenpensioen, brutoAnwNaKorting, nettoTotaalPerJaar, nettoTotaalPerMaand, belastingEnPremies.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Anw-inkomenstoets, vrijlating, korting, belastingberekening.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; uitkeringssoort duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkeringsbedragen < 0 ongeldig. Anw-regels ontbreken indien Anw wordt berekend is onvoldoende. Geen uitkering ingevuld is onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; korting mag bruto Anw niet onder 0 brengen; jaartabel beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige uitkering in.” / “Voor dit jaar ontbreken Anw- of belastingparameters.” / “Vul geldige overige inkomsten in.”

Testset

1. Basiscase
    INVUL: Nabestaandenpensioen € 12.000, belasting 20%. Verwacht netto € 9.600.
2. Edge-case
    INVUL: Anw volledig gekort. Verwacht Anw na korting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto Anw € 15.000, korting € 3.000, belasting 25%. Verwacht netto € 9.000.

Netto pensioen na pensioenkorting

Bron-URL: https://www.externe-bron.nl/pensioen/pensioenkorting-netto-pensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat een bruto pensioenkorting betekent voor netto pensioeninkomen.
2. Exacte formules/stappenvolgorde
    INVUL: nieuwBrutoPensioen = oudBrutoPensioen * (1 - kortingPercentage/100) of oudBrutoPensioen - kortingBedrag. Bereken netto vóór korting en netto na korting via bruto-netto pensioenmodule. nettoVerschil = nettoNa - nettoVoor. nettoEffectPercentage = nettoVerschil / nettoVoor * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandpensioen naar jaar via *12. Kortingpercentage delen door 100. Jaar naar maand via /12.
4. Afrondingsregels
    INVUL: Bruto/netto bedragen op 2 decimalen. Kortingpercentage met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudBrutoPensioen, nieuwBrutoPensioen, oudNettoPensioen, nieuwNettoPensioen, nettoVerschil.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Bruto en netto vergelijking vóór/na korting; belastingeffect.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; verschil negatief als daling; percentage met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oud pensioen < 0 ongeldig. Korting < 0 of korting > 100% ongeldig. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: oudBrutoPensioen >= 0; 0 <= kortingPercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig pensioenbedrag in.” / “Korting moet tussen 0% en 100% liggen.” / “Voor dit jaar ontbreken belastingparameters.”

Testset

1. Basiscase
    INVUL: Bruto pensioen € 20.000, korting 10%, geen belasting. Verwacht nieuw bruto/netto € 18.000.
2. Edge-case
    INVUL: Korting 0%. Verwacht geen verschil.
3. Regresstest tegen bekende uitkomst
    INVUL: Oud bruto € 12.000, korting 25%, belasting 20%. Verwacht netto voor € 9.600, na € 7.200, verschil -€ 2.400.

Ouderenkorting

Bron-URL: https://www.externe-bron.nl/pensioen/ouderenkorting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de ouderenkorting op basis van inkomen, leeftijd/AOW-status en belastingjaar.
2. Exacte formules/stappenvolgorde
    INVUL: Controleer of gebruiker recht heeft op ouderenkorting volgens jaartabel. Zoek maximum ouderenkorting, inkomensgrens en afbouwpercentage. ouderenkorting = max(0, maximumKorting - max(0, verzamelinkomen - afbouwgrens) * afbouwpercentage/100). Pas eventueel aparte alleenstaande ouderenkorting toe via parameter.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per jaar. Maandinkomen naar jaar via *12. Percentages via jaartabel.
4. Afrondingsregels
    INVUL: Korting op 2 decimalen of hele euro’s via fiscale parameter. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: ouderenkorting, maximaleOuderenkorting, afbouwBedrag, alleenstaandeOuderenkorting indien van toepassing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie inkomen, afbouwgrens en afbouwpercentage.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaar tonen; recht/niet-recht melding.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen < 0 ongeldig. AOW-status ontbreekt onvoldoende. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: inkomen >= 0; AOW-gerechtigd of volgens tabel recht; korting niet lager dan 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Vul de AOW-status of geboortedatum in.” / “Voor dit jaar ontbreken ouderenkortingparameters.”

Testset

1. Basiscase
    INVUL: Maximum € 2.000, inkomen onder grens. Verwacht korting € 2.000.
2. Edge-case
    INVUL: Inkomen hoog genoeg voor volledige afbouw. Verwacht korting € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maximum € 2.000, afbouwgrens € 40.000, inkomen € 45.000, afbouw 15%. Verwacht korting € 1.250.

Overbruggingsuitkering AOW

Bron-URL: https://www.externe-bron.nl/pensioen/overbruggingsuitkering-aow.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van een tijdelijke overbruggingsuitkering tot AOW-datum en het benodigde kapitaal daarvoor.
2. Exacte formules/stappenvolgorde
    INVUL: maandTekort = gewensteNettoInkomenPerMaand - beschikbareNettoInkomstenPerMaand. Begrens op minimaal 0. n = aantalMaandenTotAow. Benodigde pot bij maandrendement r: benodigdePot = maandTekort * (1 - (1+r)^(-n)) / r; bij r = 0: benodigdePot = maandTekort * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarbedragen naar maand via /12. Jaarlijks rendement naar maandrendement via effectieve formule. Periode tot AOW in maanden.
4. Afrondingsregels
    INVUL: Maandtekort en benodigde pot op 2 decimalen. Aantal maanden als geheel getal, naar boven afgerond bij gedeeltelijke maand.

Output-contract

1. Primaire outputs
    INVUL: maandTekort, aantalMaandenTotAow, benodigdOverbruggingsKapitaal, totaalUitkeringen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maandelijks onttrekkingsschema tot AOW-datum.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; periode als maanden en jaren/maanden; AOW-datum tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: AOW-datum vóór of gelijk aan startdatum maakt overbrugging niet relevant. Gewenst inkomen < 0 of inkomsten < 0 ongeldig. Rendement <= -100% per periode ongeldig.
2. Domeinbeperkingen
    INVUL: aantalMaandenTotAow > 0; bedragen >= 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “De AOW-datum moet na de startdatum liggen.” / “Vul geldige inkomensbedragen in.” / “Er is geen tekort om te overbruggen.”

Testset

1. Basiscase
    INVUL: Tekort € 1.000/mnd, 24 maanden, rendement 0%. Verwacht kapitaal € 24.000.
2. Edge-case
    INVUL: Tekort € 0. Verwacht kapitaal € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Tekort € 500/mnd, 10 maanden, rendement 0%. Verwacht € 5.000.

Pensioensparen buiten box3

Bron-URL: https://www.externe-bron.nl/pensioen/pensioensparen-vs-box3-sparen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van fiscaal pensioensparen buiten box 3 met sparen/beleggen in box 3.
2. Exacte formules/stappenvolgorde
    INVUL: Pensioenvariant: nettoInlegKosten = brutoStorting - belastingteruggave; opbouw: pensioenKapitaal = brutoStorting * groeifactor; uitkering belast in box 1: nettoPensioenKapitaal = pensioenKapitaal * (1 - uitkeringsBelastingTarief/100). Box3-variant: nettoStart = brutoStorting - eventueleDirecteBelasting; jaarlijks rendement na box3-heffing: vermogen = vermogen*(1+rendement) - box3Heffing. Vergelijk eindwaarden netto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Looptijd in jaren. Rendement per jaar. Tarieven uit jaartabel. Maandelijkse inleg naar jaar via *12 of periodiek modelleren.
4. Afrondingsregels
    INVUL: Kapitaal en belasting op 2 decimalen. Rendement/percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindwaardePensioensparenNetto, eindwaardeBox3Netto, verschil, voordeligsteVariant, belastingteruggaveNu.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks opbouwschema pensioen en box 3; belastingeffecten nu en later.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; “indicatief” tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inleg < 0, looptijd < 0, rendement <= -100%, ontbrekende belastingtarieven is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: inleg >= 0; looptijd >= 0; rendement per jaar > -100%; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige inleg in.” / “Vul een geldige looptijd in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Bruto storting € 10.000, teruggave 40%, rendement 0%, uitkeringsbelasting 20%, box3 geen heffing. Verwacht pensioen netto eind € 8.000, netto kosten nu € 6.000.
2. Edge-case
    INVUL: Inleg € 0. Verwacht beide eindwaarden € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Box3 start € 10.000, rendement 5%, 1 jaar, geen belasting. Verwacht € 10.500.

Pensioenstorting

Bron-URL: https://www.externe-bron.nl/pensioen/pensioenstorting-belastingaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van een pensioen-/lijfrentestorting aftrekbaar is en hoeveel belastingteruggave dat oplevert.
2. Exacte formules/stappenvolgorde
    INVUL: aftrekbareStorting = min(storting, beschikbareJaarruimte + beschikbareReserveringsruimte). nietAftrekbaar = max(0, storting - aftrekbareStorting). belastingteruggave = aftrekbareStorting * marginaalAftrekTarief / 100. nettoKostenStorting = storting - belastingteruggave.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Storting per belastingjaar. Aftrektarief als percentage. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aftrektarief met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: storting, aftrekbareStorting, belastingteruggave, nettoKostenStorting, nietAftrekbaarDeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie jaarruimte/reserveringsruimte en resterende aftrekruimte.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Storting < 0 ongeldig. Aftrekruimte ontbreekt onvoldoende. Aftrektarief buiten 0..100 ongeldig.
2. Domeinbeperkingen
    INVUL: storting >= 0; aftrekruimte >= 0; 0 <= aftrekTarief <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige storting in.” / “Vul beschikbare jaarruimte of reserveringsruimte in.” / “Vul een geldig aftrektarief in.”

Testset

1. Basiscase
    INVUL: Storting € 5.000, aftrekruimte € 10.000, tarief 40%. Verwacht teruggave € 2.000.
2. Edge-case
    INVUL: Storting hoger dan ruimte: storting € 10.000, ruimte € 4.000, tarief 50%. Verwacht aftrekbaar € 4.000, niet-aftrekbaar € 6.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Storting € 1.000, tarief 37%. Verwacht teruggave € 370.

Pensioenuitkering

Bron-URL: https://www.externe-bron.nl/pensioen/pensioenuitkering-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke periodieke pensioenuitkering hoort bij een beschikbaar pensioenkapitaal, uitkeringsduur en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: P = pensioenKapitaal, r = periodiekRendement, n = aantalUitkeringsPerioden. Uitkering einde periode: uitkering = P * r / (1 - (1+r)^(-n)). Bij r = 0: uitkering = P / n. Per periode: rente = restKapitaal * r; onttrekkingKapitaal = uitkering - rente; restKapitaal -= onttrekkingKapitaal.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement via effectieve formule. Uitkeringsduur jaren naar maanden via *12. Jaaruitkering = maanduitkering * 12.
4. Afrondingsregels
    INVUL: Uitkering op 2 decimalen. Laatste uitkering corrigeren zodat eindkapitaal 0 wordt. Schema op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: uitkeringPerMaand, uitkeringPerJaar, aantalUitkeringen, totaalUitgekeerd, totaalRendement.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitkeringsschema met beginwaarde, rendement, uitkering en eindwaarde per periode.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Pensioenkapitaal <= 0, uitkeringsduur <= 0, rendement <= -100% per periode is ongeldig.
2. Domeinbeperkingen
    INVUL: pensioenKapitaal > 0; n > 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief pensioenkapitaal in.” / “Vul een positieve uitkeringsduur in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Kapitaal € 120.000, rendement 0%, duur 10 jaar. Verwacht € 1.000/mnd.
2. Edge-case
    INVUL: Duur 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Kapitaal € 100.000, jaaruitkering over 20 jaar, rendement 0%. Verwacht € 5.000/jaar.

Pensioenwaarde berekenen

Bron-URL: https://www.externe-bron.nl/pensioen/pensioenwaarde-berekenen-uit-pensioenuitkering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke contante waarde hoort bij een periodieke pensioenuitkering.
2. Exacte formules/stappenvolgorde
    INVUL: A = periodiekeUitkering, r = periodiekRekenrendement, n = aantalPerioden. Contante waarde einde periode: PV = A * (1 - (1+r)^(-n)) / r. Bij r = 0: PV = A * n. Bij uitkering begin periode: PV_begin = PV * (1+r).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaaruitkering naar maanduitkering via /12 als maandperioden. Jaarlijk rekenrendement naar periodiek rendement via effectieve formule.
4. Afrondingsregels
    INVUL: Contante waarde op 2 decimalen. Rendement met 2 decimalen. Looptijd in hele perioden.

Output-contract

1. Primaire outputs
    INVUL: pensioenwaarde, periodiekeUitkering, aantalPerioden, rekenrendement, totaalNominaalUitgekeerd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Contantewaardeschema per jaar/periode.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement als percentage; uitkering per maand/jaar labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering <= 0, looptijd <= 0 of rendement <= -100% per periode is ongeldig.
2. Domeinbeperkingen
    INVUL: uitkering > 0; n > 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve pensioenuitkering in.” / “Vul een positieve looptijd in.” / “Vul een geldig rekenrendement in.”

Testset

1. Basiscase
    INVUL: Uitkering € 10.000/jaar, 20 jaar, rendement 0%. Verwacht waarde € 200.000.
2. Edge-case
    INVUL: Looptijd 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Uitkering € 1.000, 10 perioden, rendement 0%. Verwacht € 10.000.

Reserveringsruimte

Bron-URL: https://www.externe-bron.nl/pensioen/pensioengat-reserveringsruimte.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van niet-benutte jaarruimte uit eerdere jaren die nog als reserveringsruimte kan worden gebruikt.
2. Exacte formules/stappenvolgorde
    INVUL: Per historisch jaar: ongebruikteJaarruimte = max(0, jaarruimteJaar - gebruiktePremieJaar). Alleen jaren binnen wettelijke terugkijktermijn tellen mee. brutoReserveringsruimte = Σ ongebruikteJaarruimte. Pas maximum toe uit jaartabel: reserveringsruimte = min(brutoReserveringsruimte, maximumReserveringsruimte).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alles per belastingjaar. Geen maandconversie. Maxima en termijnen via jaartabel.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen of hele euro’s via fiscale parameter.

Output-contract

1. Primaire outputs
    INVUL: brutoReserveringsruimte, maximaleReserveringsruimte, beschikbareReserveringsruimte, vervallenRuimte.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaaroverzicht met jaarruimte, gebruikte premie, ongebruikte ruimte, wel/niet meegenomen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; jaren chronologisch; belastingjaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen historische jaren ingevuld geeft 0. Negatieve jaarruimte of gebruikte premie ongeldig. Ontbrekende maxima onvoldoende.
2. Domeinbeperkingen
    INVUL: jaarruimteJaar >= 0; gebruiktePremie >= 0; alleen jaren binnen terugkijktermijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige historische jaarruimtes in.” / “Gebruikte premie mag niet negatief zijn.” / “Voor dit jaar ontbreken reserveringsruimteparameters.”

Testset

1. Basiscase
    INVUL: Ongebruikte jaarruimtes € 1.000, € 2.000, € 3.000, maximum € 10.000. Verwacht € 6.000.
2. Edge-case
    INVUL: Geen ongebruikte jaarruimte. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto reserveringsruimte € 20.000, maximum € 15.000. Verwacht € 15.000.

Resterende levensverwachting

Bron-URL: https://www.externe-bron.nl/pensioen/resterende-levensverwachting.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen van resterende levensverwachting op een huidige leeftijd, op basis van leeftijd, geslacht en levensverwachtingstabel.
2. Exacte formules/stappenvolgorde
    INVUL: Zoek in resterendeLevensverwachtingTabel op huidigeLeeftijd, geslacht en eventueel peiljaar. verwachteResterendeJaren = tabelwaarde. verwachteLeeftijdBijOverlijden = huidigeLeeftijd + verwachteResterendeJaren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Decimalen in jaren omrekenen naar maanden via decimalen * 12. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Resterende jaren op 1 decimaal. Maanden afgerond op hele maanden.

Output-contract

1. Primaire outputs
    INVUL: resterendeLevensverwachtingJaren, verwachteLeeftijdBijOverlijden, geslacht, huidigeLeeftijd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel overlevingskans per leeftijd indien tabel beschikbaar.
3. Formatregels voor UI
    INVUL: Leeftijd als x,x jaar; tabeljaar/peiljaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leeftijd ontbreekt, < 0 of buiten tabelbereik is ongeldig/onvoldoende. Geslacht ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd binnen tabelbereik; geslacht moet in tabel voorkomen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige leeftijd in.” / “Kies een geslacht.” / “Voor deze leeftijd is geen levensverwachting beschikbaar.”

Testset

1. Basiscase
    INVUL: Leeftijd 65, tabelwaarde resterend 20,0. Verwacht overlijdensleeftijd 85,0.
2. Edge-case
    INVUL: Leeftijd buiten tabel. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Leeftijd 70, resterend 15,5. Verwacht 85 jaar en 6 maanden.

RVU-regeling - inkomensdaling

Bron-URL: https://www.externe-bron.nl/pensioen/rvu-regeling-netto-inkomensdaling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel netto inkomen daalt of stijgt bij gebruik van een RVU-regeling tot pensioen/AOW.
2. Exacte formules/stappenvolgorde
    INVUL: Situatie vóór RVU: brutoWerkinkomen. Situatie met RVU: brutoRvu + vroegpensioen + overigeInkomsten. Bereken netto vóór en netto na via box 1-belastingtabellen vóór AOW-leeftijd. nettoDalingPerMaand = nettoVoorPerMaand - nettoNaPerMaand. nettoDalingPercentage = nettoDaling / nettoVoor * 100. Optioneel RVU-heffing werkgever apart: werkgeversheffing = max(0, rvuBovenDrempel) * heffingspercentage.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandbedragen naar jaar via *12. Jaar naar maand via /12. Tarieven via jaartabel.
4. Afrondingsregels
    INVUL: Netto bedragen op 2 decimalen. Percentage daling met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoVoorRvu, nettoMetRvu, nettoDalingPerMaand, nettoDalingPerJaar, nettoDalingPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Bruto-netto vergelijking vóór/na; optioneel werkgevers-RVU-heffing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; daling positief tonen als inkomensverlies; percentage met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Werkinkomen/RVU-bedrag < 0 ongeldig. RVU-periode na AOW kan niet relevant zijn. Jaartabel ontbreekt onvoldoende.
2. Domeinbeperkingen
    INVUL: Bedragen >= 0; periode vóór AOW; fiscale parameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige inkomensbedragen in.” / “Deze berekening is bedoeld voor de periode vóór AOW.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Netto voor € 3.000/mnd, netto met RVU € 2.000/mnd. Verwacht daling € 1.000, 33,33%.
2. Edge-case
    INVUL: Netto voor = netto na. Verwacht daling € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto RVU € 24.000, belasting 30%. Verwacht netto RVU € 16.800.

Sparen aanvullend pensioen

Bron-URL: https://www.externe-bron.nl/pensioen/sparen-aanvullend-pensioen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel periodiek gespaard moet worden om aanvullend pensioenkapitaal op te bouwen.
2. Exacte formules/stappenvolgorde
    INVUL: doelKapitaal, startKapitaal, r = periodiekRendement, n = aantalPerioden. FV_start = startKapitaal*(1+r)^n. Inleg einde periode: inleg = (doelKapitaal - FV_start) * r / ((1+r)^n - 1). Bij r = 0: inleg = (doelKapitaal - startKapitaal)/n. Begrens benodigde inleg op minimaal 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijks rendement naar maandrendement via effectieve formule. Looptijd jaren naar maanden. Jaarinleg = maandinleg * 12.
4. Afrondingsregels
    INVUL: Inleg en kapitaal op 2 decimalen. Looptijd in hele maanden.

Output-contract

1. Primaire outputs
    INVUL: benodigdeInlegPerMaand, benodigdeInlegPerJaar, doelKapitaal, verwachtEindKapitaal, totaalIngelegd.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Opbouwschema per jaar; grafiek kapitaalontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rendement met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Doelkapitaal < 0, startkapitaal < 0, looptijd <= 0, rendement <= -100% per periode is ongeldig. Als startkapitaal al voldoende is, benodigde inleg € 0.
2. Domeinbeperkingen
    INVUL: doelKapitaal >= 0; startKapitaal >= 0; n > 0; r > -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig doelkapitaal in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Doel € 12.000, start € 0, rendement 0%, 10 jaar. Verwacht € 100/mnd.
2. Edge-case
    INVUL: Start € 20.000, doel € 10.000. Verwacht benodigde inleg € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Doel € 10.000, start € 0, rendement 0%, 100 maanden. Verwacht € 100/mnd.

Uitkeringen uit een bancaire lijfrente

Bron-URL: https://www.externe-bron.nl/pensioen/uitkeringen-bancaire-lijfrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van periodieke uitkeringen uit een bancaire lijfrente op basis van kapitaal, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: P = lijfrenteKapitaal, r = periodiekeRente, n = aantalUitkeringen. Uitkering einde periode: A = P * r / (1 - (1+r)^(-n)). Bij r = 0: A = P / n. Per periode: rente = restKapitaal * r; kapitaalOnttrekking = A - rente; restKapitaal = restKapitaal + rente - A.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente via effectieve formule of nominale variant via parameter. Looptijd jaren naar maanden. Kapitaal in euro.
4. Afrondingsregels
    INVUL: Uitkering op 2 decimalen. Laatste uitkering corrigeren zodat restkapitaal 0 wordt. Rentecomponent op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: uitkeringPerMaand, uitkeringPerJaar, aantalUitkeringen, totaalUitgekeerd, totaalRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Uitkeringsschema met beginwaarde, rente, uitkering, eindwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd als jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Kapitaal <= 0, looptijd <= 0, rente <= -100% per periode is ongeldig. Wettelijke minimale looptijd kan als parameter worden gevalideerd.
2. Domeinbeperkingen
    INVUL: kapitaal > 0; n > 0; r > -100%; looptijd voldoet aan gekozen lijfrentetype.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief lijfrentekapitaal in.” / “Vul een geldige uitkeringsduur in.” / “Vul een geldige rente in.” / “De looptijd voldoet niet aan de fiscale voorwaarden.”

Testset

1. Basiscase
    INVUL: Kapitaal € 120.000, rente 0%, 10 jaar maanduitkering. Verwacht € 1.000/mnd.
2. Edge-case
    INVUL: Kapitaal € 0. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Kapitaal € 100.000, rente 0%, 20 jaar jaaruitkering. Verwacht € 5.000/jaar.

Uitkeringen uit een lijfrenteverzekering

Bron-URL: https://www.externe-bron.nl/pensioen/uitkeringen-lijfrenteverzekering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen van uitkeringen uit een lijfrenteverzekering op basis van kapitaal, rekenrente, uitkeringsduur en eventuele kosten/sterftekansfactor.
2. Exacte formules/stappenvolgorde
    INVUL: Vereenvoudigde vaste-termijnvariant: nettoBeschikbaarKapitaal = kapitaal - aankoopkosten. A = nettoBeschikbaarKapitaal * r / (1 - (1+r)^(-n)); bij r=0: A = nettoBeschikbaarKapitaal/n. Levenslange variant: A = nettoBeschikbaarKapitaal / actuariëleFactor, waarbij actuariëleFactor uit sterftetabel/rentetabel komt. Netto-uitkering via bruto-netto module.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rekenrente naar perioderente. Uitkeringsduur in jaren naar perioden. Kosten in euro of percentage van kapitaal.
4. Afrondingsregels
    INVUL: Uitkering op 2 decimalen. Kosten op 2 decimalen. Actuariële factor met 4 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoUitkeringPerMaand, brutoUitkeringPerJaar, nettoBeschikbaarKapitaal, totaalUitgekeerd, gebruikteActuarieleFactor.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie kosten, rekenrente, looptijd/levenslange variant, uitkeringsschema indien vaste termijn.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; indicatief label omdat verzekeraars eigen tarieven/kosten hanteren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Kapitaal <= 0, kosten groter dan kapitaal, looptijd <= 0 bij vaste looptijd, ontbrekende actuariële factor bij levenslange variant is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: kapitaal > 0; 0 <= kosten <= kapitaal; n > 0; actuariëleFactor > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief lijfrentekapitaal in.” / “Kosten mogen niet hoger zijn dan het kapitaal.” / “Vul een geldige uitkeringsduur in.” / “Voor levenslange uitkering ontbreekt een actuariële factor.”

Testset

1. Basiscase
    INVUL: Kapitaal € 120.000, kosten € 0, rente 0%, 10 jaar maanduitkering. Verwacht € 1.000/mnd.
2. Edge-case
    INVUL: Kosten gelijk aan kapitaal. Verwacht beschikbaar kapitaal € 0, uitkering € 0 of foutmelding afhankelijk UI-keuze.
3. Regresstest tegen bekende uitkomst
    INVUL: Kapitaal € 100.000, actuariële factor 20. Verwacht jaaruitkering € 5.000.