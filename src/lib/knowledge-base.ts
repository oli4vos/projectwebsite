import type { KnowledgeSourceId } from "@/lib/knowledge-sources";

export type KnowledgeVisibility = "public" | "hidden";

export type KnowledgeHorizonBand = {
  id: "short" | "medium" | "long";
  title: string;
  periodLabel: string;
  primaryGoal: string;
  typicalApproach: string;
  watchOut: string;
  firstChecks: string[];
  visibility?: KnowledgeVisibility;
};

export type KnowledgeTopic = {
  id: string;
  title: string;
  summary: string;
  whenRelevant: string;
  checklist: string[];
  commonMistakes: string[];
  relatedTools: string[];
  sourceIds?: KnowledgeSourceId[];
  visibility?: KnowledgeVisibility;
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
    visibility: "hidden",
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
    visibility: "hidden",
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
    visibility: "hidden",
  },
];

export const knowledgeTopics: KnowledgeTopic[] = [
  {
    id: "duo-rente-werkt",
    title: "Hoe DUO-rente werkt",
    summary:
      "Over je studieschuld loopt rente. Het percentage hangt af van je terugbetalingsregel en wordt voor een rentevaste periode vastgesteld.",
    whenRelevant:
      "Relevant als je wilt begrijpen waarom je schuld tijdens of na je studie kan oplopen, ook als je nog niet verplicht terugbetaalt.",
    checklist: [
      "Controleer in Mijn DUO welke terugbetalingsregel bij jouw schuld hoort.",
      "Bekijk welke rente DUO voor die regeling gebruikt en tot wanneer die vaststaat.",
      "Houd rente en maandtermijn uit elkaar: rente vergroot de schuld, de maandtermijn bepaalt je betaling.",
      "Gebruik een rekenhulp om te zien wat een ander rentepercentage met je maandbedrag doet.",
    ],
    commonMistakes: [
      "Denken dat er pas rente loopt zodra je verplicht gaat terugbetalen.",
      "Een algemeen rentepercentage gebruiken zonder je eigen terugbetalingsregel te controleren.",
      "Rentevaste periode verwarren met de totale looptijd van je schuld.",
    ],
    relatedTools: ["duo-doorlenen-of-stoppen", "duo-maandbedrag"],
    sourceIds: [
      "duo-rente-terugbetalers",
      "duo-rente-studenten",
      "duo-nieuwe-rentepercentages-2026",
      "duo-lenen-studiefinanciering",
    ],
  },
  {
    id: "duo-aanloopfase",
    title: "De aanloopfase",
    summary:
      "Na het stoppen van studiefinanciering begint meestal een aanloopfase. In die periode hoef je nog niet verplicht terug te betalen, maar rente kan wel doorlopen.",
    whenRelevant:
      "Relevant rond afstuderen, stoppen met studeren of opnieuw gaan studeren voordat je aflosfase begint.",
    checklist: [
      "Bepaal wanneer je studiefinanciering stopt.",
      "Controleer wanneer DUO jouw aanloopfase en aflosfase laat beginnen.",
      "Houd er rekening mee dat vrijwillig eerder betalen kan, maar dat DUO in de aanloopfase nog niet automatisch incasseert.",
      "Gebruik je verwachte schuld en rente om alvast je latere maandbedrag te schatten.",
    ],
    commonMistakes: [
      "Aanloopfase zien als rentevrije periode.",
      "Vergeten dat de aflosfase meestal pas op 1 januari na de aanloopfase start.",
      "Geen planning maken voor het moment waarop de verplichte betaling begint.",
    ],
    relatedTools: ["duo-doorlenen-of-stoppen", "duo-maandbedrag"],
    sourceIds: [
      "duo-eerder-extra-aflossen",
      "duo-u-studeert-nog",
      "duo-lenen-studiefinanciering",
    ],
  },
  {
    id: "duo-draagkracht-jokerjaren",
    title: "Draagkracht en jokerjaren",
    summary:
      "DUO berekent eerst het wettelijke maandbedrag en kijkt daarna meestal naar je draagkracht. Is je draagkracht lager, dan kan je maandbedrag lager worden.",
    whenRelevant:
      "Relevant als je inkomen laag, wisselend of tijdelijk gedaald is, of als je wilt weten waarom je betaalde maandbedrag lager kan zijn dan de wettelijke termijn.",
    checklist: [
      "Maak onderscheid tussen wettelijk maandbedrag en maandbedrag naar draagkracht.",
      "Controleer welk peiljaar DUO gebruikt voor je inkomen.",
      "Bekijk of partnerinkomen meetelt onder jouw regeling.",
      "Gebruik aflosvrije maanden alleen als apart scenario: rente kan doorlopen en de looptijd kan verschuiven.",
    ],
    commonMistakes: [
      "Denken dat een lager draagkrachtbedrag de wettelijke schuldtermijn verlaagt.",
      "Niet controleren of DUO automatisch of op aanvraag rekening houdt met inkomen.",
      "Vergeten dat minder aflossen kan betekenen dat de schuld langer blijft staan.",
    ],
    relatedTools: ["duo-doorlenen-of-stoppen", "duo-maandbedrag", "duo-extra-aflossen"],
    sourceIds: [
      "duo-berekening-maandbedrag",
      "duo-minder-of-niets-aflossen",
      "duo-aflosvrije-periode",
      "duo-terugbetalingsregels",
    ],
  },
  {
    id: "duo-na-35-jaar",
    title: "Wat er na 35 jaar gebeurt",
    summary:
      "Onder SF35 is de aflosfase maximaal 35 jaar. Als er na de aflosperiode nog schuld overblijft, kan DUO die restschuld kwijtschelden volgens de geldende regels.",
    whenRelevant:
      "Relevant als je naar draagkracht betaalt, een lage maandtermijn hebt of wilt begrijpen waarom de looptijd belangrijk is.",
    checklist: [
      "Controleer of je onder SF35 of een andere terugbetalingsregel valt.",
      "Kijk naar resterende looptijd, niet alleen naar het maandbedrag.",
      "Maak een scenario met wettelijke termijn en een scenario met draagkrachtbetaling.",
      "Controleer bijzondere situaties in Mijn DUO, bijvoorbeeld partnerinkomen of buitenlands inkomen.",
    ],
    commonMistakes: [
      "Alle terugbetalingsregels behandelen alsof ze 35 jaar duren.",
      "Kwijtschelding als zekerheid behandelen zonder je eigen voorwaarden te controleren.",
      "Alleen naar totale schuld kijken en niet naar het verloop van rente en betalingen.",
    ],
    relatedTools: ["duo-doorlenen-of-stoppen", "duo-maandbedrag", "duo-extra-aflossen"],
    sourceIds: [
      "duo-zo-werkt-terugbetalen",
      "duo-minder-of-niets-aflossen",
      "duo-uw-inkomen",
    ],
  },
  {
    id: "studieschuld-en-hypotheek",
    title: "Studieschuld en je hypotheek",
    summary:
      "Een studieschuld staat niet bij BKR, maar je moet de schuld wel melden bij een hypotheekaanvraag. Geldverstrekkers wegen de maandlast mee in je leencapaciteit.",
    whenRelevant:
      "Relevant als je wilt kopen, wilt weten hoeveel hypotheekruimte je studieschuld kost of wilt zien wat extra aflossen verandert.",
    checklist: [
      "Gebruik niet alleen je huidige DUO-incasso, maar kijk ook naar de wettelijke maandtermijn.",
      "Bereken eerst je DUO-maandbedrag en daarna de impact op hypotheekruimte.",
      "Controleer of extra aflossen vooral je maandtermijn of je looptijd verandert.",
      "Houd eigen geld, buffer en woningwaarde apart van je studieschuldscenario.",
    ],
    commonMistakes: [
      "Aannemen dat niet-BKR betekent dat de schuld niet meetelt.",
      "Alleen naar maximale hypotheek kijken en niet naar betaalbaarheid na aankoop.",
      "Extra aflossen automatisch als beste route behandelen zonder de rest van je situatie te bekijken.",
    ],
    relatedTools: [
      "hypotheek-impact-studieschuld",
      "duo-maandbedrag",
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "familiehulp-eerste-woning",
    ],
    sourceIds: [
      "rijksoverheid-studieschuld-hypotheek",
      "duo-berekening-maandbedrag",
      "tijdelijke-regeling-hypothecair-krediet-2026",
      "nibud-advies-hypotheeknormen-2026",
    ],
  },
  {
    id: "duo-extra-aflossen",
    title: "Extra aflossen bij DUO",
    summary:
      "Je mag bij DUO vrijwillig extra betalen. Dat kan invloed hebben op je resterende schuld, maandbedrag, einddatum en totale rentelast.",
    whenRelevant:
      "Relevant als je een eenmalig bedrag of extra maandbedrag wilt doorrekenen zonder daar meteen een advies aan te koppelen.",
    checklist: [
      "Bepaal eerst je huidige of wettelijke maandtermijn.",
      "Kies of je de extra betaling wilt bekijken als lagere maandlast of kortere looptijd.",
      "Houd rekening met de gewone maandelijkse incasso naast een extra betaling.",
      "Controleer in Mijn DUO hoe DUO een extra betaling verwerkt en of herberekening mogelijk is.",
    ],
    commonMistakes: [
      "Extra betalingen zien als vooruitbetaling van maandbedragen.",
      "Niet controleren of de maandelijkse incasso gewoon doorloopt.",
      "De rentebesparing als gegarandeerde uitkomst behandelen terwijl rente later opnieuw kan worden vastgesteld.",
    ],
    relatedTools: ["duo-extra-aflossen", "duo-maandbedrag", "schulden-volgorde"],
    sourceIds: [
      "duo-extra-betaling-doen",
      "duo-in-een-keer-aflossen",
      "duo-maandbedrag-verhogen",
      "duo-berekening-maandbedrag",
    ],
  },
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
    visibility: "hidden",
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
    visibility: "hidden",
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
    visibility: "hidden",
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
    visibility: "hidden",
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
    visibility: "hidden",
  },
];
