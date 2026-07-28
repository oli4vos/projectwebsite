# Securitybeleid

## Ondersteunde versie

Alleen de actuele versie op `main` en de daarvan gebouwde publieke site worden
actief ondersteund. Oudere commits, tags, forks en aangepaste deployments
kunnen bekende of inmiddels opgeloste problemen bevatten.

## Een kwetsbaarheid melden

Meld een vermoedelijke kwetsbaarheid niet in een openbaar issue en plaats
geen persoonsgegevens, financiele invoer, tokens of andere geheimen in een
melding.

Gebruik bij voorkeur
[GitHub Private Vulnerability Reporting](https://github.com/oli4vos/projectwebsite/security/advisories/new).
Als die route niet beschikbaar is, vraag dan via het
[GitHub-profiel van de beheerder](https://github.com/oli4vos) om een prive
contactkanaal zonder de kwetsbaarheid zelf openbaar te beschrijven.

Vermeld in een private melding:

- de geraakte URL, versie of commit;
- reproduceerbare stappen;
- de verwachte en feitelijke impact;
- een minimale proof of concept zonder gegevens van anderen;
- een mogelijke oplossing, als die bekend is.

De beheerder probeert ontvangst binnen vijf werkdagen te bevestigen.
Publiceer details pas nadat een oplossing beschikbaar is of nadat daarover
expliciet is afgestemd.

## Securitymodel

De huidige publieke site is static-first en local-first:

- berekeningen draaien in de browser;
- er is geen verplichte account- of serverruntime;
- profielgegevens blijven standaard in `sessionStorage` en alleen na een
  bewuste keuze op het apparaat in `localStorage`;
- browserpublieke `NEXT_PUBLIC_*`-waarden mogen nooit secrets bevatten;
- CI controleert brondata, types, tests, build en gelekte geheimen;
- productie-dependencies worden periodiek met `npm audit --omit=dev`
  gecontroleerd.

GitHub Pages verzorgt momenteel HTTPS, maar laat binnen deze inrichting geen
projectspecifieke set HTTP-securityheaders toe. Een toekomstige verhuizing
naar Cloudflare Pages met eigen domein staat gepland. Voor ingebruikname
moeten daar minimaal CSP, anti-framing, MIME-sniffingpreventie,
referrerbeleid, permissions policy, HTTPS en rollback worden getest. Zie
`docs/hosting-roadmap.md`.

## Buiten scope

De volgende meldingen zijn normaal gesproken geen kwetsbaarheid:

- alleen het kunnen bekijken, downloaden of forken van AGPL-broncode;
- manipulatie van resultaten in de eigen browser;
- geautomatiseerd verkeer zonder aantoonbare beschikbaarheids- of
  beveiligingsimpact;
- problemen in niet-publieke, uitgeschakelde of door derden aangepaste code.
