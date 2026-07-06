# Status

- Datum archivering: 2026-07-06
- Status: ontwerp/overdracht — beschrijft repo-staat op commit `6749bd5`, niet actueel.
- Relatie tot huidige code: dit document is achtergrond voor de familiefinancieringsrichting; de app `familiehulp-eerste-woning` en branch `feat/family-financing-foundation` zijn later uitgewerkt en kunnen van deze momentopname afwijken.

# Repository snapshot

- Branch: `main`
- Commit: `6749bd55c24c9c24ad318c85f0a55b43f1d735c2`
- Werkboom vooraf: schoon nadat de lokale wijziging aan `ideetjes.txt` apart is bewaard in stash `save ideetjes before family financing handoff`.
- Node/npm in lokale shell tijdens inspectie: Node `v14.17.6`, npm `6.14.15`.
- Repo-advies in `README.md`: Node 20 via `.nvmrc` (`v20.19.6`).
- Package manager: npm.
- Scope van dit document: ontwerp- en overdrachtsdocument. Er is geen productiecode gewijzigd.

# Runtime, build and deployment

De site is een Next.js App Router-project met losse rekentools onder `apps/`.

Belangrijke versies uit `package.json`:

- `next`: `16.2.6`
- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `typescript`: `^5`
- `vitest`: `^4.1.6`
- `eslint`: `^9`

Belangrijke scripts uit `package.json`:

- `npm run generate:apps`: draait `scripts/generate-app-registry.mjs`
- `npm run import:artifact-tools`: draait `scripts/import-artifact-staging-to-apps.mjs`
- `npm run dev`: start Next dev, voorafgegaan door `predev`
- `npm run build`: bouwt Next, voorafgegaan door `prebuild`
- `npm run test`: draait `vitest run`
- `npm run lint`: draait `eslint .`
- `npm run typecheck`: draait `next typegen && tsc --noEmit`
- `npm run check`: genereert registry, controleert generated diff, draait tests, lint, typecheck en build

Deploymentmodel:

- `.github/workflows/ci.yml` gebruikt Node 20, `npm ci`, `npm run generate:apps`, een generated-file diff-check, tests, lint, typecheck en build.
- `.github/workflows/deploy-pages.yml` draait na succesvolle CI of handmatig. De workflow voert `npm run generate:apps`, `npm run typecheck` en `npm run build` uit, met `GITHUB_ACTIONS=true`.
- `next.config.ts` schakelt alleen in GitHub Actions over op static export met `output: "export"`, `trailingSlash: true`, `basePath` en `assetPrefix`.
- `basePath` wordt afgeleid uit `GITHUB_REPOSITORY`, tenzij het een user/org Pages-repo eindigend op `.github.io` is.
- De oplossing moet daarom geschikt blijven voor browser-only/static export. Geen verplichte server runtime, geen server-side arbitrary code execution, geen secrets in de repo.

# App discovery and routing

Een app wordt ontdekt via `scripts/generate-app-registry.mjs`.

Proces:

1. De generator scant `apps/`.
2. Elke submap moet een `app.json` bevatten.
3. `slug` moet exact gelijk zijn aan de mapnaam.
4. De generator valideert manifestvelden.
5. Alleen apps met `visibility: "public"` komen in de gegenereerde registry.
6. De generator schrijft `src/lib/app-registry.ts` en `src/lib/app-components.tsx`.

Manifestcontract uit `src/lib/app-types.ts`:

```ts
export type AppType = "frontend" | "api";
export type AppStatus = "active" | "beta" | "draft";
export type AppVisibility = "public" | "hidden";

export type AppManifest = {
  slug: string;
  title: string;
  description: string;
  type: AppType;
  category: string;
  tags: string[];
  status: AppStatus;
  visibility?: AppVisibility;
  requiredProfileFields?: string[];
  reasonHint?: string;
  assumptionsUsed?: AppAssumptionDomain[];
  calculationDomains?: AppCalculationDomain[];
  riskLevel?: AppRiskLevel;
  disclaimerType?: AppDisclaimerType;
  outputType?: AppOutputType;
  version?: string;
  entry: string;
};
```

Belangrijke routing:

- `src/app/page.tsx` rendert `AppDashboard` met `appRegistry`.
- `src/app/apps/[slug]/page.tsx` rendert toolpagina's.
- `generateStaticParams()` gebruikt `appRegistry.map((app) => ({ slug: app.slug }))`.
- `AppRenderer` in `src/components/AppRenderer.tsx` haalt `appComponents[slug]` op.
- `src/lib/app-components.tsx` gebruikt `next/dynamic` voor lazy loading van `../../apps/<slug>/Calculator`.
- Hidden apps zijn niet zichtbaar in dashboard of statische routeparams.

Dashboard en doelgroeproutes:

- `src/components/AppDashboard.tsx` splitst reguliere tools en artifacts.
- Artifacts worden herkend aan tag `artifact-import`.
- Artifacts worden apart getoond in de sectie "Artifacts tools (invulbladen)" en gegroepeerd op `category`.
- `src/lib/audience-routes.ts` bevat doelgroepfilters en aanbevolen starttools.
- De bestaande route `starter-studieschuld` verwijst onder andere naar `schulden-volgorde`, `volgende-euro`, `studieschuld-vs-beleggen` en `hypotheek-impact-studieschuld`.

# Existing public DUO tools

De bestaande reguliere DUO-tools blijven zelfstandig bestaan.

Belangrijke publieke DUO-gerelateerde tools:

- `apps/studieschuld-vs-beleggen/`
- `apps/hypotheek-impact-studieschuld/`
- `apps/schulden-volgorde/`

Registry-status:

- `studieschuld-vs-beleggen`: `status: "active"`, `visibility: "public"`, categorie `Schulden`.
- `hypotheek-impact-studieschuld`: `status: "beta"`, `visibility: "public"`, categorie `Hypotheek`.
- `schulden-volgorde`: `status: "beta"`, `visibility: "public"`, categorie `Schulden`.

Belangrijke compatibiliteitseisen:

