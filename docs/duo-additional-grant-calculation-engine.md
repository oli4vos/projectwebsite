# DUO Aanvullende-beurscalculator 2026

Peildatum: 2026-07-21.

## Scope

De centrale rekenlaag staat in `src/lib/duo/additional-grant`. De module is pure TypeScript, deterministic, immutable en onafhankelijk van React, routes, manifests en PDF-rendering.

De module ondersteunt reguliere 2026-berekeningen voor:

- mbo niveau 1/2 en mbo niveau 3/4 met concrete woonsituatie;
- hbo en universiteit;
- reguliere eenouder- en tweouderberekeningen;
- concrete ouderinkomens in het standaardpeiljaar;
- optionele vergelijking met peiljaar 2025 of 2026;
- ouderbijdrageaftrek voor verplichte DUO-termijnen en andere kwalificerende kinderen;
- delen van ouderbijdrage over kinderen met aanvullende beurs.

Special cases worden expliciet als `special-case`, `unsupported` of `official-verification-required` teruggegeven en niet met stille defaults berekend.

## Integratiecontract

Gebruik uitsluitend:

```ts
calculateDuoAdditionalGrant(input)
```

De publieke tool mag deze functie pas aanroepen met concrete waarden of bevestigde afleidingen. `Weet ik niet` blijft intake-state en wordt niet als rekenwaarde doorgegeven.

Benodigde kernvelden:

- `calculationYear: 2026`;
- `educationType`;
- `residence`;
- `familySituation`;
- `standardReferenceYearInput.parent1Income`;
- `standardReferenceYearInput.parent2Income` bij `familySituation: "two-parents"`;
- optioneel `alternativeReferenceYear` met bijbehorende alternative-year incomes.

Ontbrekende concrete invoer komt terug als `missingInputs` met machineleesbare guidance die de UI direct kan tonen. Bronlinks zijn metadata/voetnoot en vervangen de uitleg niet.

## Formulegrens

De reguliere ouderbijdrage wordt per ouder berekend:

1. ouderinkomen minus vrijgesteld bedrag;
2. negatieve uitkomst telt als 0;
3. vermenigvuldig met DUO-afbouwpercentage;
4. trek verplichte DUO-terugbetalingstermijnen af;
5. trek aftrekpost voor andere kwalificerende kinderen af;
6. negatieve uitkomst telt als 0;
7. deel door kinderen met aanvullende beurs;
8. tel ouders samen en deel door 12;
9. aanvullende beurs = maximum maandbedrag minus maandelijkse inhouding, minimaal 0.

Alle geldbedragen worden op centen afgerond.

## Nog Niet Voor Publieke Activatie

Een Feature Integrator kan een publieke intake bouwen, maar moet vooraf expliciet afhandelen:

- concrete input-resolutie voor ouderinkomen;
- zichtbare bevestiging van afgeleide waarden;
- special cases zoals overleden/onbekende/buitenlandse ouder, buitenbeschouwing, conflict of ondernemingsinkomen zonder definitieve vaststelling;
- mbo-periode na juli 2026;
- terugbetalingsrisico bij geschat inkomen;
- privacy: geen ouderinkomens in URL, logs of analytics.
