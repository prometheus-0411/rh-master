// Codes d'invitation, plafond par code et plafond global par jour.
import { timingSafeEqual } from "node:crypto";
import { getStore } from "./store";
import { ErreurApi } from "./erreurs";

export function codesConfigures(): Map<string, number> {
  const defaut = Number(process.env.LIMITE_PAR_CODE) || 20;
  const m = new Map<string, number>();
  for (const brut of (process.env.ACCES_CODES ?? "").split(",")) {
    const [code, lim] = brut.trim().split(":");
    if (code) m.set(code.trim().toUpperCase(), Number(lim) || defaut);
  }
  return m;
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
