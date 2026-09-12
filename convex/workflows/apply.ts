import { action } from "../_generated/server";
import { v } from "convex/values";
import { planR1 } from "../lib/perception/changeset";

function readEnv(name: string): string | undefined {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name];
}

/**
 * Returns a ChangeSet plan for copies. Does not write files or B schema.
 * Apply itself is Python `sandbox/compute/cli.py` (Daytona or local venv).
 */
export const planR1Copies = action({
  args: {
    gpzopId: v.string(),
    gpzopHash: v.string(),
    predmerId: v.string(),
    predmerHash: v.string(),
    dwgId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const plan = planR1({
      gpzopId: args.gpzopId,
      gpzopHash: args.gpzopHash,
      predmerId: args.predmerId,
      predmerHash: args.predmerHash,
      dwgId: args.dwgId,
    });
    if (!plan) {
      return {
        ok: false as const,
        change_set: null,
        reason: "Nedostaje base hash; patch se ne izmišlja.",
      };
    }
    const daytonaReady = Boolean(readEnv("DAYTONA_API_KEY"));
    return {
      ok: true as const,
      change_set: plan,
      apply_cli:
        "python3 sandbox/compute/cli.py apply --change-set cs.json --source id=path --out DIR",
      daytona_ready: daytonaReady,
      daytona_note: daytonaReady
        ? null
        : "Daytona ključ nije na serveru; apply ostaje lokalni CLI na kopijama.",
    };
  },
});