- `/apps/studieschuld-vs-beleggen/` blijft werken.
- `/apps/hypotheek-impact-studieschuld/` blijft werken.
- `/apps/schulden-volgorde/` blijft werken.
- Bestaande invoervelden behouden hun betekenis.
- Bestaande uitkomsten veranderen niet stilzwijgend.
- Nieuwe familieroute mag deze tools gebruiken als startpunt of context, maar vervangt ze niet.

# Central DUO domain layer

De centrale DUO-laag staat onder `src/lib/duo/`.

Publieke exports uit `src/lib/duo/index.ts`:

```ts
export {
  calculateIndicativeIncomeBasedMonthlyPayment,
  calculateDuoMonthlyPaymentAfterExtraRepayment,
  calculateExtraRepaymentPayoffImpact,
  calculateExtraRepaymentVsInvesting,
  calculatePayoffDate,
  calculateRemainingMonthsToPayOff,
  calculateRemainingDebtAfterExtraRepayment,
  calculateStatutoryDuoMonthlyPayment,
  determineRelevantDuoPayment,
  sanitizeDuoMoney,
  sanitizeDuoPercent,
} from "@/lib/duo/calculations";
```

Belangrijke types uit `src/lib/duo/types.ts`:

```ts
export type DuoSituation =
  | "repaying"
  | "gracePeriod"
  | "incomeBasedReduction"
  | "paymentPause"
  | "unknown";

export type RepaymentRule =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";

export type DuoPaymentSource =
  | "actual"
  | "statutory"
  | "estimated"
  | "incomeBased"
  | "mixed";

export type ExtraRepaymentStrategy = "lowerMonthlyPayment" | "shortenTerm";
```

Belangrijke functies:

- `calculateStatutoryDuoMonthlyPayment(input)`: annuitair wettelijk maandbedrag op basis van resterende schuld, rente, looptijd en regime.
- `calculateIndicativeIncomeBasedMonthlyPayment(input)`: indicatieve draagkrachtberekening.
- `determineRelevantDuoPayment(input)`: bepaalt relevante maandlast per DUO-situatie.
- `calculateDuoMonthlyPaymentAfterExtraRepayment(input)`: verlaagt schuld en herberekent maandbedrag.
- `calculateExtraRepaymentPayoffImpact(input)`: vergelijkt lagere maandlast versus kortere looptijd.
- `calculateExtraRepaymentVsInvesting(input)`: vergelijkt extra aflossen met beleggen.
- `calculatePayoffDate(input)`: indicatieve aflosdatum.
- `calculateRemainingMonthsToPayOff(input)`: resterende maanden op basis van betaling en rente.

Ondersteunde situaties:

- `repaying`: actueel maandbedrag is leidend, met conservatief scenario.
- `gracePeriod`: toekomstige wettelijke/geschatte betaling is leidend.
- `incomeBasedReduction`: onderscheid tussen feitelijke lagere betaling en conservatieve wettelijke betaling.
- `paymentPause`: primaire impact blijft niet nul; optimistisch scenario kan nul zijn.
- `unknown`: veilige schatting met waarschuwing.

Representatie van meerdere schuldonderdelen:

- De centrale DUO-laag rekent met een geaggregeerde resterende schuld.
- `apps/studieschuld-vs-beleggen/Calculator.tsx` heeft UI-state voor `debtParts`, maar `apps/studieschuld-vs-beleggen/logic.ts` rekent uiteindelijk met `remainingDebt`, `annualDebtRate` en `remainingTermYears`.
- Voor een toekomstige familieroute moet eventuele multi-part DUO-invoer eerst expliciet worden genormaliseerd naar centrale DUO-input of later als nieuw centraal DUO-contract worden toegevoegd.

Financiele constanten:

- `src/lib/financial-constants/index.ts` levert helpers zoals `getFinancialConstants`, `getDuoRateForRule`, `getDuoDefaultTermForRule`, `getDuoIncomeBasedRuleForRepaymentRule`, `getStudentDebtGrossUpFactor`.
- `src/lib/financial-constants/years.ts` bevat de 2026-aannames met metadata, bronlabel, `lastChecked` en status.

DUO-invarianten:

- `src/lib/duo/` blijft de enige bron voor DUO-formules.
- Geen gekopieerde DUO-formules in React-componenten.
- Geen gekopieerde DUO-formules in `src/lib/family-financing/`.
- Bestaande DUO-tests blijven groen.
- Bestaande DUO-URLs blijven behouden.
- Nieuwe familieroute importeert centrale DUO-functies en vertaalt alleen scenario-input naar DUO-input.

# Mortgage-impact implementation

De implementatie staat in `apps/hypotheek-impact-studieschuld/`.

Belangrijke imports in `logic.ts`:

- `getFinancialConstants`
- `getDuoDefaultTermForRule`
- `getDuoRateForRule`
- `getIndicativeIncomeHousingCostRatio`
- `getStudentDebtGrossUpFactor`
- `calculateIndicativeIncomeBasedMonthlyPayment`
- `calculateDuoMonthlyPaymentAfterExtraRepayment`
- `calculateExtraRepaymentPayoffImpact`
- `determineRelevantDuoPayment`

Belangrijke exports:

```ts
export type HypotheekImpactInput = {
  situation: DuoSituation;
  repaymentRule: RepaymentRule;
  actualMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  remainingStudentDebt?: number;
  duoInterestRate?: number;
  remainingTermYears?: number;
  extraRepayment?: number;
  grossIncomeUser: number;
  grossIncomePartner: number;
  desiredHomePrice?: number;
  ownMoney?: number;
  maxMortgageWithoutStudentDebt?: number;
  mortgageRate: number;
  mortgageTermYears: number;
};

export function calculateAnnuityPayment(
  principal: number,
  annualRate: number,
  years: number,
): number;

export function calculatePresentValueFromMonthlyPayment(
  monthlyPayment: number,
  annualRate: number,
  years: number,
): number;

export function calculateHypotheekImpact(
  input: HypotheekImpactInput,
): HypotheekImpactResult;
```

Algoritme hypotheekimpact:

