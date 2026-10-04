import Fastify from "fastify";
import { configureApp } from "./application.js";
import { readConfig } from "./config/env.js";
import { hasSupabaseConfig } from "./dependencies.js";
import { createDevDependencies } from "./shared/dev-mode.js";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envPath)) loadEnvFile(envPath);
const config = readConfig();

// Without Supabase settings, local development runs the /api/v1 posts, saves,
// and messages on seeded in-memory data with a development-only sign-in.
// Production never does: without Supabase those routes reject every request.
const useDevData = !hasSupabaseConfig(config) && config.NODE_ENV !== "production";
const app = await configureApp(
  Fastify({ logger: true }),
  config,
  useDevData ? createDevDependencies() : undefined,
);
if (useDevData) app.log.warn("Using seeded in-memory data (development only)");

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
