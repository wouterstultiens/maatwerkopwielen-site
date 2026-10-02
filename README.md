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

Per auto is het kenteken genoeg voor de voertuiggegevens. Tijdens de build haalt
de site bij RDW Open Data op: merk, model, bouwjaar, kleur, carrosserie, deuren,
zitplaatsen, brandstof, vermogen, motorinhoud, trekgewicht, APK-datum, het
NAP-oordeel en bij plug-ins en EV's de elektrische actieradius. Geen API-sleutel nodig.

RDW kent níet: kilometerstand, transmissie, uitvoering, prijs, opties en foto's.
Die vul je zelf in.

1. Zet de foto's in `public/aanbod/<kenteken>/` (bijv. `01.jpg`, `02.jpg`). Liggend, ca. 1600 px breed, onder de 500 kB per foto. De eerste foto is de hoofdfoto.
2. Voeg in `data/aanbod.json` een blok toe (kopieer het voorbeeld):

   ```json
   {
     "kenteken": "HLZ-85-B",
     "online": true,
     "status": "beschikbaar",
     "uitvoering": "1.5 TSI Style",
     "kilometerstand": 68500,
     "transmissie": "Handgeschakeld",
     "prijs": 24950,
     "btw": "btw",
     "aanbieder": "Particulier",
     "locatie": "Heerde",
     "fotos": ["/aanbod/hlz85b/01.jpg", "/aanbod/hlz85b/02.jpg"],
     "omschrijving": "Een paar zinnen over staat, onderhoud en reden van verkoop.",
     "opties": ["Navigatie", "Trekhaak"]
   }
   ```

   - `online`: `true` om te tonen, `false` om te verbergen
   - `status`: `beschikbaar`, `gereserveerd` of `verkocht`
   - `prijs`: verkoopprijs zoals de koper betaalt (incl. btw), zonder punt of euroteken
   - `btw`: `btw` (excl.-prijs wordt berekend) of `marge` (geen btw te verrekenen)
3. Commit en push: de site bouwt de pagina's vanzelf.

**Iets van RDW aanpassen?** Zet het veld zelf in het blok, dat gaat altijd voor.
Bijvoorbeeld `"kleur": "Indium Grey metallic"`, `"model": "Caddy Maxi"` of
`"brandstof": "Hybride (benzine)"` (RDW registreert niet elke hybride als hybride).
Bij hybrides geeft RDW alleen het vermogen van de verbrandingsmotor; de site zet
daar "(benzinemotor)" achter. Vul je zelf `vermogen_pk` in (bijv. het
systeemvermogen), dan verdwijnt die toelichting.
Andere velden: `merk`, `bouwjaar`, `carrosserie`, `deuren`, `zitplaatsen`,
`vermogen_pk`, `actieradius_km`, `motorinhoud_cc`, `trekgewicht_kg`, `apk_tot`, `slug`.

**Build mislukt?** Kan een kenteken niet bij RDW worden gevonden (tikfout) of is
RDW onbereikbaar, dan stopt de build met een melding `[aanbod] Kenteken ...`.
De live site blijft dan zoals hij was. Controleer het kenteken, of vul `merk`
en `model` zelf in zodat de auto ook zonder RDW gebouwd kan worden.

Aanvragen via het formulier op een autopagina gaan naar dezelfde inbox als de intake (zie `public/aanbod.js`) en sturen in GTM het event `formulier_verzonden` met `formulier_naam: aanbod`.
