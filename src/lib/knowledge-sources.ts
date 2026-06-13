export type KnowledgeSourceEntry = {
  title: string;
  publisher: string;
  date: string;
  type: string;
  description: string;
  url: string;
};

export const knowledgeSources = {
  "tijdelijke-regeling-hypothecair-krediet-2026": {
    title: "Tijdelijke regeling hypothecair krediet 2026",
    publisher: "Staatscourant / officiële bekendmakingen",
    date: "31 oktober 2025",
    type: "Primaire juridische bron",
    description:
      "De wettelijke regeling waarin de maximale hypotheek ten opzichte van inkomen en woningwaarde wordt vastgesteld. Bevat de basis voor LTI, LTV, financieringslastpercentages en uitzonderingen.",
    url: "https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html",
  },
  "nibud-advies-hypotheeknormen-2026": {
    title: "Advies hypotheeknormen 2026",
    publisher: "Nibud",
    date: "30 september 2025",
    type: "Normadvies / beleidsbasis",
    description:
      "Adviesrapport waarop de jaarlijkse hypotheeknormen worden gebaseerd. Bevat uitleg over financieringslastpercentages, inkomensgroepen, rente, huishoudbudgetten en wijzigingen voor 2026.",
    url: "https://www.nibud.nl/onderzoeksrapporten/rapport-advies-hypotheeknormen-2026-2025/",
  },
  "volkshuisvesting-leennormen-hypotheek": {
    title: "Leennormen voor hypotheken",
    publisher: "Volkshuisvesting Nederland",
    date: "Actuele overheidspagina",
    type: "Overheidsuitleg",
    description:
      "Publieke uitleg over de Tijdelijke regeling hypothecair krediet en de werking van leennormen voor hypotheken.",
    url: "https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet",
  },
  "afm-hypothecair-krediet": {
    title: "Hypothecair krediet",
    publisher: "Autoriteit Financiële Markten",
    date: "Actuele toezichtinformatie",
    type: "Toezichtbron",
    description:
      "AFM-pagina over hypothecair krediet, waaronder de toetsrente voor hypotheken met een rentevaste periode korter dan tien jaar.",
    url: "https://www.afm.nl/nl-nl/sector/themas/dienstverlening-aan-consumenten/financiele-producten/hypothecair-krediet",
  },
  "afm-toetsrente-q3-2026": {
    title: "Toetsrente hypotheken derde kwartaal 2026 is 5%",
    publisher: "Autoriteit Financiële Markten",
    date: "juni 2026",
    type: "Actuele toezichtinformatie",
    description:
      "AFM-publicatie waarin staat dat de toetsrente voor het derde kwartaal van 2026 5% bedraagt. Relevant bij rentevaste perioden korter dan tien jaar.",
    url: "https://www.afm.nl/nl-nl/sector/actueel/2026/jun/sb-toetstrente-q3-2026",
  },
  "rijksoverheid-studieschuld-hypotheek": {
    title: "Hoe zwaar telt mijn studieschuld mee voor mijn hypotheek?",
    publisher: "Rijksoverheid",
    date: "Actuele publieksinformatie",
    type: "Overheidsuitleg",
    description:
      "Uitleg van de Rijksoverheid over hoe een studieschuld meeweegt bij het bepalen van de maximale hypotheek en waarom extra aflossen de hypotheekruimte kan verhogen.",
    url: "https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
  },
  "rijksoverheid-leennormen-2026": {
    title: "Leennormen 2026: hypotheek kan iets omhoog door verwachte loonstijging",
    publisher: "Rijksoverheid",
    date: "31 oktober 2025",
    type: "Beleidsnieuws",
    description:
      "Nieuwsbericht over de hypotheeknormen voor 2026, waaronder de rol van loonstijging, energielabels en extra leenruimte.",
    url: "https://www.rijksoverheid.nl/actueel/nieuws/2025/10/31/leennormen-2026-hypotheek-kan-iets-omhoog-door-verwachte-loonstijging",
  },
  "afm-consumenten-hypotheek-betalen": {
    title: "Kun je de hypotheek betalen?",
    publisher: "Autoriteit Financiële Markten",
    date: "Actuele consumentenpagina",
    type: "Consumentenuitleg",
    description:
      "AFM-uitleg over inkomenstoets, loan-to-income en financieringslastpercentages.",
    url: "https://www.afm.nl/nl-nl/consumenten/themas/hypotheken/hypotheek-betalen",
  },
  "hypotheker-studieschuld-2026": {
    title: "Hypotheek afsluiten met studieschuld in 2026?",
    publisher: "De Hypotheker",
    date: "Actuele praktijkuitleg",
    type: "Praktijkbron",
    description:
      "Praktische uitleg over de invloed van studieschuld op hypotheekruimte. Alleen gebruiken als aanvullende uitleg, niet als primaire normbron.",
    url: "https://www.hypotheker.nl/begrippenlijst/veelgestelde-vragen/studieschuld-en-hypotheek/",
  },
} as const satisfies Record<string, KnowledgeSourceEntry>;

