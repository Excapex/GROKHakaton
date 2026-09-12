import { describe, expect, it } from "vitest";
import { planR1 } from "./changeset";

describe("planR1", () => {
  it("bez hash-a ne izmišlja patch", () => {
    expect(
      planR1({
        gpzopId: "d1",
        gpzopHash: " ",
        predmerId: "d2",
        predmerHash: "sha256:x",
      }),
    ).toBeNull();
  });

  it("DOCX+XLSX patch i DWG design_task", () => {
    const cs = planR1({
      gpzopId: "doc_opis",
      gpzopHash: "sha256:a",
      predmerId: "doc_predmer",
      predmerHash: "sha256:b",
      dwgId: "doc_cad",
    });
    expect(cs).not.toBeNull();
    expect(cs?.lifecycle).toBe("proposed");
    expect(cs?.patches).toHaveLength(2);
    expect(cs?.design_tasks[0]?.reason).toBe("unsupported_format");
  });
});