1. Bepaal relevante DUO-betaling via centrale DUO-laag.
2. Bepaal bruteringsfactor via `getStudentDebtGrossUpFactor`.
3. Reken netto DUO-maandlast om naar bruto maandimpact.
4. Reken de bruto maandimpact terug naar hoofdsom-impact via contante waarde van een annuiteit.
5. Bepaal eventueel extra-aflosscenario op DUO.
6. Bepaal woningdoel, eigen geld, benodigde hypotheek en indicatieve gap.

Herbruikbaar:

- Annuiteitsbetaling.
- Contante waarde uit maandlast.
- Bruteringsstaffelselectie.
- Eenvoudige indicatieve hypotheekcapaciteit op basis van inkomen en maandbudget.

Voorstel:

- Extraheer algemene functies later naar `src/lib/mortgage/`.
- Laat `apps/hypotheek-impact-studieschuld/logic.ts` backward-compatible blijven via re-export/façade.
- Uitkomsten mogen in Fase 1 niet wijzigen.

# Profile, prefill and storage

Profieltype staat in `src/lib/user-profile.ts`.

Belangrijke profielvelden:

- `income.grossAnnualIncome`
- `income.partnerGrossAnnualIncome`
- `income.householdType`
- `income.employmentType`
- `studentDebt.remainingDebt`
- `studentDebt.currentMonthlyPayment`
- `studentDebt.statutoryMonthlyPayment`
- `studentDebt.repaymentRule`
- `studentDebt.duoSituation`
- `studentDebt.duoInterestRate`
- `studentDebt.remainingTermYears`
- `housing.targetHomePrice`
- `housing.ownFunds`
- `housing.mortgageRate`
- `housing.mortgageTermYears`
- `housing.maxMortgageWithoutStudentDebt`
- `savingInvesting.currentSavings`
- `savingInvesting.targetEmergencyFund`
- `savingInvesting.monthlyFreeCashflow`
- `savingInvesting.expectedAnnualReturn`
- `savingInvesting.investmentHorizonYears`
- `tax.preferredBox3Method`
- `tax.hasFiscalPartner`
- `tax.preferredTaxYear`

Sanitizing:

- `sanitizeUserProfile(profile)` verwijdert lege secties.
- Negatieve bedragen worden naar veilige waarden gebracht of niet opgeslagen.
- Enums worden gevalideerd tegen lokale sets.
- Percentages worden begrensd op `0..100`.

Prefill:

- `src/lib/profile-prefill.ts` bevat `createProfilePrefillState` en `mergeProfilePatchIntoValues`.
- `src/lib/profile-tool-mapping.ts` bevat tool-specifieke mappers zoals `getMortgageImpactDefaultsFromProfile` en `getStudentDebtVsInvestingDefaultsFromProfile`.

Opslag:

- `src/lib/storage/storage-mode.ts` ondersteunt `local`, `hybrid`, `remote`.
- Default is `local`.
- `hybrid` en `remote` zijn voorbereid maar vallen in de huidige flow veilig terug naar local/no-op zonder verplichte server.

Toekomstige familieroute:

- Permanente profielvelden: inkomen, partnerinkomen, DUO-schuld, DUO-regime, eigen spaargeld, gewenste woningprijs, hypotheekrente, hypotheeklooptijd, minimumbuffer.
- Tijdelijke calculatorvelden: specifieke schenking, familielening, rente familielening, looptijd familielening, jaarlijkse schenking, beschikbare middelen ouders, scenario waarin schenking stopt.
- Scenario-opslag hoort niet automatisch profielopslag te zijn. Scenario's zijn snapshots.

# Reusable UI components

Herbruikbare componenten:

- `src/components/tool/CalculatorShell.tsx`: twee-koloms calculatorlayout met `intro`, `inputs`, `submitAction`, `result`, `details`, `disclaimer`.
- `src/components/ToolDisclosure.tsx`: standaard uitklapbare toelichtingssectie.
- `src/components/DisclosureSection.tsx`: wrapper rond `ToolDisclosure`.
- `src/components/MobileFieldFlowControls.tsx`: mobiele stapnavigatie door velden.
- `src/components/ResultRow.tsx`: compacte resultaatregel.
- `src/components/ResultCard.tsx`: resultaatkaart.
- `src/components/ChartPrimitives.tsx`: chartcontainer en legenda.
- `src/components/charts.tsx`: gedeelde grafiekcomponenten en tick helpers.
- `src/components/AppRenderer.tsx`: laadt calculatorcomponent op slug.
- `src/components/AppDashboard.tsx`: groepeert reguliere tools en artifacts.
- `src/components/SaveScenarioButton.tsx`: feature-flagged scenario-opslag.
- `src/components/SavedCalculationsList.tsx`: lokale scenario-lijst.
- `src/components/SavedScenarioComparison.tsx`: vergelijking van opgeslagen scenario's.
- `src/components/forms/FieldError.tsx`: foutweergave.
- `src/components/ui.tsx`: `Btn`, `BtnLink`, `Pill`, `Logo`, `CategoryDot`.

Aanbeveling voor de familieroute:

- Gebruik `CalculatorShell` als hoofdlayout.
- Gebruik pure `logic.ts` in de app als compositie/façade, niet als domeinlaag.
- Gebruik `ToolDisclosure` voor aannames, waarschuwingen en uitleg.
- Gebruik scenario-opslag pas wanneer de flow stabiel is.

# Existing family-bank and related Artifacts

`apps/artifact-hypotheek-wonen-familiebank-hypotheek/` is geen gevalideerde familiebankengine.

Feiten:

- `app.json` heeft `status: "draft"` en `visibility: "hidden"`.
- `logic.ts` gebruikt `TOOL_PROFILE = "generic_contract"`.
- `calculateFamiliebankHypotheek(input)` roept alleen `executeProfile(TOOL_PROFILE, input)` aan.
- `Calculator.tsx` gebruikt `ArtifactCalculator`.
- `logic.test.ts` test fixture-run, lege input en non-finite values. Er worden geen familiebankformules getest.

Conclusie:

