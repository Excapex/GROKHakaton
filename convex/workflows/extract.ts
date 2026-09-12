"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { grokJson } from "../lib/providers/xai";

const hitSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    hits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          slot: { type: "string" },
          value: { type: ["string", "null"] },
          document_id: { type: "string" },
          page_no: { type: "integer" },
          excerpt: { type: "string" },
        },
        required: ["slot", "value", "document_id", "page_no", "excerpt"],
      },
    },
  },
  required: ["hits"],
} as const;

/** Server-side grok-4.6. Keys from Convex env, never VITE_. page_no must be from ingest. */
export const grokExtract = action({
  args: {
    slots: v.array(v.string()),
    pages: v.array(
      v.object({
        document_id: v.string(),
        page_no: v.number(),
        text: v.string(),
      }),
    ),
  },
  handler: async (_ctx, args) => {
    const allowed = new Set(args.pages.map((p) => `${p.document_id}:${p.page_no}`));
    const parsed = (await grokJson({
      schemaName: "extract_hits",
      schema: hitSchema,
      system:
        "Izvuci samo tražene slotove. page_no mora biti jedan od datih. Ako nema podatka, ne izmišljaj excerpt.",
      user: JSON.stringify({ slots: args.slots, pages: args.pages }),
    })) as { hits: Array<{ document_id: string; page_no: number }> };
    return {
      hits: parsed.hits.filter((h) => allowed.has(`${h.document_id}:${h.page_no}`)),
    };
  },
});
