/** Daytona REST helper. No SDK import — Convex actions can fetch. Never VITE_ keys. */

function readEnv(name: string): string | undefined {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name];
}

export function daytonaConfig(): { apiKey: string; snapshot: string } | null {
  const apiKey = readEnv("DAYTONA_API_KEY");
  const snapshot = readEnv("DAYTONA_SNAPSHOT") ?? "saglasnik-docs-v1";
  if (!apiKey) return null;
  return { apiKey, snapshot };
}

export function ingestUnavailableReason(): string {
  return "Daytona ključ nije na serveru; ingest PDF-a nije pokrenut. Nema izmišljenih strana.";
}