- Deze module blijft hidden en draft totdat echte domeinlogica beschikbaar is.
- Hergebruik alleen als inventarisatiebron voor copy/manifest/routecontext.
- Niet gebruiken als financiele bron voor familielening, schenking, renteaftrek, kasstroom of juridische conclusies.

Gerelateerde artifacts rond maximale hypotheek, eigen geld, kosten koper, annuiteiten, schenking en woningfinanciering zijn alleen bruikbaar als `REFERENCE ONLY`, tenzij ze later aantoonbaar echte domeinlogica en regressietests krijgen.

# Reuse / Extend / New / Avoid matrix

| Onderdeel | Huidig pad | Status | Hergebruik | Benodigde wijziging | Risico | Aanbevolen doelpad |
|---|---|---|---|---|---|---|
| Centrale DUO-engine | `src/lib/duo/` | Actief | REUSE | Alleen importeren; geen kopie | Hoog bij duplicatie | `src/lib/duo/` |
| DUO-constants | `src/lib/financial-constants/` | Actief | REUSE | Jaarmetadata behouden | Hoog bij hardcoded percentages | `src/lib/financial-constants/` |
| Studieschuld vs beleggen | `apps/studieschuld-vs-beleggen/` | Publiek actief | REUSE/REFERENCE | Gedrag ongemoeid laten | Hoog bij regressie | App blijft bestaan |
| Hypotheekimpact studieschuld | `apps/hypotheek-impact-studieschuld/` | Publiek beta | EXTEND via façade | Algemene hypotheekfuncties extraheren | Hoog bij gewijzigde uitkomsten | `src/lib/mortgage/` + bestaande app |
| Welke schuld eerst | `apps/schulden-volgorde/` | Publiek beta | REFERENCE | Mogelijk prioriteitscopy hergebruiken | Middel | App blijft bestaan |
| Planning debt priority | `src/lib/planning/debt-priority.ts` | Actief | REFERENCE | Niet als hypotheeknorm gebruiken | Middel | Eventueel later `src/lib/planning/` |
| Koop vs huur | `src/lib/planning/buy-vs-rent.ts` | Actief | EXTEND/REFERENCE | Annuiteit later centraliseren | Middel | `src/lib/mortgage/annuity.ts` |
| Tax laag | `src/lib/tax/` | Actief indicatief | REUSE | Alleen indicatieve fiscale effecten | Hoog bij adviesclaim | `src/lib/tax/` |
| Profiel | `src/lib/user-profile.ts` | Actief/feature-flagged UI | EXTEND | Eventueel extra permanente velden na besluit | Middel privacy/UX | `src/lib/user-profile.ts` |
| Prefill mapping | `src/lib/profile-tool-mapping.ts` | Actief | EXTEND | Nieuwe mapper voor familieroute | Laag/middel | Zelfde bestand of submodule |
| Scenario opslag | `src/lib/storage/saved-calculations/` | Voorbereid/feature-flagged | EXTEND | Alleen snapshots, geen autosave | Middel privacy | Zelfde laag |
| Artifact familiebank | `apps/artifact-hypotheek-wonen-familiebank-hypotheek/` | Hidden draft | AVOID/REFERENCE ONLY | Niet publiek maken zonder echte engine | Hoog | Nieuwe app `apps/familiehulp-eerste-woning/` |
| Artifact generic runtime | `apps/_artifact_shared/runtime.ts` | Artifact-hulplaag | AVOID voor domein | Niet gebruiken voor familielening | Hoog | Nieuwe pure domeinlaag |
| Nieuwe hypotheeklaag | Niet aanwezig | Nieuw | NEW | Pure functies en tests | Middel | `src/lib/mortgage/` |
| Nieuwe familiefinanciering | Niet aanwezig | Nieuw | NEW | Pure scenario-engine en tests | Hoog | `src/lib/family-financing/` |
| Gift constants | Niet aanwezig | Nieuw | NEW | Jaarversies met bronmetadata | Hoog juridisch/fiscaal | `src/lib/financial-constants/gifts/` |
| Nieuwe compositietool | Niet aanwezig | Nieuw | NEW | App-shell boven domeinlagen | Hoog UX/product | `apps/familiehulp-eerste-woning/` |

# Proposed target architecture

Aanbevolen structuur, passend bij bestaande conventies:

```text
src/lib/
├── duo/
├── mortgage/
│   ├── annuity.ts
│   ├── present-value.ts
│   ├── affordability.ts
│   ├── types.ts
│   └── index.ts
├── family-financing/
│   ├── family-loan.ts
│   ├── gifts.ts
│   ├── purchase-financing.ts
│   ├── scenarios.ts
│   ├── stress-tests.ts
│   ├── types.ts
│   └── index.ts
└── financial-constants/
    └── gifts/

apps/
└── familiehulp-eerste-woning/
    ├── app.json
    ├── Calculator.tsx
    ├── logic.ts
    └── logic.test.ts
```

Ontwerpregels:

- `src/lib/duo/` blijft leidend voor DUO.
- `src/lib/mortgage/` bevat generieke hypotheekrekenfuncties.
- `src/lib/family-financing/` componeert schenking, familielening, bancaire hypotheek, eigen geld en DUO.
- `apps/familiehulp-eerste-woning/logic.ts` is een app-façade en bevat geen diepe financiele formules.
- `Calculator.tsx` bevat UI-state, validatiecopy en presentatie, maar geen domeinformules.
- Jaarafhankelijke aannames worden centraal opgeslagen met metadata.

# Proposed TypeScript contracts

Voorstel, nog niet implementeren:

