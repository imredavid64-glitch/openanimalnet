// Shared IUCN/Wikidata taxonomy helpers. Single source of truth so the
// generator, the freshness checker, and the CI taxonomy check can't drift
// apart (three wrong QIDs slipped through while these maps were duplicated).
//
// Verified against Wikidata item labels on 2026-08-12:
//   Q214984 is the taxonomy rank "division", NOT Near Threatened (Q719675).
//   Q209175 is the actress Kim Cattrall, NOT Extinct (Q237350).
//   Q552752 is a cardinal, NOT Extinct in the Wild (Q239509).
export const STATUS_BY_QID = {
  Q219127: 'CR', // Critically Endangered
  Q96377276: 'EN', // Endangered
  Q278113: 'VU', // Vulnerable
  Q719675: 'NT', // Near Threatened
  Q211005: 'LC', // Least Concern
  Q3245245: 'DD', // Data Deficient
  Q237350: 'EX', // Extinct
  Q239509: 'EW', // Extinct in the Wild
};

// Wikidata's P171 chain is paraphyletic: bird lineages pass through
// "Reptilia" and the chain can carry several class-ranked nodes. When that
// happens, prefer the most specific extant clade that actually appears in
// the chain instead of whatever node Wikidata ranked last.
export const CLASS_PRIORITY = [
  'Aves',
  'Mammalia',
  'Amphibia',
  'Reptilia',
  'Actinopterygii',
  'Chondrichthyes',
  'Insecta',
];

export function bestClass(classList) {
  const lower = classList.map((c) => c.toLowerCase());
  for (const c of CLASS_PRIORITY) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return classList[classList.length - 1] ?? null;
}
