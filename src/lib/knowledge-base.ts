export type KnowledgeHorizonBand = {
  id: "short" | "medium" | "long";
  title: string;
  periodLabel: string;
  primaryGoal: string;
  typicalApproach: string;
  watchOut: string;
  firstChecks: string[];
};

export type KnowledgeTopic = {
  id: string;
  title: string;
  summary: string;
  whenRelevant: string;
  checklist: string[];
  commonMistakes: string[];
  relatedTools: string[];
};

export const knowledgeHorizonBands: KnowledgeHorizonBand[] = [
  {
    id: "short",
    title: "Korte horizon",
    periodLabel: "0 t/m 3 jaar",
    primaryGoal: "Zekerheid en beschikbaarheid van je geld",
    typicalApproach:
      "Focus op buffer en laag risico. Liquiditeit is hier belangrijker dan maximaal rendement.",
    watchOut:
      "Beleggen met geld dat je snel nodig hebt kan je doel in gevaar brengen bij een dip vlak voor opname.",
    firstChecks: [
      "Heb je een noodbuffer die past bij je vaste lasten?",
      "Staat het geld op een plek waar je er direct bij kunt?",
      "Welke uitgaven zijn zeker en welke zijn nog onzeker?",
    ],
  },
  {
    id: "medium",
    title: "Middellange horizon",
    periodLabel: "4 t/m 7 jaar",
    primaryGoal: "Balans tussen groei en stabiliteit",
    typicalApproach:
      "Werk met scenario's en bouw risico geleidelijk op. Houd een deel veilig en een deel groeigericht.",
    watchOut:
      "Te agressief starten zonder tussentijdse evaluatie kan leiden tot timingrisico rond het doelmoment.",
    firstChecks: [
      "Wat is je minimaal benodigde bedrag op de doeldatum?",
      "Kun je bij tegenvallend rendement je doel uitstellen?",
      "Hoeveel wil je maximaal kunnen verliezen zonder stress?",
    ],
  },
  {
    id: "long",
    title: "Lange horizon",
    periodLabel: "8+ jaar",
    primaryGoal: "Koopkracht en vermogensgroei op lange termijn",
    typicalApproach:
      "Lange horizon maakt volatiliteit beter op te vangen. Spreiding en discipline zijn belangrijker dan market timing.",
    watchOut:
      "Geen rekening houden met inflatie en box 3 kan je netto einddoel te optimistisch maken.",
    firstChecks: [
      "Past je risicoprofiel bij tijdelijke dalingen?",
      "Reken je met netto scenario's inclusief belasting?",
      "Heb je een duidelijk plan voor inleggen, volhouden en herbalanceren?",
    ],
  },
];

