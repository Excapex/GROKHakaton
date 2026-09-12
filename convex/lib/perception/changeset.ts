const SCHEMA = "1.0.0" as const;

export type PatchPlan = {
  document_id: string;
  format: "docx" | "xlsx";
  op: "replace_text" | "set_cell";
  locator: string;
  from: string;
  to: string;
};

export type ChangeSetPlan = {
  schema_version: typeof SCHEMA;
  id: string;
  lifecycle: "proposed";
  base_hashes: Record<string, string>;
  patches: PatchPlan[];
  design_tasks: Array<{
    id: string;
    description: string;
    reason: "unsupported_format";
    document_id: string;
  }>;
  dependencies: string[];
  approval: { state: "proposed" };
  artifact_ids: string[];
};

/** R1 plan. Missing hashes → null (do not invent a patch). */
export function planR1(args: {
  gpzopId: string;
  gpzopHash: string;
  predmerId: string;
  predmerHash: string;
  dwgId?: string;
  fromMark?: string;
  toMark?: string;
}): ChangeSetPlan | null {
  if (!args.gpzopHash.trim() || !args.predmerHash.trim()) return null;
  const fromMark = args.fromMark ?? "F60";
  const toMark = args.toMark ?? "EI 60 prema SRPS EN 13501-2";
  const tasks: ChangeSetPlan["design_tasks"] = [];
  if (args.dwgId) {
    tasks.push({
      id: "dt_cad_mark",
      description: "Oznaku otpornosti na DWG/DWFX uskladiti ručno; parser ne patch-uje CAD.",
      reason: "unsupported_format",
      document_id: args.dwgId,
    });
  }
  return {
    schema_version: SCHEMA,
    id: "cs_r1_fire_mark",
    lifecycle: "proposed",
    base_hashes: { [args.gpzopId]: args.gpzopHash, [args.predmerId]: args.predmerHash },
    patches: [
      {
        document_id: args.gpzopId,
        format: "docx",
        op: "replace_text",
        locator: "body:fire-resistance-mark",
        from: fromMark,
        to: toMark,
      },
      {
        document_id: args.predmerId,
        format: "xlsx",
        op: "set_cell",
        locator: "Sheet1!C12",
        from: fromMark,
        to: "EI 60",
      },
    ],
    design_tasks: tasks,
    dependencies: ["patch:docx-opis", "patch:xlsx-predmer"],
    approval: { state: "proposed" },
    artifact_ids: [],
  };
}