```ts
export type AssumptionMetadata = {
  year: number;
  sourceLabel: string;
  sourceUrl?: string;
  lastChecked: string;
  status: "definitief" | "voorlopig" | "indicatief" | "extern-te-valideren";
  notes?: string;
};

export type FamilyLoanInput = {
  principal: number;
  annualInterestRate: number;
  termYears: number;
  repaymentType: "annuity" | "linear" | "interestOnly" | "custom";
  startDate?: string;
  monthlyPaymentOverride?: number;
  lenderLabel?: string;
  borrowerLabel?: string;
};

export type GiftInput = {
  oneTimeGift?: number;
  periodicGiftAmount?: number;
  periodicGiftFrequency?: "monthly" | "quarterly" | "yearly";
  periodicGiftYears?: number;
  giftPurpose: "ownContribution" | "duoRepayment" | "familyLoanSupport" | "buffer" | "unspecified";
  stopAfterMonths?: number;
  assumptionYear?: number;
};

export type PurchaseFinancingInput = {
  purchasePrice: number;
  buyerCosts?: number;
  ownFunds: number;
  minimumBuffer: number;
  bankMortgagePrincipal?: number;
  bankMortgageRate?: number;
  bankMortgageTermYears?: number;
  familyLoan?: FamilyLoanInput;
  gift?: GiftInput;
  duo: import("@/lib/duo").DuoRelevantPaymentInput;
  grossAnnualIncome: number;
  partnerGrossAnnualIncome?: number;
};

export type HouseholdCashflow = {
  contractualMonthlyBankMortgage: number;
  contractualMonthlyFamilyLoan: number;
  contractualMonthlyDuo: number;
  factualMonthlyGiftSupport: number;
  factualMonthlyNetOutflow: number;
  monthlyBufferAfterHousing: number;
  warnings: string[];
};

export type ParentCashflowSummary = {
  oneTimeOutflow: number;
  monthlyOutflow: number;
  totalOutflowOverScenario: number;
  outstandingFamilyLoanEnd: number;
  giftOutflowOverScenario: number;
  warnings: string[];
};

export type FinancingScenario = {
  id: string;
  label: string;
  kind:
    | "bankOwnFundsDuo"
    | "giftOwnContribution"
    | "giftDuoRepayment"
    | "familyLoan"
    | "familyLoanWithSeparateGift"
    | "giftVsLoan"
    | "giftStops"
    | "minimumBuffer";
  input: PurchaseFinancingInput;
  assumptionMetadata: AssumptionMetadata[];
};

export type StressTestResult = {
  scenarioId: string;
  withoutFutureGift: HouseholdCashflow;
  higherMortgageRate?: HouseholdCashflow;
  lowerIncome?: HouseholdCashflow;
  bufferShortfall: number;
  stillFinanceable: boolean;
  warnings: string[];
};

export type FinancingScenarioResult = {
  scenarioId: string;
  totalPurchaseNeed: number;
  availableOwnContribution: number;
  requiredBankMortgage: number;
  requiredFamilyLoan: number;
  remainingDuoDebt: number;
  duoRelevantMonthlyPayment: number;
  householdCashflow: HouseholdCashflow;
  parentCashflow: ParentCashflowSummary;
  stressTest: StressTestResult;
  financeable: boolean;
  affordable: boolean;
  assumptions: AssumptionMetadata[];
  warnings: string[];
};
```

# Scenario dependency map

Scenario A: bankhypotheek + eigen geld + DUO

- Gebruikt: `src/lib/duo/`, `src/lib/mortgage/`
- Nieuw nodig: purchase-financing compositie
- Let op: DUO-maandlast verlaagt leencapaciteit, maar is geen aankoopkostenpost.

Scenario B: schenking als eigen inbreng

- Gebruikt: mortgage purchase need
- Nieuw nodig: gift model
- Let op: een schenking verhoogt eigen inbreng, maar is geen structureel inkomen.

Scenario C: schenking gebruiken voor extra DUO-aflossing

- Gebruikt: centrale DUO extra-aflosfuncties
- Nieuw nodig: gift allocation
- Let op: extra aflossen mag niet dubbel worden geteld als eigen geld en DUO-reductie.

Scenario D: familielening naast bancaire hypotheek

- Gebruikt: mortgage + family-loan engine
- Nieuw nodig: contractuele familieleninglast
- Let op: familielening is schuld en maandlast, geen schenking.

Scenario E: familielening met afzonderlijke jaarlijkse schenking

- Gebruikt: family-loan + gift model
- Nieuw nodig: gescheiden kasstromen
- Let op: contractuele maandlast blijft bestaan, ook als ouders later schenken.

Scenario F: vergelijking schenking versus lening

- Gebruikt: gift model, family-loan model, purchase-financing
- Nieuw nodig: scenariovergelijking
- Let op: lening en schenking hebben andere juridische/fiscale status.

Scenario G: periodieke schenking stopt

- Gebruikt: stress-tests
- Nieuw nodig: stop-scenario
- Let op: toekomstige schenking is niet gegarandeerd.

Scenario H: minimale noodbuffer

- Gebruikt: purchase-financing + household cashflow
- Nieuw nodig: buffercontrole
- Let op: eigen geld boven minimum kan beschikbaar zijn, minimum buffer blijft apart.

# Assumptions and validation gaps

Niet zelf verzinnen:

- actuele schenkvrijstellingen
- fiscale behandeling van familieleningen
- vereisten voor zakelijke rente
- notariële of contractuele verplichtingen
- hypotheeknormen per aanbieder
- behandeling toekomstige schenkingen bij leencapaciteit

Technische behoefte:

- jaarversies voor fiscale aannames
- bronlabel
- bron-URL
- laatst gecontroleerde datum
- geldigheidsjaar
- status: definitief, voorlopig, indicatief, extern te valideren
- notities en waarschuwingen

Aanbevolen opslag:

- `src/lib/financial-constants/gifts/types.ts`
- `src/lib/financial-constants/gifts/years.ts`
- `src/lib/financial-constants/gifts/index.ts`

UI moet onderscheid maken tussen:

- berekening
- aanname
- waarschuwing
- externe validatie nodig
- geen persoonlijk financieel, fiscaal of juridisch advies

# Backward-compatibility requirements

