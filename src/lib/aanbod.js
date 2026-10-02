/* ==========================================================================
   Aanbod: hulpfuncties rond data/aanbod.json
   Een auto staat alleen op de site als "online" op true staat.

   Per auto is een kenteken genoeg voor de voertuiggegevens: tijdens de build
   halen we merk, model, bouwjaar, kleur, brandstof, vermogen enz. op bij RDW
   Open Data. Alles wat in aanbod.json zelf staat, gaat voor op RDW. Zo kun je
   bijvoorbeeld "GRIJS" overschrijven met "Indium Grey metallic".
   ========================================================================== */

import alleAutos from "../../data/aanbod.json";

const BTW = 0.21;
const euro = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

const RDW_VOERTUIG = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const RDW_BRANDSTOF = "https://opendata.rdw.nl/resource/8ys7-d773.json";
const AFKORTINGEN = ["BMW", "MG", "DS", "BYD", "VW", "GMC", "KGM", "XEV", "MPV", "SUV"];

export function kaalKenteken(k) {
  return String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/* Streepjes volgens de RDW-sidecodes: splits op de overgang letter/cijfer,
   en een blok van vier tekens wordt 2-2 (XX-99-99, 99-XX-99 enz.). */
export function kentekenMetStreepjes(k) {
  const delen = kaalKenteken(k).match(/[A-Z]+|[0-9]+/g) || [];
  const uit = [];
  delen.forEach((d) => (d.length === 4 ? uit.push(d.slice(0, 2), d.slice(2)) : uit.push(d)));
  return uit.join("-");
}

function netjes(woord) {
  if (AFKORTINGEN.includes(woord) || woord.length <= 2 || /\d/.test(woord)) return woord;
  return woord.charAt(0) + woord.slice(1).toLowerCase();
}

function hoofdletters(tekst) {
  return String(tekst || "")
    .split(/(\s+|-)/)
    .map((w) => (/^[A-Z]+$/.test(w) ? netjes(w) : w))
    .join("");
}

function geregistreerd(v) {
  return v && !["Niet geregistreerd", "Niet van toepassing", "DIVERSEN", "Diversen"].includes(v) ? v : null;
}

function brandstofLabel(rijen) {
  const soorten = rijen.map((r) => r.brandstof_omschrijving).filter(Boolean);
  const klasse = rijen.map((r) => r.klasse_hybride_elektrisch_voertuig).find(Boolean) || "";
  if (/^OVC/.test(klasse) || (soorten.includes("Elektriciteit") && soorten.length > 1)) {
    return `Plug-in hybride (${soorten.find((s) => s !== "Elektriciteit")?.toLowerCase() || "benzine"})`;
  }
  if (/NOVC/.test(klasse)) return `Hybride (${(soorten[0] || "benzine").toLowerCase()})`;
  if (soorten.length === 1 && soorten[0] === "Elektriciteit") return "Elektrisch";
  return soorten[0] || null;
}

function vermogenPk(rijen) {
  const kw = Math.max(
    0,
    ...rijen.flatMap((r) => [r.nettomaximumvermogen, r.netto_max_vermogen_elektrisch].map(Number).filter(Boolean)),
  );
  return kw ? Math.round(kw * 1.35962) : null;
}

function datum(yyyymmdd) {
  const s = String(yyyymmdd || "");
  return s.length === 8 ? `${s.slice(6)}-${s.slice(4, 6)}-${s.slice(0, 4)}` : null;
}

/* RDW geeft bij drukte soms een 500 of reageert traag. Daarom een paar
   pogingen met oplopende wachttijd voordat we opgeven. */
async function haal(url, pogingen = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error(`RDW gaf status ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= pogingen) throw e;
      await new Promise((ok) => setTimeout(ok, 1000 * 2 ** (i - 1)));
    }
  }
}

async function rdw(kenteken) {
  const q = `?kenteken=${kaalKenteken(kenteken)}`;
  const v = await haal(RDW_VOERTUIG + q);
  const b = await haal(RDW_BRANDSTOF + q);
  const r = v[0];
  if (!r) throw new Error("kenteken niet gevonden bij RDW");

  const trek = Number(r.maximum_trekken_massa_geremd);
  return {
    merk: hoofdletters(r.merk),
    model: hoofdletters(r.handelsbenaming),
    bouwjaar: Number(String(r.datum_eerste_toelating).slice(0, 4)) || null,
    brandstof: brandstofLabel(b),
    vermogen_pk: vermogenPk(b),
    carrosserie: geregistreerd(r.inrichting) ? hoofdletters(r.inrichting.toUpperCase()) : null,
    kleur: geregistreerd(r.eerste_kleur) ? hoofdletters(r.eerste_kleur) : null,
    deuren: Number(r.aantal_deuren) || null,
    zitplaatsen: Number(r.aantal_zitplaatsen) || null,
    motorinhoud_cc: Number(r.cilinderinhoud) || null,
    trekgewicht_kg: trek || null,
    apk_tot: datum(r.vervaldatum_apk),
    nap: r.tellerstandoordeel === "Logisch" ? "Logisch" : null,
  };
}

function slugVan(a) {
  return [a.merk, a.model, a.bouwjaar, kaalKenteken(a.kenteken)]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* Lukt RDW niet en staan merk en model ook niet in aanbod.json, dan stopt de
   build met een duidelijke melding. De live site blijft dan zoals hij was,
   in plaats van dat een auto ongemerkt verdwijnt. */
async function verrijk(a) {
  // Velden die in aanbod.json staan, winnen. Lege waarden tellen niet mee.
  const eigen = Object.fromEntries(Object.entries(a).filter(([, v]) => v !== "" && v != null));
  let basis = {};
  if (a.kenteken) {
    try {
      basis = await rdw(a.kenteken);
    } catch (e) {
      if (!eigen.merk || !eigen.model) {
        throw new Error(`[aanbod] Kenteken ${a.kenteken}: ${e.message}. Controleer het kenteken of vul merk en model zelf in.`);
      }
      console.warn(`[aanbod] RDW-gegevens voor ${a.kenteken} niet opgehaald (${e.message}), alleen eigen gegevens gebruikt`);
    }
  }
  const auto = { ...basis, ...eigen };
  if (!auto.merk || !auto.model) {
    throw new Error(`[aanbod] ${a.slug || "Auto zonder kenteken"}: vul een kenteken in, of merk en model.`);
  }
  auto.slug = auto.slug || slugVan(auto);
  auto.fotos = auto.fotos?.length ? auto.fotos : ["/unnamed.png"];
  return auto;
}

export const autos = [];
for (const a of alleAutos.filter((a) => a.online)) autos.push(await verrijk(a));

export function titel(a) {
  return `${a.merk} ${a.model}`;
}

export function volledigeTitel(a) {
  return [a.merk, a.model, a.uitvoering].filter(Boolean).join(" ");
}

export function bedrag(n) {
  return "€ " + euro.format(n);
}

/* "prijs" in de data is altijd wat de koper betaalt, dus incl. btw.
   Bij een marge-auto is er geen btw te verrekenen en tonen we geen excl.-prijs. */
export function prijzen(a) {
  const incl = a.prijs;
  const excl = a.btw === "btw" ? Math.round(incl / (1 + BTW)) : null;
  return { incl, excl };
}

export function btwLabel(a) {
  return a.btw === "btw" ? "incl. 21% btw" : "marge, btw niet verrekenbaar";
}

export function km(n) {
  return euro.format(n) + " km";
}

export function getal(n) {
  return euro.format(n);
}

export const statusLabel = {
  beschikbaar: null,
  gereserveerd: "Gereserveerd",
  verkocht: "Verkocht",
};
