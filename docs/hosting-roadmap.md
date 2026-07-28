# Hostingroadmap

Status: toekomstig; de huidige productieomgeving blijft GitHub Pages totdat
een afzonderlijke migratie is getest en vrijgegeven.

## Besluit

De beoogde volgende hostingstap is Cloudflare Pages in combinatie met een
eigen domeinnaam. De bronrepository en AGPL-licentie staan los van die keuze:
de code kan openbaar blijven terwijl deployment, DNS en securitybeleid
centraal worden beheerd.

## Reden

De migratie is bedoeld voor:

- een herkenbaar eigen domein;
- projectgestuurde HTTP-securityheaders;
- gecontroleerde redirects en caching;
- aanvullende bescherming tegen misbruik en ongewenst verkeer;
- een duidelijkere scheiding tussen bronrepository en productieomgeving.

Deze maatregelen voorkomen niet dat publiek geleverde HTML, CSS, JavaScript
of open broncode wordt gekopieerd. Merk-, content- en auteursrechtelijke
bescherming staan afzonderlijk in `NOTICE.md`.

## Releasevoorwaarden

Voor de migratie worden minimaal gecontroleerd:

1. custom domain, DNSSEC waar ondersteund en geforceerde HTTPS;
2. een geteste Content Security Policy zonder applicatieregressies;
3. anti-framing via CSP `frame-ancestors` en waar passend
   `X-Frame-Options`;
4. `X-Content-Type-Options`, `Referrer-Policy` en een beperkte
   `Permissions-Policy`;
5. correcte cache-instellingen voor HTML en gehashte assets;
6. directe routes, browser-refresh, PDF-downloads en externe bronlinks;
7. privacyvriendelijke logging zonder financiele invoer;
8. gescheiden preview- en productieconfiguratie;
9. rollback naar de laatst bekende goede deployment;
10. bijgewerkte privacyverklaring, securitydocumentatie en incidentprocedure.

Cloudflare Web Analytics, Workers, Turnstile, remote opslag en andere
aanvullende diensten worden niet automatisch geactiveerd. Elke dienst vereist
eerst een aparte privacy-, security- en noodzaakbeoordeling.
