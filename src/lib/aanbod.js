/* ==========================================================================
   Aanbod: hulpfuncties rond data/aanbod.json
   Een auto staat alleen op de site als "online" op true staat.
   ========================================================================== */

import alleAutos from "../../data/aanbod.json";

const BTW = 0.21;
const euro = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

export const autos = alleAutos.filter((a) => a.online);

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

export const statusLabel = {
  beschikbaar: null,
  gereserveerd: "Gereserveerd",
  verkocht: "Verkocht",
};
