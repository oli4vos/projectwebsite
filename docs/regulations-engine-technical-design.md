# Regelingen Engine Technical Design

Peildatum: 2026-07-20.

## Doel van de eerste implementatie

Deze fase levert alleen typed primitives en kleine pure helpers voor toekomstige regelingen. Er is geen orchestration framework, geen regeling-specifieke logica, geen publieke integratie en geen bedragberekening toegevoegd. De bestaande publieke toeslagenscan blijft ongewijzigd.

## Modulegrenzen

De minimale basis staat onder `src/lib/regulations`:

- `types.ts`: publieke generieke domeincontracten.
- `confidence.ts`: scorevalidatie, labelmapping en factorcombinatie.
- `estimate.ts`: constructie en validatie van typed estimate ranges.
- `answers.ts`: expliciete answer states en veilige value helpers.
- `dependencies.ts`: beperkte dependency condition evaluator zonder vrije expressies.
- `actions.ts`: deterministische action-plan sortering.
- `evidence.ts`: deterministische evidence merge en deduplicatie.
- `index.ts`: publieke exports.

De indeling blijft bewust klein. Er is geen rules DSL, runtime interpreter of registry.

## Verantwoordelijkheden

De generieke laag definieert confidence, unknown answers, inferred values, dependencies, estimate ranges, complexity, recommendations, action plans en evidence. Deze laag weet niets van toeslagen, DUO, hypotheek, gemeenten of fiscale regelingen.

Een latere domeinadapter vertaalt regeling-specifieke domeinuitkomsten naar deze generieke contracten. Bijvoorbeeld een allowance-adapter mag bestaande `src/lib/allowances` resultaten verrijken met confidence, evidence en acties, maar mag geen tweede toeslagenengine bouwen.

Bestaande domeinmodules blijven eigenaar van inhoudelijke regels, formules, brondata en regressietests. `src/lib/financial-constants` blijft de brondata-SSOT.

React mag alleen answers verzamelen, domeinhelpers aanroepen en resultaten tonen. React bevat geen dependencies, inferenties, confidenceberekening, bedraglogica of business rules.

## Geen framework

Deze fase bouwt expliciet niet:

- generieke rules DSL;
- runtime rule interpreter;
- eventbus;
- state machine framework;
- dependency injection;
- pluginregistratie;
- opslagmodel;
- backendcontract;
- allowance-adapter;
- bedragengine.

## Latere adaptergrens

Een toekomstige adapter krijgt regeling-specifieke input en brondata, roept bestaande domeinmodules aan en levert een `RegulationEvaluationResult`. De adapter mag `AnswerState`, `ConfidenceAssessment`, `EstimateRange`, `CalculationEvidence`, `Recommendation` en `ActionPlanItem` gebruiken, maar blijft dun en testbaar.
