<!-- README.md -->
# Maatwerk op Wielen – Auto-makelaar

Onafhankelijk, persoonlijk en transparant advies bij het kopen of verkopen van uw auto.

## Ontwikkelen

```bash
npm install
npm run dev          # lokaal
npm run build        # productie-build

## Aanbod: een auto toevoegen

Het aanbod staat op `/aanbod/`, elke auto krijgt een eigen pagina op `/aanbod/<slug>/`.

1. Zet de foto's in `public/aanbod/<slug>/` (bijv. `01.jpg`, `02.jpg`). Liggend, ca. 1600 px breed, onder de 500 kB per foto. De eerste foto is de hoofdfoto.
2. Voeg in `data/aanbod.json` een blok toe (kopieer het voorbeeld) en vul in:
   - `slug`: deel van de url, kleine letters en streepjes, uniek
   - `online`: `true` om te tonen, `false` om te verbergen
   - `status`: `beschikbaar`, `gereserveerd` of `verkocht`
   - `prijs`: verkoopprijs zoals de koper betaalt (incl. btw), zonder punt of euroteken
   - `btw`: `btw` (excl.-prijs wordt berekend) of `marge` (geen btw te verrekenen)
   - `fotos`: lijst met paden, bijv. `"/aanbod/<slug>/01.jpg"`
   - overige velden zijn optioneel en verdwijnen als ze leeg zijn
3. Commit en push: de site bouwt de pagina's vanzelf.

Aanvragen via het formulier op een autopagina gaan naar dezelfde inbox als de intake (zie `public/aanbod.js`) en sturen in GTM het event `formulier_verzonden` met `formulier_naam: aanbod`.
