import { describe, expect, it } from "vitest";
import { buildChangeSetExport, changeSetFilename } from "./changeSetExport.ts";

const documents = [
  { _id: "d1", filename: "GPZOP.docx", kind: "docx", sha256: "abc" },
];

const accepted = {
  _id: "cs1",
  lifecycle: "accepted",
  approvalState: "accepted",
  documentId: "d1",
  baseHashes: { d1: "abc" },
  approvedBy: "M. Jovanović",
  approvedAt: 1_757_000_000_000,
};

describe("buildChangeSetExport", () => {
  it("nosi base hash i ne tvrdi da je prihvatanje saglasnost", () => {
    const out = buildChangeSetExport(accepted, documents);
    expect(out.base_hashes).toEqual({ d1: "abc" });
    expect(out.approval.not_consent).toBe(true);
    expect(out.approval.by).toBe("M. Jovanović");
    expect(out.apply.originals_untouched).toBe(true);
  });

  it("nosi engine patches kad su sačuvani na ChangeSet-u", () => {
    const out = buildChangeSetExport(
      {
        ...accepted,
        patches: [
          {
            document_id: "d1",
            format: "docx",
            op: "replace_text",
            locator: "body:fire-resistance-mark",
            from: "F60",
            to: "EI 60 prema SRPS EN 13501-2",
          },
        ],
      },
      documents,
    );
    expect(out.patches).toHaveLength(1);
    expect(out.patches[0]?.from).toBe("F60");
  });

  it("bez plana ne izmišlja patch", () => {
    expect(buildChangeSetExport(accepted, documents).patches).toEqual([]);
  });

  it("CAD ostaje projektantski zadatak, bez patch-a", () => {
    const out = buildChangeSetExport(
      { ...accepted, designTask: "CAD izvor se ne krpi." },
      documents,
    );
    expect(out.design_tasks).toHaveLength(1);
    expect(out.design_tasks[0].reason).toBe("unsupported_format");
  });

  it("nepoznat dokument ne izmišlja naziv", () => {
    const out = buildChangeSetExport({ ...accepted, documentId: "nema" }, documents);
    expect(out.target_document).toBeNull();
  });

  it("naziv fajla nosi id paketa", () => {
    expect(changeSetFilename(accepted)).toBe("changeset-cs1.json");
  });
});
