// Petite base clé-valeur : compteurs d'usage et retours testeurs. Jamais de CV ni d'offre (RG-A01).
// En production : Upstash Redis (variables KV_REST_API_URL / KV_REST_API_TOKEN, ou UPSTASH_REDIS_REST_*).
// Sans ces variables : mémoire du serveur, effacée à chaque redémarrage (essai local uniquement).
import { Redis } from "@upstash/redis";

interface Store {
  incr(key: string, ttlSeconds?: number): Promise<number>;
  decr(key: string): Promise<void>;
  get(key: string): Promise<number>;
  hset(key: string, field: string, value: string): Promise<void>;
  hgetall(key: string): Promise<Record<string, string>>;
}

function redisStore(url: string, token: string): Store {
  const r = new Redis({ url, token, automaticDeserialization: false });
  return {
    async incr(key, ttl) {
      const n = await r.incr(key);
      if (ttl && n === 1) await r.expire(key, ttl);
      return n;
    },
    async decr(key) {
      await r.decr(key);
    },
    async get(key) {
      return Number((await r.get<string>(key)) ?? 0) || 0;
    },
    async hset(key, field, value) {
      await r.hset(key, { [field]: value });
    },
    async hgetall(key) {
      return ((await r.hgetall<Record<string, string>>(key)) ?? {}) as Record<string, string>;
    },
  };
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __rhStore?: { n: Map<string, number>; h: Map<string, Record<string, string>> } };
  g.__rhStore ??= { n: new Map(), h: new Map() };
  const { n, h } = g.__rhStore;
  return {
    async incr(key) {
      const v = (n.get(key) ?? 0) + 1;
      n.set(key, v);
      return v;
    },
    async decr(key) {
      n.set(key, (n.get(key) ?? 0) - 1);
    },
    async get(key) {
      return n.get(key) ?? 0;
    },
    async hset(key, field, value) {
      h.set(key, { ...(h.get(key) ?? {}), [field]: value });
    },
    async hgetall(key) {
      return { ...(h.get(key) ?? {}) };
    },
  };
}

let store: Store | null = null;
export function getStore(): Store {
  if (store) return store;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  store = url && token ? redisStore(url, token) : memoryStore();
  return store;
}

export const storePersistant = () =>
  Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN));
