// Appels à l'API Claude. Seul fichier qui parle à Anthropic.
import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaContentBlockParam,
  BetaMessage,
  BetaMessageParam,
  BetaToolUnion,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { ErreurApi } from "./erreurs";
import type { Source } from "../types";

const MODELE = () => process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const EFFORT = (): Effort => {
  const e = process.env.ANTHROPIC_EFFORT;
  return e === "low" || e === "medium" || e === "high" || e === "xhigh" || e === "max" ? e : "high";
};

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY manquante.");
    throw new ErreurApi("config", 500);
  }
  client ??= new Anthropic({ maxRetries: 2 });
  return client;
}

interface Options {
  contenu: string | BetaContentBlockParam[];
  schema?: Record<string, unknown>;
  outils?: BetaToolUnion[];
  effort?: Effort;
}

/**
 * Envoie une demande à Claude et renvoie le message final.
 * - Repli automatique côté serveur si le modèle décline pour raison de politique (`fallbacks: "default"`).
 * - Reprend les tours mis en pause par les outils web (`pause_turn`).
 */
export async function appeler({ contenu, schema, outils, effort }: Options): Promise<BetaMessage> {
  const c = getClient();
  const messages: BetaMessageParam[] = [{ role: "user", content: contenu }];
  for (let tour = 0; tour < 4; tour++) {
    const flux = c.beta.messages.stream({
      model: MODELE(),
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: effort ?? EFFORT(), ...(schema ? { format: { type: "json_schema", schema } } : {}) },
      ...(outils ? { tools: outils } : {}),
      messages,
    });
    const msg = await flux.finalMessage();
    if (msg.stop_reason === "refusal") throw new ErreurApi("refused", 422);
    if (msg.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: msg.content });
      continue;
    }
    return msg;
  }
  throw new ErreurApi("serveur", 502);
}

export function texte(msg: BetaMessage): string {
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

export function json(msg: BetaMessage): unknown {
  const t = texte(msg).replace(/^```(?:json)?\s*|\s*```$/g, "");
  const debut = t.indexOf("{");
  const fin = t.lastIndexOf("}");
  if (debut < 0 || fin <= debut) throw new ErreurApi("invalid_json", 502);
  try {
    return JSON.parse(t.slice(debut, fin + 1));
  } catch {
    throw new ErreurApi("invalid_json", 502);
  }
}

/** Sources citées par Claude dans sa réponse (recherche web), dédoublonnées. */
export function sources(msg: BetaMessage, max = 6): Source[] {
  const vues = new Map<string, Source>();
  for (const b of msg.content) {
    if (b.type !== "text" || !b.citations) continue;
    for (const c of b.citations) {
      if (c.type === "web_search_result_location" && c.url && !vues.has(c.url)) {
        vues.set(c.url, { titre: c.title || new URL(c.url).hostname, url: c.url });
      }
    }
  }
  // Pas de citation explicite : on garde les premiers résultats de recherche consultés.
  if (vues.size === 0) {
    for (const b of msg.content) {
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        for (const r of b.content) {
          if (r.type === "web_search_result" && !vues.has(r.url)) vues.set(r.url, { titre: r.title || r.url, url: r.url });
        }
      }
    }
  }
  return [...vues.values()].slice(0, max);
}

/** Vrai si un outil web_fetch a renvoyé une erreur (page bloquée, introuvable…). */
export function fetchEnEchec(msg: BetaMessage): boolean {
  return msg.content.some(
    (b) => b.type === "web_fetch_tool_result" && b.content && !Array.isArray(b.content) && b.content.type !== "web_fetch_result",
  );
}

export const OUTIL_RECHERCHE: BetaToolUnion = {
  type: "web_search_20260209",
  name: "web_search",
  max_uses: 5,
  user_location: { type: "approximate", country: "FR" },
};

export const OUTIL_LECTURE_PAGE: BetaToolUnion = {
  type: "web_fetch_20260209",
  name: "web_fetch",
  max_uses: 2,
  max_content_tokens: 20000,
};
