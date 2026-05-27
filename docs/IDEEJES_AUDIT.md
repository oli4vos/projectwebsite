# Ideetjes Audit (2026-05-27)

Dit document koppelt `ideetjes.txt` aan de huidige implementatie.

## Verwerkt (geheel of functioneel gelijkwaardig)

- Aannames inzichtelijk en light-first via verdiepingsblokken (`ToolDisclosure`, `DisclosureSection`) en `/variabelen`.
- Algemene gegevens hergebruiken in tools via profielmapping/prefill.
- Centrale belastinglaag (box 1, box 3, hypotheekrenteaftrek) aanwezig en hergebruikt.
- Werkvorm/AOV/pensioenvelden in profiel aanwezig.
- DUO-wettelijk bedrag en extra-aflossen-vs-beleggen logica meegenomen in DUO-gerelateerde tools.
- Responsive en mobiele field-flow verbeterd (shell + mobile flow controls).
- Chart-standaardisatie: jaar-as, euro-as, tooltips, centrale chart helpers.
- Tool-gelaagdheid: invullen -> samenvatting -> verdieping.
- Box 3 tools aanwezig (`box-3-impact`, `box3-indicatie`) en centrale box3-logica gebruikt.
- Vermogensplanning export (CSV/PDF) aanwezig in `jaarruimte-vs-vrij-beleggen`.
- Jaarruimte-help link naar Belastingdienst staat in UI.
- `volgende-euro` submit-driven gemaakt met relevantie op ingevulde velden.

## Deels verwerkt / aandachtspunt

- “Snel overzicht per doelgroep”: homepage is categorie-first, maar doelgroepingangen zijn nog niet expliciet als aparte doelgroepnavigatie uitgewerkt.
- “Hypotheek op basis van inkomen”: gebeurt deels via hypotheektools/profielcontext, maar geen losse dedicated intakeflow op homepage.
- “Menu op scroll minimaliseren”: niet als vaste, centrale behavior op alle schermen geborgd.

## Open punten (nog niet gebouwd)

- DUO met meerdere schuld-delen als herhaalbare invoercomponent.
- Impact private lease op hypotheek (bewust buiten doelgroep genoteerd).
- Volledig uitgewerkte doelgroep-landingsstructuur (oud-student, zzp, richting pensioen).

## Nieuwe verbetering in deze ronde

- `jaarruimte-vs-vrij-beleggen` vergelijkt nu met **gelijke netto inleg**:
  - vrij beleggen gebruikt hetzelfde netto budget als de pensioeninleg (`netCostNow`);
  - voorkomt scheve bruto-vs-netto vergelijking;
  - extra toelichting toegevoegd in de tool.

## Aanbevolen vervolgbatch

1. DUO multi-schuld-delen (herhaalbare debt blocks + aggregatie).
2. Doelgroepingangen op homepage als optionele snelle filters.
3. Dedicated private-lease impact tool (hidden/draft eerst).