export const knowledgeTopics: KnowledgeTopic[] = [
  {
    id: "house-5-years",
    title: "Over 5 jaar een huis kopen",
    summary:
      "Als je binnen ongeveer 5 jaar wilt kopen, is de combinatie van zekerheid en flexibiliteit vaak belangrijker dan maximaal rendement.",
    whenRelevant:
      "Relevant als je spaart voor eigen geld, kosten koper en stabiliteit in maandlasten rond aankoop.",
    checklist: [
      "Schat je doelbedrag voor eigen geld en bijkomende kosten.",
      "Bepaal welk deel absoluut beschikbaar moet zijn op de koopdatum.",
      "Test meerdere rente- en prijs-scenario's in plaats van één verwachting.",
      "Controleer ook je maandelijkse betaalbaarheid, niet alleen de aankoop zelf.",
    ],
    commonMistakes: [
      "Te laat starten met het opbouwen van eigen geld.",
      "Alles op groei zetten terwijl de koopdatum al dichtbij komt.",
      "Alleen naar maximale hypotheek kijken en niet naar buffer na aankoop.",
    ],
    relatedTools: [
      "koop-vs-huur",
      "hypotheek-impact-studieschuld",
      "hypotheek-aflossen-vs-beleggen",
    ],
  },
  {
    id: "rent-vs-buy",
    title: "Huren of kopen vergelijken",
    summary:
      "Huren of kopen is geen puur rekenvraagstuk. De uitkomst hangt ook af van flexibiliteit, woonduur en risico dat je wilt dragen.",
    whenRelevant:
      "Relevant bij twijfel tussen direct kopen, langer huren of gefaseerd opbouwen van eigen geld.",
    checklist: [
      "Vergelijk niet alleen maandlast, maar ook risico en flexibiliteit.",
      "Kijk naar onderhoud, transactiekosten en renterisico.",
      "Bepaal een minimumperiode waarin kopen voor jou logisch kan zijn.",
      "Maak een fallback-plan als huizenprijzen of rente tegenzitten.",
    ],
    commonMistakes: [
      "Kopen vergelijken met alleen de huidige huur, zonder bijkomende lasten.",
      "Vergeten dat verhuizen binnen korte tijd de koopcase zwakker maakt.",
      "Te optimistische aanname over waardestijging van de woning.",
    ],
    relatedTools: [
      "koop-vs-huur",
      "hypotheekrenteaftrek-afschaffen",
      "annuitair-lineair",
    ],
  },
  {
    id: "investing-horizon-risk",
    title: "Beleggen: horizon en risico",
    summary:
      "Hoe langer je horizon, hoe meer tijdelijke schommelingen je meestal kunt opvangen. Risico moet wel passen bij je gedrag.",
    whenRelevant:
      "Relevant als je periodiek wilt inleggen of twijfelt tussen aflossen, sparen en beleggen.",
    checklist: [
      "Kies een horizon die past bij je echte opnameplan.",
      "Bepaal vooraf hoe je reageert op een forse daling.",
      "Gebruik scenario's met lager netto rendement dan je verwacht.",
      "Evalueer jaarlijks of je verdeling nog bij je doel past.",
    ],
    commonMistakes: [
      "Rendement 1-op-1 doortrekken zonder risicocorrectie.",
      "Beleggen met geld dat eigenlijk je buffer hoort te zijn.",
      "Stoppen na een daling en zo verlies definitief maken.",
    ],
    relatedTools: [
      "volgende-euro",
      "fire-na-belasting",
      "prive-beleggen-eindvermogen",
      "box-3-impact",
    ],
  },
  {
    id: "inflation-purchasing-power",
    title: "Inflatie en koopkracht",
    summary:
      "Nominale groei zegt weinig zonder inflatie. Je doelbedrag moet in toekomstige koopkracht worden bekeken.",
    whenRelevant:
      "Relevant voor vrijwel elk doel langer dan 1 jaar, zeker bij sparen en langetermijnbeleggen.",
    checklist: [
      "Reken met minimaal drie inflatiescenario's (laag, basis, hoog).",
      "Controleer of je netto uitkomst nog steeds je doel dekt.",
      "Neem belastingeffecten mee bij grotere vermogens.",
      "Herijk je doelbedrag periodiek.",
    ],
    commonMistakes: [
      "Alleen naar eindbedrag kijken zonder prijsstijging mee te nemen.",
      "Historisch gemiddelde als zekerheid behandelen.",
      "Geen bandbreedtes gebruiken in planning.",
    ],
    relatedTools: [
      "fire-na-belasting",
      "jaarruimte-vs-vrij-beleggen",
      "prive-beleggen-eindvermogen",
    ],
  },
  {
    id: "debt-vs-investing",
    title: "Aflossen of beleggen",
    summary:
      "Vergelijk rente op schuld met verwacht netto rendement, maar neem ook risico en flexibiliteit mee in de keuze.",
    whenRelevant:
      "Relevant bij studieschuld, consumptieve schuld of hypotheek en beperkt extra maandbudget.",
    checklist: [
      "Bepaal je verplichte maandlast en je echte keuze-ruimte daarboven.",
      "Kijk naar netto rendement na belasting en risico-opslag.",
      "Controleer welk effect extra aflossen heeft op rust en flexibiliteit.",
      "Werk met een volgorde: buffer, dure schuld, dan groeikeuzes.",
    ],
    commonMistakes: [
      "Verplicht en vrijwillig aflossen door elkaar halen.",
      "Schuldrente vergelijken met bruto beleggingsrendement.",
      "Geen rekening houden met volatiliteit bij korte horizon.",
    ],
    relatedTools: [
      "studieschuld-vs-beleggen",
      "volgende-euro",
      "hypotheek-aflossen-vs-beleggen",
      "schulden-volgorde",
    ],
  },
];

