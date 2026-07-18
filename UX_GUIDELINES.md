# UX Guidelines

Dit document is de UX-standaard voor alle publieke pagina's en rekentools.

## Kernprincipes

1. Begin bij de vraag van de gebruiker, niet bij het financiële model.
2. Vraag alleen gegevens die nodig zijn voor de eerstvolgende bruikbare uitkomst.
3. Toon invoer voor resultaat. Scroll na een geldige berekening naar de uitkomst.
4. Leg onzekerheid en aannames uit zonder de primaire flow te blokkeren.
5. Gebruik bestaande patronen en componenten voordat een nieuw patroon wordt toegevoegd.
6. Behandel mobiel, toetsenbord en screenreader als standaardgebruik, niet als extra controle.

## Belangrijkste gebruikerspaden

- Oriëntatie: homepage -> stappenplan -> aanbevolen tool.
- Directe keuze: homepage -> doelgroepfilter -> toolkaart.
- Rekenen: toolcontext -> voorbeeld of eigen invoer -> validatie -> resultaat -> verdieping.
- Verdieping: kennisbank of aannames -> bron of relevante tool.
- Herstel: foutpagina of onbekende route -> dashboard of voorbeeldtool.

## Formulieren

- Plaats een zichtbaar label boven ieder veld.
- Gebruik placeholders alleen als voorbeeld, nooit als enige naam.
- Gebruik `inputMode="decimal"` of `inputMode="numeric"` voor financiële invoer op mobiel.
- Houd een veld, helpertekst en foutmelding visueel bij elkaar.
- Gebruik `aria-invalid` bij ongeldige invoer. Dynamische foutmeldingen moeten worden aangekondigd.
- Valideer tijdens invoer alleen wanneer dit helpt. Toon geen fout voordat de gebruiker het veld heeft gebruikt, behalve na een expliciete submitpoging.
- Bewaar financiële formules buiten componenten volgens `AGENTS.md`.
- Bied bij langere tools voorbeeldwaarden en een duidelijke resetactie.

## Mobiele veldflow

- Toon één kernveld tegelijk wanneer het volledige formulier anders te lang of te zwaar wordt.
- Toon `Veld x van y` en een visuele voortgangsindicator.
- Vorige en volgende zijn minimaal 44 px hoog.
- Blokkeer volgende alleen als het huidige veld aantoonbaar ongeldig is.
- Toon op mobiel geen concurrerende berekenknop naast de veldnavigatie.
- De laatste primaire actie heet concreet `Bekijk uitkomst` of een toolspecifieke variant.
- Zorg dat lange opties en suffixen nooit horizontale scroll veroorzaken.

## CTA's

- Gebruik één dominante CTA per stap.
- Schrijf het verwachte resultaat: `Bereken maximale hypotheek` is beter dan `Doorgaan`.
- Secundaire acties zoals voorbeeldwaarden en wissen krijgen minder visuele nadruk.
- Disabled states moeten visueel en programmatisch herkenbaar zijn.
- Voeg zichtbare focus en een subtiele pressed state toe.

## Resultaten

- Begin met een conclusie in gewone taal.
- Toon daarna de belangrijkste bedragen met tabular figures.
- Maak duidelijk of de uitkomst indicatief, educatief of normatief is.
- Scheid contractuele lasten, netto-effect en aannames wanneer die begrippen kunnen worden verward.
- Toon een bruikbare lege status voordat een berekening is uitgevoerd.
- Verberg details achter disclosures, maar verstop geen essentiële waarschuwing.
- Houd schermresultaat en PDF-inhoud inhoudelijk gelijk: het scherm mag compacter tonen, maar mag geen ander resultaatmodel of andere berekening introduceren.

## Visuele rust

- Gebruik één primaire surface per taak: dashboardkaart, invoerpaneel of resultaatpaneel.
- Vermijd losse kaartstapeling binnen kaartstapeling; gebruik `surface-subtle`, borders of witruimte voor secundaire groepen.
- CTA's staan dicht bij de taak waarop ze betrekking hebben en concurreren niet met PDF- of resetacties.
- In mobiele flows is het formulier leidend; resultaat en verdieping volgen na submit.

## Fouten en herstel

- Benoem wat misging en wat de gebruiker kan doen.
- Gebruik geen `alert()` voor formfouten.
- Behoud geldige invoer na een fout.
- Geef netwerk- of laadfouten een herlaadactie en een route terug naar het dashboard.
- Laat een downloadactie niet stil falen. Toon bij toekomstige async-acties een succes- of foutstatus.

## Toegankelijkheid

- Gebruik precies één `h1` per pagina en een logische kopvolgorde daaronder.
- Gebruik `<main>`, `<nav>`, `<section>`, `<article>`, `<form>` en `<button>` semantisch.
- Alle interactieve elementen zijn met toetsenbord bereikbaar en hebben zichtbare focus.
- Richt op WCAG 2.2 AA. Normale tekst heeft minimaal 4.5:1 contrast; grote tekst minimaal 3:1.
- Primaire touch targets zijn ongeveer 44 bij 44 px. Inline begrippen moeten minimaal aan WCAG 2.2 target size voldoen.
- Respecteer `prefers-reduced-motion`.
- Gebruik kleur nooit als enige informatiedrager.

## Responsive regels

- Test minimaal op 390 x 844, 768 x 1024, 1440 x 1000 en een desktopvenster met beperkte hoogte.
- Gebruik één kolom onder `md`, tenzij een compact paar velden aantoonbaar beter werkt.
- Vermijd vaste breedtes en complexe flexberekeningen.
- Beperk leestekst tot ongeveer 65 tot 70 tekens per regel.
- Gebruik `min-height: 100dvh` voor viewportvullende pagina's.
- Controleer expliciet op body-overflow, afgekapt tekstgebruik en sticky elementen.

## Content

- Schrijf Nederlands in gewone taal.
- Leg vaktermen bij eerste gebruik uit via de centrale glossary waar logisch.
- Vermijd dwingend advies. Formuleer als scenario, indicatie of afweging.
- Zet disclaimertekst dicht bij de plek waar de gebruiker een beslissing kan overwaarderen.
- Gebruik consistente labels voor dezelfde begrippen en acties.

## Oplevercheck

- Primaire taak werkt met muis, touch en toetsenbord.
- Geen horizontale scroll op 390 px.
- Labels, foutmeldingen en focus zijn waarneembaar.
- Loading-, empty-, error-, success- en disabled states zijn beoordeeld.
- Voorbeeldwaarden, reset en berekenen werken.
- Resultaat blijft hetzelfde tenzij een inhoudelijke wijziging expliciet is gemotiveerd.
