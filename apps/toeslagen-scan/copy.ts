import type {
  AllowanceKind,
  AllowanceMissingField,
  AllowanceReasonCode,
  AllowanceSignalStatus,
  AllowanceUncertaintyCode,
} from "@/lib/allowances/signaling";

export const allowanceTitles: Record<AllowanceKind, string> = {
  healthcare: "Zorgtoeslag",
  rent: "Huurtoeslag",
  "child-budget": "Kindgebonden budget",
  childcare: "Kinderopvangtoeslag",
};

export const statusLabels: Record<AllowanceSignalStatus, string> = {
  possible: "Mogelijk relevant",
  "probably-not": "Waarschijnlijk niet van toepassing",
  "insufficient-information": "Onvoldoende informatie",
  "official-calculation-recommended": "Officiële proefberekening aanbevolen",
};

export const statusSummaries: Record<AllowanceSignalStatus, string> = {
  possible:
    "Op basis van je antwoorden kan deze toeslag relevant zijn. Controleer het bedrag en de definitieve voorwaarden met de officiële proefberekening.",
  "probably-not":
    "Op basis van een harde voorwaarde lijkt deze toeslag niet van toepassing.",
  "insufficient-information":
    "Er ontbreken gegevens om een betrouwbaar signaal te geven.",
  "official-calculation-recommended":
    "Deze situatie bevat aanvullende regels of uitzonderingen. Gebruik de officiële proefberekening.",
};

