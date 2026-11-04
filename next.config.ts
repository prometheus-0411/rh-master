import type { NextConfig } from "next";

const config: NextConfig = {
  // Les consignes de Claude sont des fichiers .md lus au moment de l'appel : on les embarque dans le déploiement.
  outputFileTracingIncludes: { "/api/**/*": ["./prompts/**/*"] },
};

export default config;
