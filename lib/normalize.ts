// Vérification champ par champ des réponses de Claude (RG-A05).
// Toute valeur manquante ou mal formée est remplacée par une valeur sûre, jamais inventée.
import type { Analyse, Marche, Source } from "./types";

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v)).trim();
const arr = (v: unknown, n: number): unknown[] => (Array.isArray(v) ? v : []).slice(0, n);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
export const num = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const x = Number(String(v).replace(",", "."));
  return Number.isFinite(x) ? x : null;
};

export function normAnalyse(raw: unknown): Analyse {
  const r = obj(raw);
  const niv = r.verdictNiveau === "fort" || r.verdictNiveau === "faible" ? r.verdictNiveau : "moyen";
  const ad = Math.max(0, Math.min(100, Math.round(num(r.adequation) ?? 0)));
  return {
    verdict: str(r.verdict) || "[à compléter : verdict non fourni]",
    verdictNiveau: niv,
    adequation: ad,
    lecture30s: str(r.lecture30s),
    forces: arr(r.forces, 4).map(obj).map((o) => ({ point: str(o.point), preuve: str(o.preuve) })).filter((o) => o.point),
    signauxFaibles: arr(r.signauxFaibles, 4).map(obj).map((o) => ({ point: str(o.point), lecture: str(o.lecture) })).filter((o) => o.point),
    ecarts: arr(r.ecarts, 6)
      .map(obj)
      .map((o) => ({ ecart: str(o.ecart), type: o.type === "competence" ? ("competence" as const) : ("presentation" as const), action: str(o.action) }))
      .filter((o) => o.ecart),
    questionsProbables: arr(r.questionsProbables, 6).map(obj).map((o) => ({ question: str(o.question), verifie: str(o.verifie) })).filter((o) => o.question),
    reformulation: str(r.reformulation),
  };
}

export function normMarche(raw: unknown, sources: Source[] = [], sourcee = false): Marche {
  const r = obj(raw);
  const f = obj(r.fourchette);
  const vals = [num(f.bas), num(f.median), num(f.haut)].filter((v): v is number => v != null).sort((x, y) => x - y);
  const strs = (v: unknown, n: number) => arr(v, n).map(str).filter(Boolean);
  const anc = obj(r.ancrage);
  return {
    poste: str(r.poste),
    zone: str(r.zone) || "Lyon",
    fourchette: vals.length === 3 ? { bas: vals[0], median: vals[1], haut: vals[2] } : null,
    baseEstimation: str(r.baseEstimation) || "Estimation sans données de marché consultées.",
    sourcee: sourcee && sources.length > 0,
    sources,
    niveauPercu: str(r.niveauPercu),
    niveauVisable: str(r.niveauVisable),
    avantages: strs(r.avantages, 5),
    ancrage: { montant: num(anc.montant), justification: str(anc.justification) },
    arguments: strs(r.arguments, 5),
    aDire: strs(r.aDire, 4),
    aEviter: strs(r.aEviter, 4),
    objections: arr(r.objections, 4).map(obj).map((o) => ({ objection: str(o.objection), reponse: str(o.reponse) })).filter((o) => o.objection),
    prochaineAction: str(r.prochaineAction),
  };
}