export const reasonCodeCopy: Record<AllowanceReasonCode, string> = {
  "missing-age": "Je leeftijd ontbreekt nog.",
  "missing-partner-status": "Je toeslagpartnerstatus is nog onbekend.",
  "missing-income": "Je geschatte toetsingsinkomen ontbreekt nog.",
  "missing-joint-income": "Het gezamenlijke geschatte toetsingsinkomen ontbreekt nog.",
  "missing-assets": "Je vermogen op 1 januari ontbreekt nog.",
  "missing-joint-assets": "Het gezamenlijke vermogen op 1 januari ontbreekt nog.",
  "missing-household-income": "Het inkomen van het huurtoeslaghuishouden ontbreekt nog.",
  "missing-household-assets": "Het vermogen van het huurtoeslaghuishouden ontbreekt nog.",
  "missing-child-ages": "De leeftijd van het kind of de kinderen ontbreekt nog.",
  "invalid-rule-year": "De scan kan alleen de 2026-signaalregels gebruiken.",
  "invalid-negative-input": "Een ingevulde waarde kan niet negatief zijn.",
  "invalid-non-finite-input": "Een ingevulde waarde is geen bruikbaar getal.",
  "complex-exception": "Je situatie bevat mogelijk een uitzondering.",
  "official-calculation-required": "De officiële proefberekening is nodig voor een betrouwbaar vervolg.",
  "healthcare-under-minimum-age": "Zorgtoeslag is normaal pas vanaf 18 jaar relevant.",
  "healthcare-no-dutch-insurance": "Zonder Nederlandse zorgverzekering is zorgtoeslag normaal niet van toepassing.",
  "healthcare-missing-insurance": "Het is nog onbekend of je een Nederlandse zorgverzekering hebt.",
  "healthcare-income-above-limit": "Het ingevulde inkomen ligt boven een harde zorgtoeslaggrens.",
  "healthcare-assets-above-limit": "Het ingevulde vermogen ligt boven een harde zorgtoeslaggrens.",
  "healthcare-possible": "De bekende harde zorgtoeslagvoorwaarden sluiten dit signaal niet uit.",
  "rent-missing-tenure": "Je woonsituatie ontbreekt nog.",
  "rent-missing-independent-home": "Het is nog onbekend of je huurwoning zelfstandig is.",
  "rent-missing-basic-rent": "De kale huur per maand ontbreekt nog.",
  "rent-missing-co-residents": "Het is nog onbekend of er medebewoners zijn.",
  "rent-not-renting": "Huurtoeslag is normaal niet van toepassing bij koop of geen huurwoning.",
  "rent-not-independent-home": "Huurtoeslag vraagt normaal om een zelfstandige woonruimte.",
  "rent-assets-above-limit": "Het ingevulde vermogen ligt boven een harde huurtoeslaggrens.",
  "rent-household-complex": "Medebewoners of bijzondere woonsituaties maken de huurtoeslagbeoordeling complexer.",
  "rent-subsidiable-rent-uncertain": "Het is onzeker welke huurcomponenten voor de officiële berekening meetellen.",
  "rent-possible": "De bekende harde huurtoeslagvoorwaarden sluiten dit signaal niet uit.",
  "child-budget-missing-children": "Het is nog onbekend of je kinderen hebt.",
  "child-budget-missing-child-benefit": "De kinderbijslagstatus ontbreekt nog.",
  "child-budget-missing-child-residence": "Het is nog onbekend of het kind bij jou woont.",
  "child-budget-no-children": "Zonder kinderen is kindgebonden budget normaal niet van toepassing.",
  "child-budget-no-child-under-18": "Zonder kind onder 18 jaar is kindgebonden budget normaal niet van toepassing.",
  "child-budget-no-child-benefit": "Zonder kinderbijslag of vergelijkbare kindvoorwaarde is kindgebonden budget meestal niet van toepassing.",
  "child-budget-assets-above-limit": "Het ingevulde vermogen ligt boven een harde grens voor kindgebonden budget.",
  "child-budget-child-residence-excluded": "Als het kind niet bij jou woont, is kindgebonden budget meestal niet van toepassing.",
  "child-budget-family-complex": "Co-ouderschap of een samengestelde gezinssituatie vraagt om officiële controle.",
  "child-budget-possible": "De bekende harde voorwaarden voor kindgebonden budget sluiten dit signaal niet uit.",
  "childcare-missing-children": "Het is nog onbekend of je kinderen hebt.",
  "childcare-missing-care-use": "Het is nog onbekend of je betaalde kinderopvang gebruikt.",
  "childcare-missing-care-registration": "Het is nog onbekend of de opvang geregistreerd is.",
  "childcare-missing-own-contribution": "Het is nog onbekend of je zelf een deel van de opvang betaalt.",
  "childcare-missing-child-residence": "Het is nog onbekend of het kind bij jou woont.",
  "childcare-missing-applicant-activity": "Je kwalificerende activiteit ontbreekt nog.",
  "childcare-missing-partner-activity": "De activiteit van je toeslagpartner ontbreekt nog.",
  "childcare-missing-hours": "Het aantal opvanguren per maand ontbreekt nog.",
  "childcare-no-children": "Zonder kinderen is kinderopvangtoeslag normaal niet van toepassing.",
  "childcare-no-care": "Zonder betaalde kinderopvang is kinderopvangtoeslag normaal niet van toepassing.",
  "childcare-care-not-registered": "Kinderopvangtoeslag vraagt normaal om geregistreerde opvang.",
  "childcare-no-own-contribution": "Kinderopvangtoeslag vraagt normaal om een eigen bijdrage.",
  "childcare-no-qualifying-activity": "Zonder kwalificerende activiteit is kinderopvangtoeslag normaal niet van toepassing.",
  "childcare-partner-no-qualifying-activity": "Ook de toeslagpartner heeft normaal een kwalificerende activiteit nodig.",
  "childcare-child-residence-excluded": "Als het kind niet bij jou woont, is kinderopvangtoeslag meestal niet van toepassing.",
  "childcare-situation-complex": "De opvang- of activiteitensituatie vraagt om officiële controle.",
  "childcare-possible": "De bekende harde voorwaarden voor kinderopvangtoeslag sluiten dit signaal niet uit.",
};

