# Procesdocumentatie publieke rekentools

Deze index beschrijft de actuele gebruikers-, beslis-, reken- en gegevensprocessen van alle publieke rekentools. De inhoud wordt tegen functionele bronbestanden gecontroleerd met een bronvingerafdruk; de tabel hieronder wordt gegenereerd uit dezelfde appmanifests die de publieke registry voeden.

## Definitie actief en publiek

Een tool valt in deze index wanneer het manifest onder `apps/<slug>/app.json` zowel `enabled: true` als `visibility: "public"` bevat. De registrygenerator gebruikt dezelfde selectie voor registry, lazy component-map en statische routes. Productstatus `active` of `beta` verandert deze technische publicatieregel niet.

## Actuele inventaris

| Tool | Publieke route | Procesdocument | Laatst gecontroleerd | Procesplaten |
| --- | --- | --- | --- | --- |
| Maximale hypotheek | `/apps/artifact-hypotheek-wonen-maximale-hypotheek` | [PROCESS.md](../../apps/artifact-hypotheek-wonen-maximale-hypotheek/PROCESS.md) | 2026-08-01 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Aanvullende beurs berekenen | `/apps/duo-aanvullende-beurs` | [PROCESS.md](../../apps/duo-aanvullende-beurs/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat doet extra aflossen? | `/apps/duo-extra-aflossen` | [PROCESS.md](../../apps/duo-extra-aflossen/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Impact van mijn leenbedrag | `/apps/duo-leenbedrag-impact` | [PROCESS.md](../../apps/duo-leenbedrag-impact/PROCESS.md) | 2026-08-01 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat wordt mijn DUO-maandbedrag? | `/apps/duo-maandbedrag` | [PROCESS.md](../../apps/duo-maandbedrag/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat wordt mijn studieschuld? | `/apps/duo-schuld-bij-starten-lenen` | [PROCESS.md](../../apps/duo-schuld-bij-starten-lenen/PROCESS.md) | 2026-08-01 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Wat kost stoppen met studeren? | `/apps/duo-stoppen-kosten-prestatiebeurs` | [PROCESS.md](../../apps/duo-stoppen-kosten-prestatiebeurs/PROCESS.md) | 2026-08-01 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Hypotheek-impact studieschuld | `/apps/hypotheek-impact-studieschuld` | [PROCESS.md](../../apps/hypotheek-impact-studieschuld/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Vergelijk mijn schulden | `/apps/schulden-volgorde` | [PROCESS.md](../../apps/schulden-volgorde/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |
| Welke toeslagen passen mogelijk bij mij? | `/apps/toeslagen-scan` | [PROCESS.md](../../apps/toeslagen-scan/PROCESS.md) | 2026-07-31 | Gebruiker, Beslissingen, Berekening, Gegevensstroom |

Aantal actieve publieke tools: **10**. Aantal vereiste procesdocumenten: **10**.

## Publicatie op toolpagina's

De eerste `flowchart TD` uit het gebruikersproces, beslisproces en rekenproces wordt tijdens de statische websitebuild gepubliceerd onder **Wil je weten hoe deze tool werkt?**. De gedeelde procesgids leest rechtstreeks uit `PROCESS.md`; `npm run process:check` valideert daarom ook dat deze drie platen door de publieke stap-voor-stapweergave kunnen worden verwerkt.

## Actualiseren en valideren

1. Controleer bij een functionele wijziging de volledige bronketen en pas de bijbehorende `PROCESS.md` aan als gedrag, invoer, beslissingen, berekening, resultaten of overdracht wijzigt.
2. Vernieuw pas daarna de gecontroleerde vingerafdruk met `npm run process:update -- --tool <tool-id> --reviewed`.
3. Genereer deze index zo nodig met `npm run process:index`.
4. Draai `npm run process:check`. De controle faalt bij ontbrekende documenten, route- of ID-afwijkingen, ontbrekende secties, ongeldige Mermaid-basisstructuur, ontbrekende bronbestanden, een verouderde hash of een niet-actuele index.

De updateopdracht bevestigt alleen administratief dat een mens of agent de inhoud heeft herbeoordeeld; de vlag `--reviewed` mag niet worden gebruikt om uitsluitend een rode hashcontrole te omzeilen.

De vingerafdruk gebruikt de exacte inhoud van uitsluitend de expliciete functionele bronbestanden in de frontmatter. Dat is bewust conservatief: een formattingwijziging in zo'n bestand kan extra review vragen, maar een gedragswijziging kan niet worden gemist door een onbetrouwbare poging om semantische en cosmetische TypeScript-wijzigingen automatisch te onderscheiden.

## Afwijkingen

- `FUNCTIONALITY_STATUS.md` en de gegenereerde registry noemen beide tien publieke tools; de manifest- en routegeneratie is doorslaggevend.
- `familiehulp-eerste-woning` heeft publieke manifestmetadata maar `enabled: false` en is daarom terecht niet opgenomen.
- De Mermaid-validatie gebruikt bewust de projectsubset `flowchart TD` en `sequenceDiagram`. Zonder een zware browser-/Mermaid-CLI-dependency controleert zij structuur, verbindingen, verboden syntax en gebalanceerde delimiters; rendering blijft aanvullend onderdeel van review.
