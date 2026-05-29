# Maximale erfpacht hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-erfpacht-hypotheek.html

## Uit invulblad

Maximale erfpacht hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-erfpacht-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel hypotheek mogelijk is wanneer naast hypotheeklasten ook erfpachtcanon moet worden betaald.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toegestane bruto maandlast uit inkomen of directe invoer. Stap 2: bereken maandelijkse canon: canonPerMaand = canonPerJaar / 12. Stap 3: beschikbareHypotheekMaandlast = toegestaneMaandlast - canonPerMaand. Stap 4: bereken maximale hypotheek uit maandlast: P = A * (1-(1+r)^(-n))/r; bij r=0: P=A*n. Stap 5: indien canon fiscaal aftrekbaar is, pas netto-toetsvariant via parameter toe.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Canon per jaar naar maand via /12. Rente per jaar naar maand. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden afronden op hele euro’s. Maandlast en canon op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheekMetErfpacht, canonPerMaand, beschikbareHypotheekMaandlast, verlagingDoorErfpacht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking maximale hypotheek zonder en met erfpacht.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s voor hypotheek; rente met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Canon < 0, toegestane maandlast <= 0, rente ontbreekt of looptijd <= 0 is ongeldig. Als canon hoger is dan toegestane maandlast, maximale hypotheek 0.
2. Domeinbeperkingen
    INVUL: canonPerJaar >= 0; toegestaneMaandlast > 0; beschikbareHypotheekMaandlast >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige erfpachtcanon in.” / “De erfpachtcanon is hoger dan de beschikbare maandlast.” / “Vul een geldige rente en looptijd in.”

Testset

1. Basiscase
    INVUL: Toegestane maandlast € 1.500, canon € 3.600/jaar, rente 4%, looptijd 30 jaar. Verwacht beschikbare hypotheeklast € 1.200.
2. Edge-case
    INVUL: Canon € 0. Verwacht maximale hypotheek gelijk aan zonder erfpacht.
3. Regresstest tegen bekende uitkomst
    INVUL: Beschikbare maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht maximale hypotheek € 360.000.
