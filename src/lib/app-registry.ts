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
    "slug": "artifact-basis-berekeningen-annuitair-geleend-bedrag",
    "title": "Annuïtair geleend bedrag (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-annuiteit-berekenen",
    "title": "Annuïteit berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-bedrag-getal-berekenen",
    "title": "Bedrag/getal berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-breuk-berekenen",
    "title": "Breuk berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-cijfer-berekenen",
    "title": "Cijfer berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-contante-waarde",
    "title": "Contante waarde (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-contante-waarde-voor-een-reeks-betalingen",
    "title": "Contante waarde voor een reeks betalingen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-effectieve-rente",
    "title": "Effectieve rente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-enkelvoudige-rente",
    "title": "Enkelvoudige rente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-gemiddelde-cijfer",
    "title": "Gemiddelde cijfer (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-gewogen-gemiddelde-rentepercentage",
    "title": "Gewogen gemiddelde rentepercentage (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-lineaire-lening-aflossen",
    "title": "Lineaire lening aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-looptijd-annuiteit-berekenen",
    "title": "Looptijd annuïteit berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-nominale-rente",
    "title": "Nominale rente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-percentage-berekenen",
    "title": "Percentage berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-percentage-berekenen-2",
    "title": "Percentage berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-romeinse-cijfers",
    "title": "Romeinse cijfers (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-samengestelde-rente",
    "title": "Samengestelde rente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-toekomstige-waarde",
    "title": "Toekomstige waarde (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-basis-berekeningen-waardebepaling-via-cashflow-dcf-methode",
    "title": "Waardebepaling via cashflow, DCF-methode (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "basis-berekeningen",
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
    "slug": "artifact-geld-lenen-financiering-aflossingstermijnen-lening",
    "title": "Aflossingstermijnen lening (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "category": "Artifacts (invulbladen)",
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
    "slug": "artifact-gezin-relatie-aanvullend-partnerverlof",
    "title": "Aanvullend partnerverlof (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-betaald-ouderschapsverlof",
    "title": "Betaald ouderschapsverlof (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-eigen-bijdrage-wmo-ivb",
    "title": "Eigen bijdrage Wmo (ivb) (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-gesubsidieerde-rechtsbijstand",
    "title": "Gesubsidieerde rechtsbijstand (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-indexering-alimentatie",
    "title": "Indexering alimentatie (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-kinderalimentatie",
    "title": "Kinderalimentatie (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-kinderbijslag-berekenen",
    "title": "Kinderbijslag berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-kosten-kinderopvang",
    "title": "Kosten kinderopvang (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-partner-uitkopen-uit-eigen-woning",
    "title": "Partner uitkopen uit eigen woning (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-partneralimentatie",
    "title": "Partneralimentatie (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-trouwen-en-een-bruiloft",
    "title": "Trouwen en een bruiloft (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-gezin-relatie-vergoedingsrecht-binnen-een-huwelijk",
    "title": "Vergoedingsrecht binnen een huwelijk (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "gezin-relatie",
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
    "slug": "artifact-hypotheek-wonen-actuele-hypotheekrente",
    "title": "Actuele hypotheekrente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-aflosboete-wet-hillen",
    "title": "Aflosboete Wet Hillen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-aflossingseis-hypotheekrenteaftrek",
    "title": "Aflossingseis hypotheekrenteaftrek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-aflossingsvrije-hypotheek-tussentijds-aflossen",
    "title": "Aflossingsvrije hypotheek tussentijds aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-aftrekbare-hypotheekrente-berekenen",
    "title": "Aftrekbare hypotheekrente berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-annuiteit-berekenen",
    "title": "Annuïteit berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-banksparen-eigen-woning",
    "title": "Banksparen Eigen Woning (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-boeterente-berekenen",
    "title": "Boeterente berekenen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-boeterente-in-rentemiddeling",
    "title": "Boeterente in rentemiddeling (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-dalende-risico-opslag",
    "title": "Dalende risico opslag (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-effectieve-hypotheekrente",
    "title": "Effectieve hypotheekrente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-eigenwoningforfait",
    "title": "Eigenwoningforfait (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-familiebank-hypotheek",
    "title": "Familiebank hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hoeveel-eigen-geld-heeft-u-nodig",
    "title": "Hoeveel eigen geld heeft u nodig (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hogere-maximale-hypotheek",
    "title": "Hogere maximale hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-huis-onder-water-aflossen",
    "title": "Huis onder water aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-huren-of-kopen",
    "title": "Huren of kopen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-aflossen",
    "title": "Hypotheek aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-aflossen-in-plaats-van-sparen",
    "title": "Hypotheek aflossen in plaats van sparen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-deels-aflossen",
    "title": "Hypotheek deels aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-extra-aflossen",
    "title": "Hypotheek extra aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-maandlasten-bij-nieuwbouw",
    "title": "Hypotheek maandlasten bij nieuwbouw (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-maandlasten-na-rentewijziging",
    "title": "Hypotheek maandlasten na rentewijziging (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-meenemen-bij-verhuizen",
    "title": "Hypotheek meenemen bij verhuizen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-oversluiten",
    "title": "Hypotheek oversluiten (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-rentevaste-periode",
    "title": "Hypotheek rentevaste periode (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheek-uit-eigen-bv",
    "title": "Hypotheek uit eigen bv (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheekrente-vooruit-betalen",
    "title": "Hypotheekrente vooruit betalen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-hypotheekrenteaftrek",
    "title": "Hypotheekrenteaftrek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-kan-ik-dat-huis-betalen",
    "title": "Kan ik dat huis betalen? (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-kapitaalverzekering-uitkeren",
    "title": "Kapitaalverzekering uitkeren (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-kosten-hypotheekvormen",
    "title": "Kosten hypotheekvormen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-kosten-koper",
    "title": "Kosten koper (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-krediethypotheek",
    "title": "Krediethypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-looptijdrente",
    "title": "Looptijdrente (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maandlasten-annuiteitenhypotheek",
    "title": "Maandlasten annuïteitenhypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maandlasten-lineaire-hypotheek",
    "title": "Maandlasten lineaire hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-boetevrije-hypotheekaflossing",
    "title": "Maximale boetevrije hypotheekaflossing (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-erfpacht-hypotheek",
    "title": "Maximale erfpacht hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-huizenprijs",
    "title": "Maximale huizenprijs (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek",
    "title": "Maximale hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek-na-verhuizen",
    "title": "Maximale hypotheek na verhuizen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek-ondernemer",
    "title": "Maximale hypotheek ondernemer (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek-uit-maandlasten",
    "title": "Maximale hypotheek uit maandlasten (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-maximale-verhuurhypotheek",
    "title": "Maximale verhuurhypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-netto-hypotheek-maandlasten",
    "title": "Netto hypotheek maandlasten (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-netto-voordeel-hypotheekrenteaftrek",
    "title": "Netto voordeel hypotheekrenteaftrek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-opeethypotheek",
    "title": "Opeethypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-overdrachtsbelasting",
    "title": "Overdrachtsbelasting (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-overwaarde-huis-opeten",
    "title": "Overwaarde huis opeten (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-prijsontwikkeling-huizenprijzen",
    "title": "Prijsontwikkeling huizenprijzen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-rentemiddeling",
    "title": "Rentemiddeling (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-restschuld-berekenen-aflossen",
    "title": "Restschuld berekenen & aflossen (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-stijging-maandlasten-annuiteitenhypotheek",
    "title": "Stijging maandlasten annuïteitenhypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-tariefsaanpassing-aftrek-kosten-eigen-woning",
    "title": "Tariefsaanpassing aftrek kosten eigen woning (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "artifact-hypotheek-wonen-totale-netto-kosten-van-een-hypotheek",
    "title": "Totale netto kosten van een hypotheek (Artifacts)",
    "description": "Geimporteerde rekentool op basis van ingevuld logic-invulblad. Nog in artifacts-fase.",
    "type": "frontend",
    "category": "Artifacts (invulbladen)",
    "tags": [
      "artifact-import",
      "hypotheek-wonen",
      "invulblad"
    ],
    "status": "draft",
    "visibility": "public",
    "reasonHint": "Geïmporteerd vanuit ingevulde artifacts; bedoeld voor gecontroleerde uitrol in aparte sectie.",
    "assumptionsUsed": [
      "mortgage",
      "tax"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
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
