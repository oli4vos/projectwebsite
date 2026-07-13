export type KnowledgeSourceEntry = {
  title: string;
  publisher: string;
  date: string;
  type: string;
  description: string;
  url: string;
  lastChecked?: string;
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
  "duo-rente-terugbetalers": {
    title: "Rente voor terugbetalers",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over rentepercentages voor terugbetalers, rentevaste perioden en de koppeling met terugbetalingsregels.",
    url: "https://www.duo.nl/particulier/rente/rente-voor-terugbetalers.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-rente-studenten": {
    title: "Rente voor studenten",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over rente tijdens de studie en actuele rentepercentages voor studenten per terugbetalingsregel.",
    url: "https://www.duo.nl/particulier/rente/rente-voor-studenten.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-gift-of-terugbetalen": {
    title: "Gift of terugbetalen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over prestatiebeurs, giftomzetting, rentedragende lening, collegegeldkrediet en de 10-jaarstermijn voor mbo 3/4, hbo en universiteit.",
    url: "https://www.duo.nl/particulier/studiefinanciering/gift-of-terugbetalen.jsp",
    lastChecked: "2026-07-13",
  },
  "duo-rente-als-studiefinanciering-stopt": {
    title: "Rente als uw studiefinanciering stopt",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over rentevastzetting na stoppen met studeren, de aanloopfase en rente op de prestatiebeurs.",
    url: "https://www.duo.nl/particulier/rente/rente-als-uw-studiefinanciering-stopt.jsp",
    lastChecked: "2026-07-13",
  },
  "duo-studievertraging": {
    title: "Studievertraging",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over regelingen bij studievertraging, diplomatermijn en de gevolgen voor prestatiebeurs en nieuwe aanspraak.",
    url: "https://www.duo.nl/particulier/studievertraging/",
    lastChecked: "2026-07-13",
  },
  "duo-hoelang-recht": {
    title: "Hoelang recht",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over de 10-jaarsperiode voor studiefinanciering voor mbo 3/4, hbo en universiteit.",
    url: "https://www.duo.nl/particulier/studiefinanciering/hoelang-recht.jsp",
    lastChecked: "2026-07-13",
  },
  "duo-studentenreisproduct-hoelang-recht": {
    title: "Hoelang recht – Studentenreisproduct",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over de diplomatermijn en het studentenreisproduct, inclusief opnieuw recht bij overstap.",
    url: "https://www.duo.nl/particulier/ov-en-reizen/hoelang-recht.jsp",
    lastChecked: "2026-07-13",
  },
  "duo-terugbetalingsregels": {
    title: "Terugbetalingsregels",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over SF15, SF35, looptijd, rentevastperiode en regels voor terugbetalers.",
    url: "https://www.duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
    lastChecked: "2026-07-13",
  },
  "duo-nieuwe-rentepercentages-2026": {
    title: "Nieuwe rentepercentages bekend",
    publisher: "DUO",
    date: "10 oktober 2025",
    type: "Actuele uitvoeringsinformatie",
    description:
      "DUO-nieuwsbericht met de rentepercentages voor 2026 voor SF35 en SF15.",
    url: "https://www.duo.nl/particulier/home/actueel/nieuwe-rentepercentages.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-zo-werkt-terugbetalen": {
    title: "Zo werkt terugbetalen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over maandbedrag, looptijd, terugbetalingsregels en vrijwillig meer terugbetalen.",
    url: "https://duo.nl/particulier/studieschuld-terugbetalen/zo-werkt-terugbetalen.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-berekening-maandbedrag": {
    title: "Berekening maandbedrag",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over wettelijk maandbedrag, draagkracht en het gebruik van inkomen en partnerinkomen.",
    url: "https://duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-minder-of-niets-aflossen": {
    title: "Wat is er mogelijk?",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over maandbedrag verlagen, peiljaarverlegging, aflosvrije periode en gevolgen voor rente en looptijd.",
    url: "https://duo.nl/particulier/minder-of-niets-aflossen/wat-is-er-mogelijk.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-aflosvrije-periode": {
    title: "Aflosvrije periode",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over maximaal 60 maanden aflosvrije periode, doorlopende rente en verlenging van de terugbetalingsperiode.",
    url: "https://duo.nl/particulier/minder-of-niets-aflossen/aflosvrije-periode.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-u-studeert-nog": {
    title: "U studeert nog",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over stoppen van aflossing wanneer iemand studeert en over de aanloopfase na het stoppen van studiefinanciering.",
    url: "https://duo.nl/particulier/minder-of-niets-aflossen/u-studeert-nog.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-eerder-extra-aflossen": {
    title: "Eerder of extra aflossen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over eerder of extra aflossen en de aanloopfase waarin DUO nog niet automatisch mag afschrijven.",
    url: "https://duo.nl/particulier/eerder-of-extra-aflossen/index.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-extra-betaling-doen": {
    title: "Extra betaling doen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over extra betalingen, verwerking, automatische incasso en herberekening van maandbedrag.",
    url: "https://www.duo.nl/particulier/eerder-of-extra-aflossen/extra-betaling-doen.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-in-een-keer-aflossen": {
    title: "In 1 keer aflossen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over volledige aflossing ineens en dat daarbij geen boete of korting geldt.",
    url: "https://duo.nl/particulier/eerder-of-extra-aflossen/in-een-keer-aflossen.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-maandbedrag-verhogen": {
    title: "Maandbedrag verhogen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over vrijwillig het maandbedrag verhogen, voorwaarden en ingangsdatum.",
    url: "https://www.duo.nl/particulier/eerder-of-extra-aflossen/maandbedrag-verhogen.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-lenen-studiefinanciering": {
    title: "Lenen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over lenen binnen studiefinanciering en renteopbouw vanaf de maand na ontvangst.",
    url: "https://duo.nl/particulier/studiefinanciering/lenen.jsp",
    lastChecked: "2026-07-05",
  },
  "duo-uw-inkomen": {
    title: "Uw inkomen",
    publisher: "DUO",
    date: "Actuele DUO-pagina",
    type: "Primaire uitvoeringsbron",
    description:
      "DUO-uitleg over inkomen, terugbetalen naar draagkracht en situaties waarin kwijtschelding niet geldt.",
    url: "https://duo.nl/particulier/studieschuld-terugbetalen/uw-inkomen.jsp",
    lastChecked: "2026-07-05",
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
    "duo-berekening-maandbedrag",
    "tijdelijke-regeling-hypothecair-krediet-2026",
    "nibud-advies-hypotheeknormen-2026",
    "hypotheker-studieschuld-2026",
  ],
  "duo-rente-werkt": [
    "duo-rente-terugbetalers",
    "duo-rente-studenten",
    "duo-nieuwe-rentepercentages-2026",
    "duo-lenen-studiefinanciering",
  ],
  "duo-studeren-stoppen": [
    "duo-gift-of-terugbetalen",
    "duo-rente-studenten",
    "duo-rente-als-studiefinanciering-stopt",
    "duo-studievertraging",
    "duo-hoelang-recht",
    "duo-studentenreisproduct-hoelang-recht",
    "duo-terugbetalingsregels",
    "duo-berekening-maandbedrag",
    "duo-aflosvrije-periode",
    "duo-u-studeert-nog",
    "duo-lenen-studiefinanciering",
  ],
  "duo-aanloopfase": [
    "duo-eerder-extra-aflossen",
    "duo-u-studeert-nog",
    "duo-lenen-studiefinanciering",
  ],
  "duo-draagkracht-jokerjaren": [
    "duo-berekening-maandbedrag",
    "duo-minder-of-niets-aflossen",
    "duo-aflosvrije-periode",
    "duo-terugbetalingsregels",
  ],
  "duo-na-35-jaar": [
    "duo-zo-werkt-terugbetalen",
    "duo-minder-of-niets-aflossen",
    "duo-uw-inkomen",
  ],
  "duo-extra-aflossen": [
    "duo-extra-betaling-doen",
    "duo-in-een-keer-aflossen",
    "duo-maandbedrag-verhogen",
    "duo-berekening-maandbedrag",
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
  "duo-rente-werkt": "Hoe DUO-rente werkt",
  "duo-aanloopfase": "De aanloopfase",
  "duo-draagkracht-jokerjaren": "Draagkracht en jokerjaren",
  "duo-na-35-jaar": "Wat er na 35 jaar gebeurt",
  "duo-extra-aflossen": "Extra aflossen bij DUO",
  "duo-studeren-stoppen": "Studeren stoppen en DUO",
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
  {
    label: "DUO-uitvoering",
    sourceIds: [
      "duo-rente-terugbetalers",
      "duo-berekening-maandbedrag",
      "duo-minder-of-niets-aflossen",
      "duo-extra-betaling-doen",
      "duo-gift-of-terugbetalen",
      "duo-rente-als-studiefinanciering-stopt",
      "duo-studievertraging",
      "duo-hoelang-recht",
      "duo-studentenreisproduct-hoelang-recht",
      "duo-terugbetalingsregels",
    ],
    useFor: "Uitvoeringsregels en publieksuitleg voor studieschuld en terugbetalen.",
  },
] as const;
