import { describe, expect, it } from "vitest";
import { planFromUploadedDocs } from "./planFromDocuments";

describe("planFromUploadedDocs", () => {
  it("bez GPZOP+predmer ne izmišlja patch", () => {
    expect(
      planFromUploadedDocs([
        { id: "d1", filename: "anon-gpzop.docx", kind: "docx", sha256: "sha256:a" },
      ]),
    ).toBeNull();
  });

  it("sklapa R1 patch iz imena fajlova", () => {
    const plan = planFromUploadedDocs([
      { id: "g", filename: "anon-gpzop.docx", kind: "docx", sha256: "sha256:a" },
      { id: "p", filename: "anon-predmer.xlsx", kind: "xlsx", sha256: "sha256:b" },
      { id: "c", filename: "tlocrt.dwg", kind: "dwg", sha256: "sha256:c" },
    ]);
    expect(plan?.patches).toHaveLength(2);
    expect(plan?.patches[0]?.from).toBe("F60");
    expect(plan?.design_tasks[0]?.reason).toBe("unsupported_format");
  });
});