- De bestaande reguliere DUO-tools blijven zelfstandig bestaan.
- De bestaande publieke DUO-URLs blijven werken.
- `src/lib/duo/` blijft de enige bron voor DUO-formules.
- De nieuwe familieroute kopieert geen DUO-logica.
- `apps/artifact-hypotheek-wonen-familiebank-hypotheek/` is geen gevalideerde familiebankengine.
- Deze Artifact-module blijft hidden en draft totdat echte domeinlogica beschikbaar is.
- De nieuwe familieroute wordt toegevoegd aan de huidige repository.
- Er wordt nu geen tweede project of tweede repository gestart.
- De oplossing blijft geschikt voor statische GitHub Pages-hosting.
- Financiele formules komen in pure TypeScript-domeinfuncties en niet rechtstreeks in grote React-componenten.
- Jaarafhankelijke fiscale aannames worden centraal en versieerbaar opgeslagen.
- Contractuele lasten en feitelijke kasstromen na een eventuele schenking blijven afzonderlijke begrippen.
- Toekomstige schenkingen worden niet behandeld als gegarandeerd inkomen of gegarandeerde leencapaciteit.
- Geen secrets of persoonsgegevens worden naar de repository geschreven.
- Geen server-side arbitrary code execution.
- Publieke Nederlandse teksten blijven begrijpelijk en terughoudend.

# Test and CI requirements

Huidige keten:

- `npm run generate:apps`
- `git diff --exit-code src/lib/app-registry.ts src/lib/app-components.tsx`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run check`

Toekomstige testcategorieen:

- pure unit tests voor `src/lib/mortgage/`
- pure unit tests voor `src/lib/family-financing/`
- grenswaarden: nulbedragen, nulrente, volledige aflossing, eigen geld groter dan aankoopbedrag
- DUO-regimes: `SF35`, `SF15`, `SF15_OLD`, `SF15_LLLK`, `UNKNOWN`
- DUO-situaties: aanloopfase, draagkrachtverlaging, betaalpauze, onbekend
- schenking versus lening
- periodieke schenking stopt
- buffercontrole
- dubbele financieringsbronnen voorkomen
- afronding en centcorrecties
- ongeldige invoer
- regressietests voor bestaande DUO-tools
- static export/buildtest

# Phased implementation plan

## Fase 0 — Baseline vastleggen

- Doel: bestaande werking vastleggen zonder productiegedrag te wijzigen.
- Exacte bestanden: `package.json`, `src/lib/app-registry.ts`, `src/lib/app-components.tsx`, bestaande DUO-apps en tests.
- Nieuw of gewijzigd: geen productiecode; eventueel nieuw baseline-notitiebestand alleen als gewenst.
- Afhankelijkheden: huidige groene CI.
- Tests: `npm run generate:apps`, `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Acceptatiecriteria: bestaande DUO-uitkomsten en publieke routes zijn vastgelegd.
- Rollbackstrategie: geen codewijziging, dus geen rollback nodig.
- Voorgestelde commitnaam: `chore: capture family financing baseline`

## Fase 1 — Gedeelde hypotheekrekenlaag

- Doel: algemene annuiteits- en contantewaardefuncties uit hypotheekimpact identificeren en herbruikbaar maken.
- Exacte bestanden: `apps/hypotheek-impact-studieschuld/logic.ts`, nieuwe `src/lib/mortgage/annuity.ts`, `src/lib/mortgage/present-value.ts`, `src/lib/mortgage/types.ts`, `src/lib/mortgage/index.ts`.
- Nieuw of gewijzigd: nieuwe mortgage-laag, bestaande app blijft façade.
- Afhankelijkheden: centrale financial constants.
- Tests: bestaande `apps/hypotheek-impact-studieschuld/logic.test.ts` plus nieuwe mortgage-unit-tests.
- Acceptatiecriteria: uitkomsten veranderen niet.
- Rollbackstrategie: verwijder nieuwe mortgage-imports en herstel lokale functies in app-façade.
- Voorgestelde commitnaam: `refactor: extract shared mortgage calculations`

## Fase 2 — Familiefinancieringscontracten

- Doel: pure TypeScript-types zonder UI en zonder hardcoded actuele fiscale waarden.
- Exacte bestanden: `src/lib/family-financing/types.ts`, `src/lib/family-financing/index.ts`.
- Nieuw of gewijzigd: nieuw.
- Afhankelijkheden: DUO-types en mortgage-types.
- Tests: type-level compile via `npm run typecheck`; eventueel kleine contract tests.
- Acceptatiecriteria: duidelijke scheiding tussen lening, schenking, eigen geld, bancaire hypotheek en DUO.
- Rollbackstrategie: verwijder nieuwe map zolang niets importeert.
- Voorgestelde commitnaam: `feat: add family financing domain contracts`

## Fase 3 — Familieleningengine

- Doel: maandtermijn, rente, aflossing, resterende schuld en kasstromen starter/ouders berekenen.
- Exacte bestanden: `src/lib/family-financing/family-loan.ts`, `src/lib/family-financing/types.ts`, `src/lib/family-financing/family-loan.test.ts`.
- Nieuw of gewijzigd: nieuw.
- Afhankelijkheden: `src/lib/mortgage/annuity.ts`.
- Tests: unit tests voor nulrente, annuiteit, lineair, aflossingsvrij, invalid input.
- Acceptatiecriteria: contractuele lasten en ouderkasstromen apart zichtbaar.
- Rollbackstrategie: verwijder family-loan module en exports.
- Voorgestelde commitnaam: `feat: add family loan calculation engine`

## Fase 4 — Schenkingsmodel

- Doel: eenmalige en periodieke schenkingen modelleren als afzonderlijke transactiestromen.
- Exacte bestanden: `src/lib/family-financing/gifts.ts`, `src/lib/financial-constants/gifts/`, tests.
- Nieuw of gewijzigd: nieuw.
- Afhankelijkheden: assumption metadata.
- Tests: eenmalig, periodiek, stopmoment, nulscenario, validatie.
- Acceptatiecriteria: geen automatische verrekening met rente of aflossing.
- Rollbackstrategie: verwijder gift module en exports.
- Voorgestelde commitnaam: `feat: add gift cashflow model`

## Fase 5 — Financieringsscenario's

