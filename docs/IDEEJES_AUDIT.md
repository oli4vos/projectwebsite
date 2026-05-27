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
- DUO met meerdere schuld-delen is verwerkt in `studieschuld-vs-beleggen`.
- Impact private lease op hypotheek staat als hidden/draft tool klaar.
- Doelgroepingangen op homepage zijn uitgewerkt als centrale geldroutes met filters, scrollankers en aanbevolen starttools.
- Algemene financiële begrippen worden via centrale glossary klikbaar gemaakt op plekken waar `GlossaryText` wordt gebruikt.
- Koop-vs-huur, schulden-volgorde en kind-wordt-18 staan als hidden/draft tools klaar met centrale planninghelpers.
- Scenario’s vergelijken is als feature-flagged MVP toegevoegd op basis van de twee meest recente lokale scenario’s.

## Deels verwerkt / aandachtspunt

- “Hypotheek op basis van inkomen”: gebeurt deels via hypotheektools/profielcontext, maar geen losse dedicated intakeflow op homepage.
- “Menu op scroll minimaliseren”: niet als vaste, centrale behavior op alle schermen geborgd.
- Begrippen-uitleg is nog niet automatisch over elke losse tekstnode in alle bestaande tools uitgerold; nieuwe copy kan `GlossaryText` gebruiken.

## Open punten (nog niet gebouwd)

- Koop-vs-huur, schulden-volgorde en kind-wordt-18 moeten nog inhoudelijk worden getest met echte gebruikers voordat ze publiek worden gezet.
- Scenario’s openen/herladen in de oorspronkelijke tool is nog niet gebouwd.

## Nieuwe verbetering in deze ronde

- `jaarruimte-vs-vrij-beleggen` vergelijkt nu met **gelijke netto inleg**:
  - vrij beleggen gebruikt hetzelfde netto budget als de pensioeninleg (`netCostNow`);
  - voorkomt scheve bruto-vs-netto vergelijking;
  - extra toelichting toegevoegd in de tool.

## Aanbevolen vervolgbatch

1. UX-review van de drie hidden/draft tools voordat ze naar `visibility: "public"` gaan.
2. Begrippen-uitleg verder toepassen in bestaande calculators.
3. Scenario’s openen/herladen in de oorspronkelijke tool.
