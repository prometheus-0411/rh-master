// Codes d'invitation, plafond par code et plafond global par jour.
import { timingSafeEqual } from "node:crypto";
import { getStore, storePersistant } from "./store";
import { ErreurApi } from "./erreurs";

// Codes cités en exemple dans la documentation publique : jamais acceptés, même s'ils sont recopiés dans ACCES_CODES.
const CODES_PUBLICS = new Set(["CAMILLE-4821", "SOPHIE-7390", "EXEMPLE-A-REMPLACER"]);

export function codesConfigures(): Map<string, number> {
  const defaut = Number(process.env.LIMITE_PAR_CODE) || 20;
  const m = new Map<string, number>();
  for (const brut of (process.env.ACCES_CODES ?? "").split(",")) {
    const [code, lim] = brut.trim().split(":");
    const c = (code ?? "").trim().toUpperCase();
    if (c && !CODES_PUBLICS.has(c)) m.set(c, Number(lim) || defaut);
  }
  return m;
}

/**
 * En production (Vercel ou `npm start`), refuse tout appel tant que la base Upstash n'est pas connectée :
 * sans elle, les compteurs repartent de zéro à chaque redémarrage et les plafonds ne protègent plus le budget.
 * En développement (`npm run dev`), ou avec AUTORISER_SANS_BASE=1 pour un essai local, la mémoire suffit.
 */
export function exigerBasePersistante() {
  const production = process.env.NODE_ENV === "production" && process.env.AUTORISER_SANS_BASE !== "1";
  if (production && !storePersistant()) {
    console.error("Base Upstash non connectée : appels refusés pour protéger le budget (README, étape 4).");
    throw new ErreurApi("base_absente", 503);
  }
}

export function lireCode(req: Request): string {
  return (req.headers.get("x-code") ?? "").trim().toUpperCase();
}

export function verifierCode(code: string): number {
  if (!code) throw new ErreurApi("code_requis", 401);
  const limite = codesConfigures().get(code);
  if (limite == null) throw new ErreurApi("code_invalide", 401);
  return limite;
}

const jour = () => new Date().toISOString().slice(0, 10);

/** Réserve un appel à Claude. Renvoie une fonction d'annulation à appeler si l'appel échoue. */
export async function reserverAppel(code: string): Promise<{ restant: number; annuler: () => Promise<void> }> {
  const limite = verifierCode(code);
  exigerBasePersistante();
  const s = getStore();
  const kCode = `usage:${code}`;
  const kJour = `jour:${jour()}`;
  const n = await s.incr(kCode);
  if (n > limite) {
    await s.decr(kCode);
    throw new ErreurApi("quota_atteint", 429);
  }
  const limiteJour = Number(process.env.LIMITE_JOUR) || 150;
  const j = await s.incr(kJour, 60 * 60 * 48);
  if (j > limiteJour) {
    await s.decr(kJour);
    await s.decr(kCode);
    throw new ErreurApi("limite_jour", 429);
  }
  return {
    restant: limite - n,
    annuler: async () => {
      await s.decr(kCode);
      await s.decr(kJour);
    },
  };
}

export async function restant(code: string): Promise<number> {
  const limite = verifierCode(code);
  return Math.max(0, limite - (await getStore().get(`usage:${code}`)));
}

export function verifierAdmin(req: Request) {
  const attendu = process.env.ADMIN_CODE ?? "";
  const recu = req.headers.get("x-admin") ?? "";
  const a = Buffer.from(attendu);
  const b = Buffer.from(recu);
  if (!attendu || a.length !== b.length || !timingSafeEqual(a, b)) throw new ErreurApi("code_invalide", 401);
}

export const jourCourant = jour;
