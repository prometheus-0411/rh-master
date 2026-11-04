// Appels du navigateur vers le serveur de l'app.
export class ErreurAppel extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function appelApi<T>(chemin: string, corps: unknown, code: string, signal?: AbortSignal): Promise<T> {
  let r: Response;
  try {
    r = await fetch(chemin, {
      method: "POST",
      headers: { "content-type": "application/json", "x-code": code },
      body: JSON.stringify(corps ?? {}),
      signal,
    });
  } catch (e) {
    throw new ErreurAppel((e as Error)?.name === "AbortError" ? "annule" : "reseau");
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErreurAppel(data?.erreur ?? "serveur");
  return data as T;
}

// Le code testeur est mémorisé dans ce navigateur pour ne pas le ressaisir (jamais le CV).
const CLE = "rh-master-code";
export const codeMemorise = () => {
  try {
    return localStorage.getItem(CLE) ?? "";
  } catch {
    return "";
  }
};
export const memoriserCode = (c: string) => {
  try {
    if (c) localStorage.setItem(CLE, c);
    else localStorage.removeItem(CLE);
  } catch {}
};
