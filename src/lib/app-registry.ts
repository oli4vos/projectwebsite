import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "annuitair-lineair",
    "title": "Annuïtair of lineair",
    "description": "Vergelijk hoe je maandlasten en schuld dalen bij een annuïtaire of lineaire hypotheek.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "annuiteit",
      "lineair",
      "maandlasten"
    ],
    "status": "active",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "housing.mortgageRate",
      "housing.mortgageTermYears"
    ],
    "reasonHint": "Handig als je annuïtaire en lineaire hypotheeklasten naast elkaar wilt zetten.",
    "assumptionsUsed": [
      "mortgage",
      "tax",
      "investment"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-aflossingstermijnen-lening",
    "title": "Aflossingstermijnen lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-doorlopend-krediet-vergelijken",
    "title": "Doorlopend krediet vergelijken (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-geld-lenen-kost-geld",
    "title": "Geld lenen kost geld (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-hoogte-lening",
    "title": "Hoogte lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-kopen-op-afbetaling",
    "title": "Kopen op afbetaling (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-leasetermijn-financial-lease",
    "title": "Leasetermijn financial lease (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-lening-aflossen",
    "title": "Lening aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-looptijd-aflossing-lening",
    "title": "Looptijd aflossing lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-maandbedrag-voor-aflossing-lening",
    "title": "Maandbedrag voor aflossing lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-maximale-lening",
    "title": "Maximale lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-persoonlijke-lening-vergelijken",
    "title": "Persoonlijke lening vergelijken (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-rente-bij-lening",
    "title": "Rente bij lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-rente-in-financial-lease",
    "title": "Rente in financial lease (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-restschuld-bij-financial-lease",
    "title": "Restschuld bij financial lease (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-restschuld-lening",
    "title": "Restschuld lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-studiefinanciering-terugbetalen",
    "title": "Studiefinanciering terugbetalen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-geld-lenen-financiering-toename-schuld",
    "title": "Toename schuld (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Geld lenen en financiering",
    "tags": [
      "artifact-import",
      "geld-lenen-financiering",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-aantal-werkdagen",
    "title": "Aantal werkdagen (Artifacts)",
    "description": "Bereken werkdagen in een periode met optionele uitsluiting van Nederlandse feestdagen.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "werkdagen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-begin-of-einddatum",
    "title": "Begin- of einddatum (Artifacts)",
    "description": "Bereken een begin- of einddatum op basis van een bekende datum en periodecomponenten.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "datum",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-dag-van-de-week",
    "title": "Dag van de week (Artifacts)",
    "description": "Bepaal op welke weekdag een datum valt, inclusief ISO-weeknummer en dagnummer in het jaar.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "weekdag",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-eerstvolgende-of-vorige-weekdag",
    "title": "Eerstvolgende of vorige weekdag (Artifacts)",
    "description": "Bereken de eerstvolgende of vorige weekdag vanaf een opgegeven datum.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "weekdag",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-feestdagen",
    "title": "Feestdagen (Artifacts)",
    "description": "Toon Nederlandse feestdagen voor een gekozen jaar, inclusief vaste en beweeglijke dagen.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "feestdagen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-periode-duur",
    "title": "Periode duur (Artifacts)",
    "description": "Bereken de duur tussen twee datums in dagen, weken en kalendercomponenten.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "periode",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-schoolvakanties",
    "title": "Schoolvakanties (Artifacts)",
    "description": "Toon schoolvakantieperiodes per schooljaar en regio op basis van een interne dataset.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "schoolvakanties",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "charts"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "low",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-kalender-vrije-tijd-wisselkoers-valuta",
    "title": "Wisselkoers valuta (Artifacts)",
    "description": "Reken bedragen om tussen valuta met optionele koersopslag en vaste kosten.",
    "type": "frontend",
    "category": "Artifacts · Kalender en vrije tijd",
    "tags": [
      "artifact-import",
      "kalender-vrije-tijd",
      "valuta",
      "wisselkoers",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "investment"
    ],
    "calculationDomains": [
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-aanvullend-pensioen-berekenen",
    "title": "Aanvullend pensioen berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-aow-leeftijd",
    "title": "AOW-leeftijd (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-banksparen-voor-pensioen",
    "title": "Banksparen voor Pensioen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-bruto-netto-aow-pensioen",
    "title": "Bruto-netto AOW & pensioen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-bruto-netto-eerste-pensioenjaar",
    "title": "Bruto-netto eerste pensioenjaar (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-bruto-netto-pensioen-ander-inkomen",
    "title": "Bruto-netto pensioen + ander inkomen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-bruto-netto-vroegpensioen-ander-inkomen",
    "title": "Bruto-netto vroegpensioen + ander inkomen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-doorwerken-na-uw-pensioen",
    "title": "Doorwerken na uw pensioen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-extra-pensioenuitkering",
    "title": "Extra pensioenuitkering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-hoogte-aow-uitkering",
    "title": "Hoogte AOW-uitkering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-jaarruimte-belastingteruggave",
    "title": "Jaarruimte & belastingteruggave (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-jaarruimte-reserveringsruimte",
    "title": "Jaarruimte + reserveringsruimte (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-levensverwachting-bij-geboorte",
    "title": "Levensverwachting bij geboorte (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-netto-aow-pensioen-of-lijfrente-uitkering",
    "title": "Netto AOW-, pensioen- of lijfrente-uitkering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-netto-nabestaandenpensioen-of-anw-uitkering",
    "title": "Netto nabestaandenpensioen of Anw-uitkering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-netto-pensioen-na-pensioenkorting",
    "title": "Netto pensioen na pensioenkorting (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-ouderenkorting",
    "title": "Ouderenkorting (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-overbruggingsuitkering-aow",
    "title": "Overbruggingsuitkering AOW (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-pensioensparen-buiten-box3",
    "title": "Pensioensparen buiten box3 (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-pensioenstorting",
    "title": "Pensioenstorting (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-pensioenuitkering",
    "title": "Pensioenuitkering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-pensioenwaarde-berekenen",
    "title": "Pensioenwaarde berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-reserveringsruimte",
    "title": "Reserveringsruimte (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-resterende-levensverwachting",
    "title": "Resterende levensverwachting (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-rvu-regeling-inkomensdaling",
    "title": "RVU-regeling - inkomensdaling (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-sparen-aanvullend-pensioen",
    "title": "Sparen aanvullend pensioen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-uitkeringen-uit-een-bancaire-lijfrente",
    "title": "Uitkeringen uit een bancaire lijfrente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-pensioen-aow-uitkeringen-uit-een-lijfrenteverzekering",
    "title": "Uitkeringen uit een lijfrenteverzekering (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts · Pensioen en AOW",
    "tags": [
      "artifact-import",
      "pensioen-aow",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "pension",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "box-3-impact",
    "title": "Wat kost mijn vermogen in box 3?",
    "description": "Zie hoeveel belasting je indicatief betaalt over spaargeld, beleggingen en schulden.",
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "box 3",
      "belasting",
      "sparen",
      "beleggen",
      "vermogen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear"
    ],
    "reasonHint": "Handig als je wilt zien wat spaargeld, beleggingen en schulden indicatief doen in box 3.",
    "assumptionsUsed": [
      "tax",
      "box3"
    ],
    "calculationDomains": [
      "tax",
      "saving",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "familiehulp-eerste-woning",
    "title": "Familiehulp eerste woning",
    "description": "Combineer bancaire hypotheek, DUO, schenking, eigen geld en familielening voor een eerste woning.",
    "type": "frontend",
    "category": "Familiefinanciering",
    "tags": [
      "familielening",
      "schenking",
      "studieschuld",
      "hypotheek",
      "starter"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "studentDebt.remainingDebt",
      "studentDebt.currentMonthlyPayment",
      "studentDebt.statutoryMonthlyPayment",
      "studentDebt.repaymentRule",
      "studentDebt.duoSituation",
      "studentDebt.duoInterestRate",
      "studentDebt.remainingTermYears",
      "housing.targetHomePrice",
      "housing.ownFunds",
      "housing.mortgageRate",
      "housing.mortgageTermYears",
      "savingInvesting.targetEmergencyFund"
    ],
    "reasonHint": "Handig als je een eerste woning wilt financieren met hypotheek, DUO, familiehulp en eigen geld.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "studentDebt",
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "fire-na-belasting",
    "title": "Wanneer kan ik stoppen of minder werken?",
    "description": "Bereken je pad naar financiële vrijheid met inleg, rendement, uitgaven en box 3-effect.",
    "type": "frontend",
    "category": "Beleggen",
    "tags": [
      "FIRE",
      "beleggen",
      "box 3",
      "financiële vrijheid",
      "vermogen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.riskProfile",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner"
    ],
    "reasonHint": "Handig als je wilt zien wanneer je vermogen je uitgaven kan dragen, met rendement en box 3 erbij.",
    "assumptionsUsed": [
      "box3",
      "tax",
      "investment",
      "inflation"
    ],
    "calculationDomains": [
      "investing",
      "saving",
      "tax",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-aflossen-vs-beleggen",
    "title": "Hypotheek aflossen of beleggen?",
    "description": "Vergelijk extra aflossen op je hypotheek met vrij beleggen, inclusief renteaftrek en box 3-effect.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "aflossen",
      "beleggen",
      "box 3",
      "renteaftrek"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "housing.mortgageRate",
      "housing.mortgageTermYears",
      "savingInvesting.currentSavings",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear",
      "savingInvesting.targetEmergencyFund",
      "savingInvesting.monthlyFreeCashflow"
    ],
    "reasonHint": "Handig als je extra geld wilt vergelijken tussen hypotheek aflossen en vrij beleggen.",
    "assumptionsUsed": [
      "tax",
      "box3",
      "mortgage",
      "investment"
    ],
    "calculationDomains": [
      "mortgage",
      "investing",
      "tax",
      "saving"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-impact-studieschuld",
    "title": "Hypotheek-impact studieschuld",
    "description": "Zie welk DUO-bedrag kan meetellen en wat dat indicatief doet met je hypotheekruimte.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "studieschuld",
      "hypotheek",
      "DUO",
      "brutering",
      "starter",
      "pechgeneratie"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "studentDebt.remainingDebt",
      "studentDebt.currentMonthlyPayment",
      "studentDebt.statutoryMonthlyPayment",
      "studentDebt.repaymentRule",
      "studentDebt.duoSituation",
      "studentDebt.duoInterestRate",
      "studentDebt.remainingTermYears",
      "housing.targetHomePrice",
      "housing.ownFunds",
      "housing.mortgageRate",
      "housing.mortgageTermYears",
      "housing.maxMortgageWithoutStudentDebt"
    ],
    "reasonHint": "Handig als je wilt weten welk DUO-bedrag kan meetellen bij je hypotheekruimte.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "studentDebt",
      "mortgage",
      "housing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheekrenteaftrek-afschaffen",
    "title": "Wat als hypotheekrenteaftrek stopt?",
    "description": "Zie wat afschaffing van hypotheekrenteaftrek indicatief doet met je netto rentelasten.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "renteaftrek",
      "belasting",
      "wonen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "housing.mortgageRate",
      "tax.preferredTaxYear"
    ],
    "reasonHint": "Handig als je wilt zien hoe je netto hypotheeklast verandert zonder renteaftrek.",
    "assumptionsUsed": [
      "tax",
      "mortgage"
    ],
    "calculationDomains": [
      "mortgage",
      "tax",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "jaarruimte-vs-vrij-beleggen",
    "title": "Jaarruimte of vrij beleggen?",
    "description": "Vergelijk pensioeninleg met vrij beleggen: belastingvoordeel nu, box 3 later en flexibiliteit.",
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "jaarruimte",
      "pensioen",
      "box 3",
      "beleggen",
      "FIRE"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "savingInvesting.currentSavings",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "savingInvesting.pensionBuildUp"
    ],
    "reasonHint": "Handig als je twijfelt tussen pensioeninleg met belastingvoordeel en flexibel vrij beleggen.",
    "assumptionsUsed": [
      "tax",
      "box1",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "tax",
      "investing",
      "pension"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "kind-wordt-18-impact",
    "title": "Kind wordt 18: maandimpact",
    "description": "Bekijk kinderbijslag, kindgebonden budget, zorgverzekering, zorgtoeslag en studiekosten als maandimpact.",
    "type": "frontend",
    "category": "Persoonlijke financiën",
    "tags": [
      "gezin",
      "kind 18",
      "toeslagen",
      "zorgverzekering",
      "studiekosten"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt zien wat er in je maandruimte verandert rond de 18e verjaardag van je kind.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "cashflow",
      "tax"
    ],
    "riskLevel": "medium",
    "disclaimerType": "indicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "koop-vs-huur",
    "title": "Kopen of huren?",
    "description": "Vergelijk huren en kopen op maandlast, eigen geld en rente-stresstest.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "wonen",
      "huur",
      "koop",
      "hypotheek",
      "rente-stresstest"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je kopen en huren wilt vergelijken op maandlast, eigen geld en renterisico.",
    "assumptionsUsed": [
      "mortgage"
    ],
    "calculationDomains": [
      "housing",
      "mortgage",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "prive-beleggen-eindvermogen",
    "title": "Wat wordt mijn eindvermogen met beleggen?",
    "description": "Bereken je verwachte eindvermogen bij maandelijks beleggen, inclusief box 3-heffing zodra je boven de vrijstelling uitkomt.",
    "type": "frontend",
    "category": "Beleggen",
    "tags": [
      "beleggen",
      "eindvermogen",
      "box 3",
      "vermogen",
      "privé"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "tax.preferredBox3Method"
    ],
    "reasonHint": "Handig als je wilt zien wat periodiek privé beleggen oplevert na box 3 over de jaren.",
    "assumptionsUsed": [
      "tax",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "investing",
      "saving",
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "schulden-volgorde",
    "title": "Welke schuld eerst?",
    "description": "Zet dure schulden, DUO, hypotheek en achteraf betalen in een extra-aflosvolgorde.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "schulden",
      "BNPL",
      "DUO",
      "hypotheek",
      "aflossen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt zien welke schuld bij extra geld waarschijnlijk eerst aandacht vraagt.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "cashflow",
      "studentDebt",
      "mortgage"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "checklist",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "studieschuld-vs-beleggen",
    "title": "Studieschuld extra aflossen of beleggen?",
    "description": "Vergelijk wat extra aflossen op je studieschuld doet ten opzichte van sparen of beleggen.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "studieschuld",
      "beleggen",
      "rente"
    ],
    "status": "active",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.duoInterestRate",
      "studentDebt.remainingTermYears",
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.currentSavings",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "tax.preferredBox3Method"
    ],
    "reasonHint": "Handig als je wilt vergelijken wat extra aflossen op je studieschuld doet ten opzichte van beleggen.",
    "assumptionsUsed": [
      "duo",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "studentDebt",
      "investing",
      "saving",
      "tax"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "volgende-euro",
    "title": "Wat doe ik met mijn volgende euro?",
    "description": "Ontdek of extra geld logischer naar buffer, aflossen, pensioen, woning of beleggen kan.",
    "type": "frontend",
    "category": "Persoonlijke financiën",
    "tags": [
      "buffer",
      "beleggen",
      "aflossen",
      "pensioen",
      "FIRE"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.targetEmergencyFund",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.riskProfile",
      "studentDebt.remainingDebt",
      "studentDebt.duoInterestRate",
      "housing.mortgageRate",
      "housing.targetHomePrice",
      "housing.ownFunds"
    ],
    "reasonHint": "Handig als je niet zeker weet of extra geld beter naar buffer, aflossen, pensioen of beleggen kan.",
    "assumptionsUsed": [
      "duo",
      "tax",
      "box3",
      "mortgage",
      "investment"
    ],
    "calculationDomains": [
      "saving",
      "investing",
      "studentDebt",
      "mortgage",
      "tax",
      "cashflow",
      "pension"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "zzp-uurtarief",
    "title": "Welk ZZP-uurtarief heb ik nodig?",
    "description": "Bereken een indicatief uurtarief inclusief belasting, buffer, pensioen, AOV en kosten.",
    "type": "frontend",
    "category": "Werk",
    "tags": [
      "ZZP",
      "uurtarief",
      "AOV",
      "pensioen",
      "inkomen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.employmentType",
      "income.grossAnnualIncome",
      "savingInvesting.targetEmergencyFund",
      "tax.preferredTaxYear",
      "employment.grossAnnualSalary",
      "employment.businessProfitBeforeTax",
      "employment.aovPremiumAnnual",
      "employment.pensionContributionAnnual"
    ],
    "reasonHint": "Handig als je wilt weten welk uurtarief past bij inkomen, belasting, pensioen, AOV en buffer.",
    "assumptionsUsed": [
      "tax",
      "box1"
    ],
    "calculationDomains": [
      "employment",
      "cashflow",
      "pension",
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