- Doel: scenario's composeren zonder dubbeltelling.
- Exacte bestanden: `src/lib/family-financing/purchase-financing.ts`, `src/lib/family-financing/scenarios.ts`, `src/lib/family-financing/stress-tests.ts`, tests.
- Nieuw of gewijzigd: nieuw.
- Afhankelijkheden: DUO, mortgage, family-loan, gifts.
- Tests: bank + eigen geld + DUO, schenking eigen inbreng, schenking DUO-aflossing, familielening, lening plus schenking, schenken versus lenen, minimum-buffer, stop-schenking.
- Acceptatiecriteria: contractuele lasten en feitelijke kasstromen blijven gescheiden.
- Rollbackstrategie: verwijder scenario modules; onderliggende engines blijven staan.
- Voorgestelde commitnaam: `feat: add purchase financing scenarios`

## Fase 6 — Nieuwe compositietool

- Doel: nieuwe app `apps/familiehulp-eerste-woning/` toevoegen.
- Exacte bestanden: `apps/familiehulp-eerste-woning/app.json`, `Calculator.tsx`, `logic.ts`, `logic.test.ts`, eventueel `src/lib/profile-tool-mapping.ts`.
- Nieuw of gewijzigd: nieuw plus prefill-extensie.
- Afhankelijkheden: family-financing engine, DUO, mortgage, UI-components.
- Tests: app logic tests, registry generation, typecheck, lint, build.
- Acceptatiecriteria: bestaande DUO-calculators blijven afzonderlijk zichtbaar en bruikbaar.
- Rollbackstrategie: zet `visibility: "hidden"` of verwijder nieuwe app-map voordat deze afhankelijkheden breed gebruikt.
- Voorgestelde commitnaam: `feat: add first-home family financing tool`

## Fase 7 — Doelgroepgerichte homepage

- Doel: homepage sterker richten op koopstarters met studieschuld en familiehulp, zonder overige tools te verwijderen.
- Exacte bestanden: `src/components/AppDashboard.tsx`, `src/lib/audience-routes.ts`, eventueel `src/app/page.tsx`, `src/lib/tool-groups.ts`.
- Nieuw of gewijzigd: gewijzigd.
- Afhankelijkheden: nieuwe app publiek/beta.
- Tests: registry tests, audience route tests, build.
- Acceptatiecriteria: overige tools blijven beschikbaar onder overzicht zoals "Alle tools"; bestaande URLs wijzigen niet.
- Rollbackstrategie: herstel audience-route/dashboard-copy of zet nieuwe doelgroepsectie uit.
- Voorgestelde commitnaam: `feat: focus starter route on family financing`

# Risks and open product decisions

Belangrijkste risico's:

- DUO-formules worden per ongeluk gekopieerd in nieuwe modules.
- Familielening wordt behandeld als schenking of andersom.
- Toekomstige schenking wordt ten onrechte als gegarandeerde leencapaciteit getoond.
- Fiscale of juridische aannames worden zonder bron en validatie hardcoded.
- De hidden familiebank-artifact wordt per ongeluk als gevalideerde engine gebruikt.
- Nieuwe UI wordt te groot en mengt invoer, advies, berekening en uitleg.
- Static export wordt gebroken door serverafhankelijkheid.

Open productbeslissingen:

- Wordt de nieuwe tool primair educatief, of ook scenario-opslaggericht?
- Welke invoer hoort permanent in profiel en welke blijft scenario-only?
- Welke fiscale aannames mogen getoond worden voor validatie door fiscalist/notaris/hypotheekadviseur?
- Wordt familielening bruto/netto fiscaal doorgerekend of alleen contractueel en kasstroommatig?
- Hoe prominent moet de waarschuwing zijn dat toekomstige schenking niet gegarandeerd is?

# Exact files inspected

- `README.md`
- `PROJECT.md`
- `FUNCTIONALITY_STATUS.md`
- `package.json`
- `next.config.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
- `scripts/generate-app-registry.mjs`
- `src/app/page.tsx`
- `src/app/apps/[slug]/page.tsx`
- `src/components/AppDashboard.tsx`
- `src/components/AppRenderer.tsx`
- `src/components/AppCard.tsx`
- `src/components/tool/CalculatorShell.tsx`
- `src/components/ToolDisclosure.tsx`
- `src/components/DisclosureSection.tsx`
- `src/components/MobileFieldFlowControls.tsx`
- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/lib/app-types.ts`
- `src/lib/app-registry.ts`
- `src/lib/app-components.tsx`
- `src/lib/app-registry.test.ts`
- `src/lib/audience-routes.ts`
- `src/lib/audience-routes.test.ts`
- `src/lib/user-profile.ts`
- `src/lib/profile-prefill.ts`
- `src/lib/profile-prefill.test.ts`
- `src/lib/profile-tool-mapping.ts`
- `src/lib/profile-tool-mapping.test.ts`
- `src/lib/storage/storage-mode.ts`
- `src/lib/storage/storage-mode.test.ts`
- `src/lib/financial-constants/index.ts`
- `src/lib/financial-constants/types.ts`
- `src/lib/financial-constants/years.ts`
- `src/lib/financial-constants/index.test.ts`
- `src/lib/duo/index.ts`
- `src/lib/duo/types.ts`
- `src/lib/duo/calculations.ts`
- `src/lib/duo/calculations.test.ts`
- `src/lib/tax/index.ts`
- `src/lib/tax/types.ts`
- `src/lib/tax/box1.ts`
- `src/lib/tax/box3.ts`
- `src/lib/tax/mortgage-interest-deduction.ts`
- `src/lib/planning/debt-priority.ts`
- `src/lib/planning/buy-vs-rent.ts`
- `apps/studieschuld-vs-beleggen/app.json`
- `apps/studieschuld-vs-beleggen/Calculator.tsx`
- `apps/studieschuld-vs-beleggen/logic.ts`
- `apps/studieschuld-vs-beleggen/logic.test.ts`
- `apps/hypotheek-impact-studieschuld/app.json`
- `apps/hypotheek-impact-studieschuld/Calculator.tsx`
- `apps/hypotheek-impact-studieschuld/logic.ts`
- `apps/hypotheek-impact-studieschuld/logic.test.ts`
- `apps/artifact-hypotheek-wonen-familiebank-hypotheek/app.json`
- `apps/artifact-hypotheek-wonen-familiebank-hypotheek/Calculator.tsx`
- `apps/artifact-hypotheek-wonen-familiebank-hypotheek/logic.ts`
- `apps/artifact-hypotheek-wonen-familiebank-hypotheek/logic.test.ts`

