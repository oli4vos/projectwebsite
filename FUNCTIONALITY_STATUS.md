# Functionaliteit Status

Dit bestand houdt centraal bij:

- wat nu actief is;
- wat bewust uit staat;
- wat later gepland is;
- en hoe je uitgeschakelde functionaliteit veilig heractiveert.

## Beleid

- Oude functionaliteit wordt **niet verwijderd** als die later nog nodig kan zijn.
- Oude functionaliteit wordt bij voorkeur:
  - via feature-flag uitgeschakeld;
  - in UI/UX verborgen;
  - technisch intact gehouden voor snelle heractivatie.
- Verwijderen van functionaliteit mag alleen als expliciet besloten is dat hergebruik niet meer gewenst is.

## Nu actief

- Toolbibliotheek + categorie-navigatie
- Alle publieke calculators uit app-registry
- Centrale tax/DUO/pension/financial constants lagen
- Submit-driven calculatorflow (waar toegepast)
- Centrale chart-formatting en tooltips

## Bewust uitgeschakeld

### Profielfunctie (tijdelijk)

- Status: **uit**
- Flag: `NEXT_PUBLIC_ENABLE_PROFILE`
- Actuele waarde voor uit-stand: niet `1` (of unset)
- Gedrag:
  - profiel-UI en profiel-CTA’s zijn verborgen;
  - tools draaien zonder profielprefill;
  - code blijft aanwezig.

Heractiveren:

1. Zet `NEXT_PUBLIC_ENABLE_PROFILE=1`.
2. Herstart dev/build.
3. Verifieer `/profiel`, header CTA’s en tool-startblokken.

### Kennisniveau (tijdelijk)

- Status: **uit**
- Flag: `NEXT_PUBLIC_ENABLE_KNOWLEDGE_LEVEL`
- Actuele waarde voor uit-stand: niet `1` (of unset)
- Gedrag:
  - kennisniveaukeuze en kennisniveau-hints blijven verborgen;
  - code blijft aanwezig.

Heractiveren:

1. Zet `NEXT_PUBLIC_ENABLE_KNOWLEDGE_LEVEL=1`.
2. Herstart dev/build.
3. Verifieer homepage-sectie en tool-hints.

## Toekomstig / gepland

- Verdere centralisatie van tool-UX patronen (inputs, submit, resultaat, verdieping)
- Verdere centralisatie van formattering en UI-copy
- Eventuele gefaseerde herintroductie van profiel/kennisniveau op productmoment

## Wijzigingsprotocol

Bij elke wijziging in flags of zichtbaarheid:

1. Update dit bestand.
2. Update relevante sectie in `PROJECT.md`.
3. Benoem in commit wat functioneel uit/aan is gezet en hoe het terug kan.
