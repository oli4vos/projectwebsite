import type { SourceReference } from "@/lib/financial-constants";
import type { AllowanceKind, AllowanceMissingField } from "@/lib/allowances/signaling";
import type { ReasonCode } from "@/lib/regulations/types";

export type AllowanceAdvisorIntakeStepId =
  | "calculation-year"
  | "age"
  | "residence-and-insurance"
  | "household"
  | "allowance-partner"
  | "children"
  | "housing-and-rent"
  | "income"
  | "assets"
  | "childcare";

export type AllowanceAdvisorIntakeStep = {
  readonly stepId: AllowanceAdvisorIntakeStepId;
  readonly title: string;
  readonly purpose: string;
  readonly fields: readonly AllowanceMissingField[];
  readonly primaryAllowanceKinds: readonly AllowanceKind[];
  readonly progressiveDisclosure: readonly string[];
};

export type AllowanceUnknownTopic =
  | "allowance-partner"
  | "assessment-income"
  | "assets"
  | "housing-type"
  | "independent-home"
  | "basic-rent"
  | "service-costs-calculation-rent"
  | "co-residents"
  | "childcare-registration"
  | "childcare-hours"
  | "childcare-hourly-rate";

export type AllowanceUnknownResolutionDesign = {
  readonly topic: AllowanceUnknownTopic;
  readonly fieldIds: readonly AllowanceMissingField[];
  readonly alternativeQuestions: readonly string[];
  readonly order: readonly string[];
  readonly whyNeeded: string;
  readonly whereToFind: readonly string[];
  readonly safeInference: readonly string[];
  readonly confirmationRequired: boolean;
  readonly blocking: "never" | "until-alternative-known" | "blocks-amount-only" | "blocks-result";
  readonly unresolvedOutcome: string;
};

export type AllowanceAdvisorResultStatus =
  | "likely-eligible-with-indication"
  | "likely-not-eligible"
  | "not-determinable-yet"
  | "special-situation";

export type AllowanceAdvisorReliabilityLabel =
  | "sterke-indicatie"
  | "redelijke-indicatie"
  | "voorlopige-indicatie";

export type AllowanceAdvisorAmountIndication = {
  readonly monthlyAmountLabel: string;
  readonly yearlyAmountLabel: string;
  readonly periodLabel: string;
  readonly estimateRangeRequired: true;
  readonly sourceYearRequired: true;
};

export type AllowanceAdvisorResultModel = {
  readonly status: AllowanceAdvisorResultStatus;
  readonly title: string;
  readonly amountIndicationAllowed: boolean;
  readonly amountIndication?: AllowanceAdvisorAmountIndication;
  readonly requiredSections: readonly (
    | "main-reasons"
    | "decisive-inputs"
    | "inferred-inputs"
    | "missing-inputs"
    | "warnings"
    | "official-sources"
    | "reliability"
  )[];
};

export type AllowanceAdvisorExplanationPattern = {
  readonly inlineExplanation: string;
  readonly expandedExplanation: string;
  readonly example: string;
  readonly whereToFind: readonly string[];
  readonly officialSources: readonly string[];
};

export type AllowanceAdvisorApplicationGuidance = {
  readonly allowanceKind: AllowanceKind;
  readonly checkBeforeApplying: readonly string[];
  readonly requiredDataOrDocuments: readonly string[];
  readonly selfApplicationNeeded: "usually" | "only-when-changing" | "unknown";
  readonly steps: readonly string[];
  readonly changeWarnings: readonly string[];
  readonly primaryCta: {
    readonly label: string;
    readonly target: "mijn-toeslagen";
  };
};

export type AllowanceAdvisorReportLine = {
  readonly label: string;
  readonly value: string;
  readonly inputState?: "answered" | "inferred" | "pending-confirmation" | "missing";
  readonly sourceFieldId?: AllowanceMissingField;
  readonly reasonCodes: readonly ReasonCode[];
};