# CHATGPT_HANDOFF

--- START CHATGPT_HANDOFF ---
Branch `main`, commit `6749bd55c24c9c24ad318c85f0a55b43f1d735c2`. Repo is a Next.js 16 / React 19 / TypeScript 5 app with calculators under `apps/<slug>/`. Apps are discovered by `scripts/generate-app-registry.mjs`, which validates `app.json` and generates `src/lib/app-registry.ts` and `src/lib/app-components.tsx`. Routes are static via `src/app/apps/[slug]/page.tsx`; calculators lazy-load through `AppRenderer` and `next/dynamic`. GitHub Actions builds a static export with `output: "export"` and repo-derived `basePath`.

Existing DUO architecture: `src/lib/duo/` is the central DUO domain layer. Public exports include `calculateStatutoryDuoMonthlyPayment`, `calculateIndicativeIncomeBasedMonthlyPayment`, `determineRelevantDuoPayment`, `calculateDuoMonthlyPaymentAfterExtraRepayment`, `calculateExtraRepaymentPayoffImpact`, `calculateExtraRepaymentVsInvesting`, `calculatePayoffDate`, `calculateRemainingMonthsToPayOff`, `sanitizeDuoMoney`, `sanitizeDuoPercent`. Regimes are `SF35`, `SF15`, `SF15_OLD`, `SF15_LLLK`, `UNKNOWN`. Situations are `repaying`, `gracePeriod`, `incomeBasedReduction`, `paymentPause`, `unknown`. Future code must import this layer; do not copy DUO formulas.

Existing public DUO tools: `apps/studieschuld-vs-beleggen/`, `apps/hypotheek-impact-studieschuld/`, `apps/schulden-volgorde/`. Public URLs must keep working. `studieschuld-vs-beleggen` uses central DUO and tax functions. `hypotheek-impact-studieschuld` wraps central DUO with mortgage-specific brutering and present-value calculations. `schulden-volgorde` uses planning/debt-priority logic and is reference material, not a DUO formula source.

Mortgage-impact architecture: `apps/hypotheek-impact-studieschuld/logic.ts` contains reusable candidates `calculateAnnuityPayment`, `calculatePresentValueFromMonthlyPayment`, `getBruteringFactor`, `calculateMortgageImpact`, `calculateExtraRepaymentScenario`, `calculateHypotheekImpact`. Extract general mortgage math later to `src/lib/mortgage/` while keeping the app as a backward-compatible facade. Outcomes must not change in that extraction.

Profile/prefill/storage: `src/lib/user-profile.ts` defines income, studentDebt, housing, savingInvesting and tax sections with sanitization. `src/lib/profile-prefill.ts` provides prefill helpers. `src/lib/profile-tool-mapping.ts` maps profile values into tool form defaults. Storage is local-first through `src/lib/storage/`, with `local | hybrid | remote` modes; hybrid/remote are prepared but not active as required runtime. Static hosting remains viable.

Reusable UI: use `src/components/tool/CalculatorShell.tsx`, `ToolDisclosure.tsx`, `DisclosureSection.tsx`, `MobileFieldFlowControls.tsx`, `ResultRow.tsx`, `ResultCard.tsx`, chart components, `AppDashboard`, `AppRenderer`, and `ui.tsx`. Keep financial formulas in pure TypeScript domain functions, not in large React components.

Family-bank artifact status: `apps/artifact-hypotheek-wonen-familiebank-hypotheek/` is not a validated family-bank engine. Its manifest is `status: "draft"` and `visibility: "hidden"`. Its `logic.ts` uses `TOOL_PROFILE = "generic_contract"` and calls generic artifact runtime. Its tests only check fixture execution, empty input rejection and non-finite safety. Keep hidden/draft until real domain logic exists.

Recommended new files: `src/lib/mortgage/annuity.ts`, `src/lib/mortgage/present-value.ts`, `src/lib/mortgage/affordability.ts`, `src/lib/mortgage/types.ts`, `src/lib/mortgage/index.ts`, `src/lib/family-financing/family-loan.ts`, `src/lib/family-financing/gifts.ts`, `src/lib/family-financing/purchase-financing.ts`, `src/lib/family-financing/scenarios.ts`, `src/lib/family-financing/stress-tests.ts`, `src/lib/family-financing/types.ts`, `src/lib/family-financing/index.ts`, `src/lib/financial-constants/gifts/`, and `apps/familiehulp-eerste-woning/`.

Proposed contracts: `FamilyLoanInput`, `GiftInput`, `PurchaseFinancingInput`, `FinancingScenario`, `FinancingScenarioResult`, `HouseholdCashflow`, `ParentCashflowSummary`, `StressTestResult`, `AssumptionMetadata`. They should separate gift, family loan, bank mortgage, own funds, DUO debt, contractual payments, factual cashflow, financeability, affordability, buffer and stress cases.

Backward-compatibility requirements: existing DUO tools stay independent; existing public DUO URLs stay; `src/lib/duo/` remains the only source for DUO formulas; no second repo/project; static GitHub Pages compatibility; no secrets or personal data in repo; yearly assumptions are centralized and versioned; contractual obligations and actual cashflows after gifts remain separate; future gifts are not guaranteed income or borrowing capacity.

Implementation plan: Fase 0 baseline checks and route/output capture; Fase 1 extract mortgage math with facade and unchanged outputs; Fase 2 add family-financing types only; Fase 3 add family loan engine; Fase 4 add gift model; Fase 5 add financing scenarios and stress tests; Fase 6 add `apps/familiehulp-eerste-woning/` using existing DUO engine and UI components; Fase 7 update homepage/audience route for starters while keeping all tools accessible.

Recommended first code change: Fase 0, run and record `npm run generate:apps`, `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`, and capture current outputs/routes for `studieschuld-vs-beleggen`, `hypotheek-impact-studieschuld`, and `schulden-volgorde` before extracting anything.
--- END CHATGPT_HANDOFF ---
