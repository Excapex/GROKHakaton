import { action } from "../_generated/server";
import { v } from "convex/values";
import { assembleFromRoles } from "../lib/perception/assemble";
import type { IngestDoc } from "../lib/perception/types";

const pageValidator = v.object({
  page_no: v.number(),
  text: v.string(),
});

const roleValidator = v.object({
  role: v.string(),
  document_id: v.string(),
  input_hash: v.string(),
  pages: v.array(pageValidator),
});

/**
 * Deterministic R1–R6 dossier from ingest page text.
 * Does not write B schema. UI still reads dossiers.getActive until B wires this action.
 */
export const fromPages = action({
  args: {
    projectId: v.string(),
    revisionId: v.string(),
    roles: v.array(roleValidator),
  },
  handler: async (_ctx, args) => {
    const docsByRole: Record<string, IngestDoc> = {};
    for (const role of args.roles) {
      docsByRole[role.role] = {
        document_id: role.document_id,
        revision_id: args.revisionId,
        input_hash: role.input_hash,
        pages: role.pages.map((p) => ({ page_no: p.page_no, text: p.text })),
      };
    }
    return assembleFromRoles(docsByRole, {
      projectId: args.projectId,
      revisionId: args.revisionId,
    });
  },
});
