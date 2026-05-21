# Go-Live Checklist (Browser-Only Financiële Rekentools)

Status: gebruik deze lijst vóór elke publieke release.

## 1) Juridische copy en positionering
- [ ] Homepage en toolintro’s benoemen expliciet: educatief en indicatief.
- [ ] Elke tool bevat duidelijk: geen persoonlijk financieel advies.
- [ ] Elke tool bevat duidelijk: geen officiële aangifte- of hypotheekberekening.
- [ ] Terminologie blijft begrijpelijk; vaktermen worden kort uitgelegd.

## 2) Versiebeheer en traceerbaarheid
- [ ] Elke publieke tool heeft complete manifestmetadata (`app.json`).
- [ ] `npm run generate:apps` draait zonder fouten.
- [ ] Release-notes bevatten commit hash + datum van livegang.
- [ ] Wijzigingen in aannames/percentages worden expliciet gelogd.

## 3) Regressiechecks in CI
- [ ] `npm run test` slaagt.
- [ ] `npm run lint` slaagt.
- [ ] `npm run typecheck` slaagt.
- [ ] `npm run build` slaagt.
- [ ] `npm run check` slaagt.

## 4) Betrouwbaarheidspagina aannames
- [ ] `/variabelen` bevat light samenvatting + uitklapbare verdieping.
- [ ] Bron/aannameset en gecontroleerde datum zijn zichtbaar.
- [ ] Voorlopig/definitief/indicatief labels zijn begrijpelijk in gewone taal.
- [ ] Uitleg noemt expliciet wat niet wordt meegenomen.

## 5) Frontend foutmonitoring (privacy-first)
- [ ] Frontend error monitoring is actief (zonder PII in events).
- [ ] Runtime crashes worden gealert met release-versie.
- [ ] Console-errors in kritieke tools zijn periodiek gecontroleerd.
- [ ] Incident-proces is vastgelegd (wie fixt, hoe snel, hoe communiceren).

## 6) Gebruikersexport en data-continuïteit
- [ ] Kernflows hebben exportoptie waar relevant (CSV/PDF).
- [ ] Export benoemt dat uitkomsten indicatief zijn.
- [ ] Resultaten zijn herleidbaar naar invoer en aannames.
- [ ] Browser-only beperkingen zijn expliciet benoemd (geen account-sync).

## Release-gate (Go/No-Go)
- [ ] Alle 6 secties hierboven zijn groen.
- [ ] Laatste `main` commit heeft groene CI op GitHub.
- [ ] Laatste handmatige smoke-test op mobiel + desktop is gedaan.