export type AllowanceAdvisorReportResult = {
  readonly allowanceKind: AllowanceKind;
  readonly status: AllowanceAdvisorResultStatus;
  readonly reliability: AllowanceAdvisorReliabilityLabel;
  readonly monthlyAmountLabel?: string;
  readonly yearlyAmountLabel?: string;
  readonly calculationYear: number;
  readonly reasons: readonly AllowanceAdvisorReportLine[];
  readonly answeredInputs: readonly AllowanceAdvisorReportLine[];
  readonly inferredInputs: readonly AllowanceAdvisorReportLine[];
  readonly missingInputs: readonly AllowanceAdvisorReportLine[];
  readonly warnings: readonly AllowanceAdvisorReportLine[];
  readonly applicationSteps: readonly string[];
  readonly officialSources: readonly SourceReference[];
};

export type AllowanceAdvisorReportModel = {
  readonly title: "Toeslagenadvies";
  readonly generatedAt: string;
  readonly calculationYear: number;
  readonly summary: readonly string[];
  readonly results: readonly AllowanceAdvisorReportResult[];
  readonly answeredInputs: readonly AllowanceAdvisorReportLine[];
  readonly inferredInputs: readonly AllowanceAdvisorReportLine[];
  readonly missingInputs: readonly AllowanceAdvisorReportLine[];
  readonly officialSources: readonly SourceReference[];
  readonly disclaimer: string;
};

