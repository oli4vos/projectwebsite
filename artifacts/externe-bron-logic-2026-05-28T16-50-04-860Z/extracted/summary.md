# Logic scrape samenvatting

- Gegenereerd op: 2026-05-28T21:45:16.514Z
- Start-URL's: https://www.externe-bron.nl/berekeningen.html
- Toegestane domeinen: externe-bron.nl, www.externe-bron.nl
- Pagina's bezocht: 220
- Scripts opgehaald: 1
- Inline scripts gezien: 1275
- Kandidaten gevonden: 57
- Robots geblokkeerd: 0
- Fouten: 0

## Top 20 logica-kandidaten

### inline-script · score 19 · https://www.externe-bron.nl/hypotheek/hypotheek-oversluiten.html#inline-script
```js
jQuery('#tkm-itm-boetevrijPercentage' + id).show(300);
            jQuery('#tkm-itm-vergelijkingsrente' + id).show(300);
            if (jQuery('#hypotheekvorm' + id).val() == 'spr') {
                jQuery('#tkm-itm-spaarkapitaal' + id).show(300);
                jQuery('#tkm-itm-spaarpremie' + id).show(300);
```

### inline-script · score 17 · https://www.externe-bron.nl/inkomen/verzamelinkomen-berekenen.html#inline-script
```js
let jr = jQuery('#belastingjaar').val();
    jQuery('#tkm-itm-box3vermogen')[(jr < 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3spaargeld')[(jr >= 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3beleggingen')[(jr >= 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3leningen')[(jr >= 2021)? 'show' : 'hide'](300);
```

### inline-script · score 17 · https://www.externe-bron.nl/hypotheek/totale-kosten-hypotheek.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening2')[(dln > '1')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-looptijd2')[(dln > '1')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-rendement2')[(dln > '1' && jQuery('#hypotheekvorm2').val() === 'bel')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-nieuweRente2')[(dln > '1')? 'show' : 'hide'](300);
```

### inline-script · score 17 · https://www.externe-bron.nl/hypotheek/totale-kosten-hypotheek.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening3')[(dln > '2')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-looptijd3')[(dln > '2')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-rendement3')[(dln > '2' && jQuery('#hypotheekvorm3').val() === 'bel')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-nieuweRente3')[(dln > '2')? 'show' : 'hide'](300);
}
```

### inline-script · score 17 · https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening2')[(dln > '1')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-looptijd2')[(dln > '1')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-rendement2')[(dln > '1' && jQuery('#hypotheekvorm2').val() === 'bel')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-nieuweRente2')[(dln > '1')? 'show' : 'hide'](300);
```

### inline-script · score 17 · https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening3')[(dln > '2')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-looptijd3')[(dln > '2')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-rendement3')[(dln > '2' && jQuery('#hypotheekvorm3').val() === 'bel')? 'show' : 'hide'](300);
    jQuery('#tkm-itm-nieuweRente3')[(dln > '2')? 'show' : 'hide'](300);
}
```

### inline-script · score 14 · https://www.externe-bron.nl/inkomen/verzamelinkomen-berekenen.html#inline-script
```js
jQuery('#tkm-itm-box3vermogen')[(jr < 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3spaargeld')[(jr >= 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3beleggingen')[(jr >= 2021)? 'show' : 'hide'](300);
    jQuery('#tkm-itm-box3leningen')[(jr >= 2021)? 'show' : 'hide'](300);
}
```

### inline-script · score 13 · https://www.externe-bron.nl/gezin-en-relatie/gesubsidieerde-rechtsbijstand.html#inline-script
```js
e = jQuery('#tkm-itm-inkomenPartner label');
    	e.html(e.html().replace(/(20\d\d|%s)/, String(yr-2)));
        e = jQuery('#tkm-itm-box3 label');
    	e.html(e.html().replace(/(20\d\d|%s)/, String(yr-2)));
    }
```

### inline-script · score 13 · https://www.externe-bron.nl/hypotheek/hypotheek-oversluiten.html#inline-script
```js
jQuery('#tkm-itm-rendement' + id).hide(300);
        }
        if (jQuery('#boeterenteBekend' + id).val() == 'y') {
            jQuery('#tkm-itm-boeterente' + id).show(300);
            jQuery('#tkm-itm-boetevrijPercentage' + id).hide(300);
```

### inline-script · score 12 · https://www.externe-bron.nl/inkomen/belasting-box1-verschil.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/werk-en-inkomen/box1-belastingdruk-berekenen.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/inkomen/verzamelinkomen-berekenen.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/inkomen/toetsingsinkomen-berekenen.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/werk-en-inkomen/algemene-heffingskorting.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/ondernemen/optimaal-inkomen-belastingdruk-dga.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/pensioen/extra-pensioenuitkering-bruto-netto.html#inline-script
```js
jQuery('#tkm-itm-eigenwoning').show(300);
        let ew = jQuery('#eigenwoning').val();
        jQuery('#tkm-itm-hypotheekrenteaftrek')[(ew === 'y')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-wozwaarde')[(ew === 'y')? 'show' : 'hide'](300);
    }
```

### inline-script · score 12 · https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html#inline-script
```js
}
                /*if (this.id === 'tkm-itm-rendementHd'+n) {
                    j[(jQuery('#hypotheekvormHd'+n).val() === 'bel')? 'show' : 'hide'](300);
                } else {
                    if (this.id === 'tkm-itm-hypotheekleningHd'+n) {
```

### inline-script · score 11 · https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening2').show(300);
        jQuery('#tkm-itm-afgeslotenPeriode2').show(300);
        jQuery('#tkm-itm-rendement2')[(jQuery('#hypotheekvorm2').val() === 'bel')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-aftrekbaar2').show(300);
    } else {
```

### inline-script · score 11 · https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten.html#inline-script
```js
jQuery('#tkm-itm-hypotheeklening3').show(300);
        jQuery('#tkm-itm-afgeslotenPeriode3').show(300);
        jQuery('#tkm-itm-rendement3')[(jQuery('#hypotheekvorm3').val() === 'bel')? 'show' : 'hide'](300);
        jQuery('#tkm-itm-aftrekbaar3').show(300);
    } else {
```

### inline-script · score 10 · https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html#inline-script
```js
j[(jQuery('#hypotheekvormHd'+n).val() === 'bel')? 'show' : 'hide'](300);
                } else {
                    if (this.id === 'tkm-itm-hypotheekleningHd'+n) {
                        console.log(jQuery('#eersteRvpHd'+n).val(), j.find('span.lenlab'));
                        j.find('.tkm-text,input[id$=_datum]')[(jQuery('#eersteRvpHd'+n).val() === 'n')? 'show' : 'hide'](300);
```