export const missingFieldCopy: Record<AllowanceMissingField, string> = {
  year: "Toeslagjaar",
  age: "Leeftijd",
  partnerStatus: "Toeslagpartner ja, nee of onbekend",
  assessmentIncome: "Geschat toetsingsinkomen",
  jointAssessmentIncome: "Gezamenlijk geschat toetsingsinkomen",
  assets: "Vermogen op 1 januari",
  jointAssets: "Gezamenlijk vermogen op 1 januari",
  householdIncome: "Huishoudinkomen voor huurtoeslag",
  householdAssets: "Huishoudvermogen voor huurtoeslag",
  "healthcare.hasDutchHealthInsurance": "Nederlandse zorgverzekering",
  "rent.tenure": "Huurwoning, koopwoning of anders",
  "rent.independentHome": "Zelfstandige woonruimte",
  "rent.basicRent": "Kale huur per maand",
  "rent.hasCoResidents": "Medebewoners",
  "children.hasChildren": "Kinderen ja, nee of onbekend",
  "children.childAges": "Leeftijden van kinderen",
  "children.receivesChildBenefit": "Kinderbijslagstatus",
  "children.childLivesWithApplicant": "Kind woont bij jou",
  "childcare.usesChildcare": "Betaalde kinderopvang",
  "childcare.registeredChildcare": "LRK-registratie van opvang",
  "childcare.paysOwnContribution": "Eigen bijdrage kinderopvang",
  "childcare.childLivesWithApplicant": "Kind woont bij jou",
  "childcare.applicantHasQualifyingActivity": "Activiteit aanvrager",
  "childcare.partnerHasQualifyingActivity": "Activiteit toeslagpartner",
  "childcare.hoursPerMonth": "Opvanguren per maand",
};

export const uncertaintyCopy: Record<AllowanceUncertaintyCode, string> = {
  "foreign-or-residence-status": "Buitenland, verblijf of verzekeringsstatus kan de uitkomst veranderen.",
  "special-assets": "Bijzonder vermogen vraagt om officiële controle.",
  "assessment-income-uncertain": "Het toetsingsinkomen is onzeker.",
  "part-year-partner": "Een toeslagpartner voor een deel van het jaar vraagt om officiële controle.",
  "rent-income-table-not-implemented": "De huurtoeslag-inkomenstabellen zijn niet als bedragberekening geïmplementeerd.",
  "rent-household-income-not-fully-modeled": "Het huishoudinkomen voor huurtoeslag is niet volledig gemodelleerd.",
  "special-housing": "Een bijzondere woonsituatie vraagt om officiële controle.",
  "special-income": "Bijzonder inkomen vraagt om officiële controle.",
  "disabled-household-member": "Een aangepaste woning of beperking kan uitzonderingen geven.",
  "income-table-not-implemented": "De inkomensafbouw is niet als bedragberekening geïmplementeerd.",
  "co-parenting": "Co-ouderschap vraagt om officiële controle.",
  "composite-family": "Een samengesteld gezin vraagt om officiële controle.",
  "foreign-child-or-parent": "Buitenlandsituaties rond kind of ouder vragen om officiële controle.",
  "child-benefit-exception": "Een uitzondering op kinderbijslag vraagt om officiële controle.",
  "childcare-amount-engine-not-implemented": "De kinderopvangtoeslagbedragen worden niet berekend.",
  "education-recognition-uncertain": "Erkenning van opleiding of traject kan bepalend zijn.",
  "trajectory-uncertain": "Een traject, inburgering of re-integratie kan aanvullende regels hebben.",
  "variable-childcare-hours": "Wisselende opvanguren vragen om officiële controle.",
  "multiple-childcare-types": "Meerdere opvangvormen vragen om officiële controle.",
  "lrk-registration-uncertain": "Onzekerheid over LRK-registratie vraagt om officiële controle.",
  "dataset-not-fresh": "De brondata vraagt om hercontrole voordat je op dit signaal vertrouwt.",
};

export function getReasonCodeCopy(code: string) {
  return reasonCodeCopy[code as AllowanceReasonCode] ?? "Deze reden vraagt om officiële controle.";
}

export function getMissingFieldCopy(field: string) {
  return missingFieldCopy[field as AllowanceMissingField] ?? "Aanvullende informatie";
}

export function getUncertaintyCopy(code: string) {
  return uncertaintyCopy[code as AllowanceUncertaintyCode] ?? "Deze onzekerheid vraagt om officiële controle.";
}