export const ALLOWANCE_ADVISOR_INTAKE_STEPS: readonly AllowanceAdvisorIntakeStep[] = [
  {
    stepId: "calculation-year",
    title: "Berekeningsjaar",
    purpose: "Bepaalt welke bronset, periode en regels zichtbaar mogen worden.",
    fields: ["year"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget", "childcare"],
    progressiveDisclosure: ["Toon standaard het actuele ondersteunde jaar en leg uit wanneer een ander jaar nodig is."],
  },
  {
    stepId: "age",
    title: "Leeftijd",
    purpose: "Nodig voor leeftijdsvoorwaarden en kindgerelateerde beoordeling.",
    fields: ["age", "children.childAges"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget", "childcare"],
    progressiveDisclosure: ["Vraag leeftijden van kinderen pas wanneer de gebruiker kinderen heeft of kindinformatie deels bekend is."],
  },
  {
    stepId: "residence-and-insurance",
    title: "Woonland en verzekering",
    purpose: "Controleert of Nederlandse verzekering, woonland of verblijfssituatie de uitkomst onzeker maakt.",
    fields: ["healthcare.hasDutchHealthInsurance"],
    primaryAllowanceKinds: ["healthcare"],
    progressiveDisclosure: ["Toon verblijfs- en buitenlanddetails alleen bij twijfel of bijzondere situatie."],
  },
  {
    stepId: "household",
    title: "Huishouden",
    purpose: "Bepaalt welke personen meetellen voor inkomen, vermogen, huur en kinderen.",
    fields: ["partnerStatus", "rent.hasCoResidents", "children.hasChildren"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget", "childcare"],
    progressiveDisclosure: ["Vraag partner-, medebewoner- en kinddetails pas wanneer die route relevant is."],
  },
  {
    stepId: "allowance-partner",
    title: "Toeslagpartner",
    purpose: "Bepaalt of gezamenlijk inkomen, vermogen en opvangactiviteit nodig zijn.",
    fields: ["partnerStatus", "jointAssessmentIncome", "jointAssets", "childcare.partnerHasQualifyingActivity"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget", "childcare"],
    progressiveDisclosure: ["Open gezamenlijke inkomens- en vermogensvragen alleen bij partner of partneronzekerheid."],
  },
  {
    stepId: "children",
    title: "Kinderen",
    purpose: "Bepaalt kindgebonden budget en kinderopvangroute.",
    fields: ["children.hasChildren", "children.childAges", "children.receivesChildBenefit", "children.childLivesWithApplicant"],
    primaryAllowanceKinds: ["child-budget", "childcare"],
    progressiveDisclosure: ["Vraag kinderbijslag en verblijfplaats pas wanneer kinderen relevant zijn."],
  },
  {
    stepId: "housing-and-rent",
    title: "Woning en huur",
    purpose: "Bepaalt of huurtoeslag beoordeelbaar is.",
    fields: ["rent.tenure", "rent.independentHome", "rent.basicRent", "rent.hasCoResidents"],
    primaryAllowanceKinds: ["rent"],
    progressiveDisclosure: ["Toon huurdetails alleen bij huurwoning; medebewonersdetails alleen bij medebewoners."],
  },
  {
    stepId: "income",
    title: "Inkomen",
    purpose: "Bepaalt toetsingsinkomen voor signalering en latere bedragindicatie.",
    fields: ["assessmentIncome", "jointAssessmentIncome", "householdIncome"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget", "childcare"],
    progressiveDisclosure: ["Vraag gezamenlijk of huishoudinkomen alleen wanneer partner of medebewoners relevant zijn."],
  },
  {
    stepId: "assets",
    title: "Vermogen",
    purpose: "Bepaalt of vermogen een harde of waarschuwende factor kan zijn.",
    fields: ["assets", "jointAssets", "householdAssets"],
    primaryAllowanceKinds: ["healthcare", "rent", "child-budget"],
    progressiveDisclosure: ["Vraag gezamenlijke en huishoudelijke vermogens pas wanneer die personen meetellen."],
  },
  {
    stepId: "childcare",
    title: "Kinderopvang",
    purpose: "Bepaalt of kinderopvangtoeslag beoordeelbaar is en welke opvanggegevens nodig zijn.",
    fields: [
      "childcare.usesChildcare",
      "childcare.registeredChildcare",
      "childcare.paysOwnContribution",
      "childcare.childLivesWithApplicant",
      "childcare.applicantHasQualifyingActivity",
      "childcare.partnerHasQualifyingActivity",
      "childcare.hoursPerMonth",
    ],
    primaryAllowanceKinds: ["childcare"],
    progressiveDisclosure: ["Toon opvangdetails alleen bij betaalde opvang en kindroute."],
  },
];

export const ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX: readonly AllowanceUnknownResolutionDesign[] = [
  {
    topic: "allowance-partner",
    fieldIds: ["partnerStatus"],
    alternativeQuestions: [
      "Ben je getrouwd of geregistreerd partner?",
      "Staat iemand anders op jouw adres ingeschreven met wie je samen een kind, woning of pensioenregeling hebt?",
      "Had je maar een deel van het jaar een partner?",
    ],
    order: ["huwelijk/registratie", "gezamenlijk kind of woning", "zelfde adres", "deeljaar"],
    whyNeeded: "Een toeslagpartner kan inkomen, vermogen en opvangactiviteit laten meetellen.",
    whereToFind: ["Mijn Toeslagen", "Basisregistratie Personen", "huur- of koopcontract", "jaaropgaven van partner"],
    safeInference: ["Geen partneractiviteit is niet van toepassing wanneer partnerStatus expliciet nee is."],
    confirmationRequired: true,
    blocking: "until-alternative-known",
    unresolvedOutcome: "Toon voorlopige indicatie zonder gezamenlijke bedragconclusie en verwijs naar Mijn Toeslagen.",
  },
  {
    topic: "assessment-income",
    fieldIds: ["assessmentIncome", "jointAssessmentIncome", "householdIncome"],
    alternativeQuestions: [
      "Weet je je bruto jaarinkomen ongeveer?",
      "Is je inkomen dit jaar vergelijkbaar met vorig jaar?",
      "Heb je een recente loonstrook of uitkeringsspecificatie?",
      "Wil je een bandbreedte invoeren in plaats van een exact bedrag?",
    ],
    order: ["exact toetsingsinkomen", "jaarschatting", "bandbreedte", "vorig jaar als indicatie"],
    whyNeeded: "Toeslagen hangen sterk af van het toetsingsinkomen in het berekeningsjaar.",
    whereToFind: ["Mijn Toeslagen", "aangifte inkomstenbelasting", "jaaropgave", "loonstrook", "uitkeringsspecificatie"],
    safeInference: ["Vorig jaar mag alleen als voorlopige schatting met bevestiging en lage betrouwbaarheid."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Toon signalering en aanvraagstappen, maar geen euro-indicatie.",
  },
  {
    topic: "assets",
    fieldIds: ["assets", "jointAssets", "householdAssets"],
    alternativeQuestions: [
      "Weet je het saldo op 1 januari ongeveer?",
      "Had je spaargeld, beleggingen of een tweede woning?",
      "Weet je of het vermogen duidelijk laag of mogelijk hoog was?",
    ],
    order: ["saldo 1 januari", "ruwe bandbreedte", "duidelijk laag/hoog", "onbekend"],
    whyNeeded: "Vermogen kan toeslagen beperken of officiële controle nodig maken.",
    whereToFind: ["bankafschriften rond 1 januari", "beleggingsrekening", "belastingaangifte", "Mijn Toeslagen"],
    safeInference: ["Geen automatische inference uit maandinkomen; alleen gebruikerbevestigde bandbreedte."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Toon waarschuwing dat euro-indicatie niet betrouwbaar is zonder vermogenscontrole.",
  },
  {
    topic: "housing-type",
    fieldIds: ["rent.tenure"],
    alternativeQuestions: ["Betaal je huur aan een verhuurder?", "Heb je een koopwoning?", "Woon je in bij iemand anders?"],
    order: ["huur", "koop", "inwonend/anders", "onbekend"],
    whyNeeded: "Huurtoeslag is alleen relevant bij een huurroute; andere toeslagen kunnen wel doorgaan.",
    whereToFind: ["huurcontract", "koopakte", "Mijn Toeslagen"],
    safeInference: ["Koopwoning mag huurvragen overslaan na expliciete keuze."],
    confirmationRequired: false,
    blocking: "until-alternative-known",
    unresolvedOutcome: "Laat huurtoeslag als nog niet te bepalen zien en ga door met andere toeslagen.",
  },
  {
    topic: "independent-home",
    fieldIds: ["rent.independentHome"],
    alternativeQuestions: ["Heb je een eigen voordeur?", "Heb je eigen keuken en toilet?", "Deel je essentiële voorzieningen?"],
    order: ["eigen voordeur", "eigen voorzieningen", "gedeeld", "onbekend"],
    whyNeeded: "Zelfstandige woonruimte is beslissend voor huurtoeslag.",
    whereToFind: ["huurcontract", "omschrijving van de woning", "verhuurder"],
    safeInference: ["Alleen infereren wanneer gebruiker eigen voordeur, keuken en toilet bevestigt."],
    confirmationRequired: true,
    blocking: "blocks-result",
    unresolvedOutcome: "Huurtoeslag blijft bijzondere situatie met officiële controle.",
  },
  {
    topic: "basic-rent",
    fieldIds: ["rent.basicRent"],
    alternativeQuestions: ["Wat is je kale huur zonder servicekosten?", "Weet je je totale huur en servicekosten apart?", "Kun je de huur op je contract vinden?"],
    order: ["kale huur", "totale huur met uitsplitsing", "contract controleren", "onbekend"],
    whyNeeded: "Kale huur is nodig voor de latere rekenhuur en euro-indicatie.",
    whereToFind: ["huurcontract", "huurverhogingsbrief", "betaalspecificatie verhuurder"],
    safeInference: ["Niet afleiden uit totale huur zonder bevestigde uitsplitsing."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Geen euro-indicatie voor huurtoeslag; wel uitleg en aanvraagchecklist.",
  },
  {
    topic: "service-costs-calculation-rent",
    fieldIds: ["rent.basicRent"],
    alternativeQuestions: ["Staan servicekosten apart op je huurcontract?", "Zijn er subsidiabele servicekosten?", "Weet je alleen je totaalhuur?"],
    order: ["subsidiabele servicekosten", "geen servicekosten", "alleen totaalhuur", "onbekend"],
    whyNeeded: "Rekenhuur kan afwijken van kale huur wanneer subsidiabele servicekosten meetellen.",
    whereToFind: ["huurcontract", "servicekostenspecificatie", "verhuurder"],
    safeInference: ["Geen servicekosten alleen na expliciete bevestiging."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Toon voorlopige indicatie zonder huurtoeslagbedrag of met brede bandbreedte zodra rekenregels bestaan.",
  },
  {
    topic: "co-residents",
    fieldIds: ["rent.hasCoResidents", "householdIncome", "householdAssets"],
    alternativeQuestions: ["Staan er andere volwassenen op jouw adres ingeschreven?", "Zijn dit medebewoners of onderhuurders?", "Weet je hun inkomen en vermogen?"],
    order: ["wel/geen medebewoners", "type medebewoner", "inkomen", "vermogen"],
    whyNeeded: "Medebewoners kunnen meetellen voor huurtoeslag.",
    whereToFind: ["BRP-inschrijving", "Mijn Toeslagen", "afspraken met medebewoners"],
    safeInference: ["Geen medebewoners alleen na expliciete bevestiging."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Huurtoeslag blijft nog niet te bepalen; andere toeslagen gaan door.",
  },
  {
    topic: "childcare-registration",
    fieldIds: ["childcare.registeredChildcare"],
    alternativeQuestions: ["Heeft de opvang een LRK-nummer?", "Staat het LRK-nummer op contract of factuur?", "Is het gastouderbureau geregistreerd?"],
    order: ["LRK-nummer", "contract/factuur", "gastouderbureau", "onbekend"],
    whyNeeded: "Registratie is beslissend voor kinderopvangtoeslag.",
    whereToFind: ["opvangcontract", "factuur", "Landelijk Register Kinderopvang", "Mijn Toeslagen"],
    safeInference: ["Niet infereren zonder LRK-bevestiging."],
    confirmationRequired: true,
    blocking: "blocks-result",
    unresolvedOutcome: "Kinderopvangtoeslag wordt bijzondere situatie met officiële controle.",
  },
  {
    topic: "childcare-hours",
    fieldIds: ["childcare.hoursPerMonth"],
    alternativeQuestions: ["Hoeveel uur staat op je contract?", "Hoeveel uur staat op je laatste factuur?", "Verschilt het aantal uren per maand?"],
    order: ["contracturen", "factuururen", "gemiddelde", "variabel/onbekend"],
    whyNeeded: "Opvanguren zijn nodig voor een maand- en jaarindicatie.",
    whereToFind: ["opvangcontract", "maandfactuur", "ouderportaal"],
    safeInference: ["Gemiddelde alleen na bevestiging van gebruiker en zichtbaar als voorlopige invoer."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Geen euro-indicatie voor kinderopvang; toon documentenlijst en aanvraagstappen.",
  },
  {
    topic: "childcare-hourly-rate",
    fieldIds: ["childcare.hoursPerMonth"],
    alternativeQuestions: ["Wat is het uurtarief op je factuur?", "Betaal je een vast maandbedrag met vermeld aantal uren?", "Gaat het om dagopvang, BSO of gastouderopvang?"],
    order: ["uurtarief", "maandbedrag en uren", "opvangsoort", "onbekend"],
    whyNeeded: "Uurtarief is nodig voor een latere verantwoorde kinderopvangindicatie.",
    whereToFind: ["factuur", "opvangcontract", "ouderportaal"],
    safeInference: ["Uurtarief mag alleen uit maandbedrag gedeeld door uren worden afgeleid na expliciete bevestiging."],
    confirmationRequired: true,
    blocking: "blocks-amount-only",
    unresolvedOutcome: "Geen euro-indicatie voor kinderopvang; toon aanvraagcheck en officiële controle.",
  },
];

export const ALLOWANCE_ADVISOR_RESULT_MODELS: readonly AllowanceAdvisorResultModel[] = [
  {
    status: "likely-eligible-with-indication",
    title: "Waarschijnlijk mogelijk recht met euro-indicatie",
    amountIndicationAllowed: true,
    amountIndication: {
      monthlyAmountLabel: "Indicatie per maand",
      yearlyAmountLabel: "Indicatie per jaar",
      periodLabel: "Berekeningsjaar/periode",
      estimateRangeRequired: true,
      sourceYearRequired: true,
    },
    requiredSections: ["main-reasons", "decisive-inputs", "inferred-inputs", "warnings", "official-sources", "reliability"],
  },
  {
    status: "likely-not-eligible",
    title: "Waarschijnlijk niet van toepassing",
    amountIndicationAllowed: false,
    requiredSections: ["main-reasons", "decisive-inputs", "warnings", "official-sources", "reliability"],
  },
  {
    status: "not-determinable-yet",
    title: "Nog niet te bepalen",
    amountIndicationAllowed: false,
    requiredSections: ["missing-inputs", "main-reasons", "warnings", "official-sources", "reliability"],
  },
  {
    status: "special-situation",
    title: "Bijzondere situatie",
    amountIndicationAllowed: false,
    requiredSections: ["main-reasons", "decisive-inputs", "missing-inputs", "warnings", "official-sources", "reliability"],
  },
];

export const ALLOWANCE_ADVISOR_EXPLANATION_PATTERN: AllowanceAdvisorExplanationPattern = {
  inlineExplanation: "Een korte uitleg direct bij de vraag, in gewone taal en zonder juridische claim.",
  expandedExplanation: "Een uitklapbare uitleg met definitie, uitzonderingen, wat meetelt en wat niet meetelt.",
  example: "Een concreet voorbeeld met fictieve situatie, zonder bedrag wanneer bedragen nog niet gemodelleerd zijn.",
  whereToFind: ["Mijn Toeslagen", "belastingaangifte", "contract/factuur", "bank- of looninformatie"],
  officialSources: ["Dienst Toeslagen of Belastingdienst-bron onderaan de uitleg"],
};

export const ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE: readonly AllowanceAdvisorApplicationGuidance[] = [
  {
    allowanceKind: "healthcare",
    checkBeforeApplying: ["Nederlandse zorgverzekering", "toetsingsinkomen", "partnerstatus", "vermogen"],
    requiredDataOrDocuments: ["DigiD", "zorgpolis", "jaarinkomen of jaaropgave", "vermogen op 1 januari"],
    selfApplicationNeeded: "usually",
    steps: ["Controleer de invoer", "Open Mijn Toeslagen", "Vraag zorgtoeslag aan of wijzig bestaande gegevens", "Controleer de beschikking"],
    changeWarnings: ["inkomen", "partner", "vermogen", "verzekering"],
    primaryCta: { label: "Open Mijn Toeslagen", target: "mijn-toeslagen" },
  },
  {
    allowanceKind: "rent",
    checkBeforeApplying: ["huurwoning", "zelfstandige woonruimte", "kale huur/rekenhuur", "medebewoners", "inkomen", "vermogen"],
    requiredDataOrDocuments: ["DigiD", "huurcontract", "huur- of servicekostenspecificatie", "inkomensgegevens", "vermogensgegevens"],
    selfApplicationNeeded: "usually",
    steps: ["Controleer woninggegevens", "Controleer huur en servicekosten", "Open Mijn Toeslagen", "Vraag huurtoeslag aan of wijzig huurgegevens"],
    changeWarnings: ["huur", "medebewoners", "inkomen", "vermogen", "verhuizing"],
    primaryCta: { label: "Open Mijn Toeslagen", target: "mijn-toeslagen" },
  },
  {
    allowanceKind: "child-budget",
    checkBeforeApplying: ["kinderen", "kinderbijslag", "woonadres kind", "partnerstatus", "inkomen", "vermogen"],
    requiredDataOrDocuments: ["DigiD", "gegevens kinderen", "kinderbijslagstatus", "inkomensgegevens", "vermogensgegevens"],
    selfApplicationNeeded: "unknown",
    steps: ["Controleer kind- en huishoudgegevens", "Controleer of aanvragen of wijzigen nodig is", "Open Mijn Toeslagen", "Controleer de beschikking"],
    changeWarnings: ["geboorte", "verhuizing kind", "inkomen", "partner", "vermogen"],
    primaryCta: { label: "Open Mijn Toeslagen", target: "mijn-toeslagen" },
  },
  {
    allowanceKind: "childcare",
    checkBeforeApplying: ["LRK-registratie", "opvanguren", "uurtarief", "eigen bijdrage", "activiteit aanvrager en partner"],
    requiredDataOrDocuments: ["DigiD", "opvangcontract", "factuur", "LRK-nummer", "werk/studie/trajectgegevens"],
    selfApplicationNeeded: "usually",
    steps: ["Controleer opvangcontract", "Controleer uren en tarief", "Open Mijn Toeslagen", "Vraag kinderopvangtoeslag aan of wijzig opvanggegevens"],
    changeWarnings: ["opvanguren", "uurtarief", "opvangsoort", "werk/studie", "partner", "inkomen"],
    primaryCta: { label: "Open Mijn Toeslagen", target: "mijn-toeslagen" },
  },
];