export type KnowledgeSourceId = keyof typeof knowledgeSources;

export const knowledgeDocumentSourceGroups = {
  "maximale-hypotheek-berekenen": [
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "nibud-advies-hypotheeknormen-2026",
    "volkshuisvesting-leennormen-hypotheek",
    "afm-consumenten-hypotheek-betalen",
    "afm-hypothecair-krediet",
  ],
  "studieschuld-en-hypotheek": [
    "rijksoverheid-studieschuld-hypotheek",
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "nibud-advies-hypotheeknormen-2026",
    "hypotheker-studieschuld-2026",
  ],
  "waarom-calculators-verschillen": [
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "nibud-advies-hypotheeknormen-2026",
    "afm-hypothecair-krediet",
    "afm-toetsrente-q3-2026",
    "rijksoverheid-leennormen-2026",
  ],
  "eigen-geld-familiehulp-schenking": [
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "afm-consumenten-hypotheek-betalen",
  ],
  "energielabel-en-extra-hypotheekruimte": [
    "rijksoverheid-leennormen-2026",
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "nibud-advies-hypotheeknormen-2026",
  ],
  "starter-of-doorstromer": [
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "afm-consumenten-hypotheek-betalen",
    "afm-hypothecair-krediet",
  ],
  "indicatieve-berekening": [
    "afm-consumenten-hypotheek-betalen",
    "rijksoverheid-studieschuld-hypotheek",
    "volkshuisvesting-leennormen-hypotheek",
  ],
} as const satisfies Record<string, readonly KnowledgeSourceId[]>;

export const knowledgeDocumentTitles = {
  "maximale-hypotheek-berekenen": "Maximale hypotheek berekenen",
  "studieschuld-en-hypotheek": "Studieschuld en hypotheek",
  "waarom-calculators-verschillen": "Waarom calculators verschillen",
  "eigen-geld-familiehulp-schenking": "Eigen geld, familiehulp en schenking",
  "energielabel-en-extra-hypotheekruimte": "Energielabel en extra hypotheekruimte",
  "starter-of-doorstromer": "Starter of doorstromer",
  "indicatieve-berekening": "Indicatieve berekening",
} as const satisfies Record<keyof typeof knowledgeDocumentSourceGroups, string>;

export const knowledgeSourceEntries = Object.entries(
  knowledgeSources,
) as ReadonlyArray<[KnowledgeSourceId, KnowledgeSourceEntry]>;

export const knowledgeDocumentGroupEntries = Object.entries(
  knowledgeDocumentSourceGroups,
) as ReadonlyArray<
  [keyof typeof knowledgeDocumentSourceGroups, readonly KnowledgeSourceId[]]
>;

export const knowledgeSourceHierarchy = [
  {
    label: "Wet / regeling",
    sourceIds: ["tijdelijke-regeling-hypothecair-krediet-2026"],
    useFor: "Juridische basis van de hypotheeknormen.",
  },
  {
    label: "Normadvies",
    sourceIds: ["nibud-advies-hypotheeknormen-2026"],
    useFor: "Onderliggende normberekening en uitleg per jaar.",
  },
  {
    label: "Toezichthouder",
    sourceIds: ["afm-hypothecair-krediet", "afm-toetsrente-q3-2026"],
    useFor: "Toetsrente en consumenten-uitleg over krediettoetsing.",
  },
  {
    label: "Overheidsuitleg",
    sourceIds: [
      "volkshuisvesting-leennormen-hypotheek",
      "rijksoverheid-studieschuld-hypotheek",
      "rijksoverheid-leennormen-2026",
    ],
    useFor: "Publieke uitleg en duiding van de wettelijke regels.",
  },
  {
    label: "Praktijkbronnen",
    sourceIds: ["hypotheker-studieschuld-2026"],
    useFor: "Aanvullende uitleg; nooit leidend boven wet of normadvies.",
  },
] as const;
