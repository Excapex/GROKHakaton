import { describe, expect, it } from "vitest";
import { designTaskForDocument } from "./changeSetPolicy.ts";

describe("designTaskForDocument", () => {
  it("CAD ne dobija patch, samo projektantski zadatak", () => {
    expect(designTaskForDocument("dwg", "tlocrt.dwg")).toMatch(/ne krpi/);
    expect(designTaskForDocument("dwfx", "model.dwfx")).toMatch(/projektantski zadatak/);
  });

  it("DOCX/XLSX/PDF ne izmišljaju CAD zadatak", () => {
    expect(designTaskForDocument("docx", "GPZOP.docx")).toBeUndefined();
    expect(designTaskForDocument("xlsx", "predmer.xlsx")).toBeUndefined();
    expect(designTaskForDocument("pdf", "elaborat.pdf")).toBeUndefined();
  });
});
