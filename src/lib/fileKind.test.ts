import { describe, expect, it } from "vitest";
import { isCadKind, policyForFilename } from "./fileKind.ts";

describe("policyForFilename", () => {
  it("prima PDF/DOCX/XLSX za kasniji ingest", () => {
    expect(policyForFilename("opis.pdf")).toEqual({
      kind: "pdf",
      parsePolicy: "ingest",
    });
    expect(policyForFilename("predmer.XLSX")).toEqual({
      kind: "xlsx",
      parsePolicy: "ingest",
    });
    expect(policyForFilename("tehnicki.docx")).toEqual({
      kind: "docx",
      parsePolicy: "ingest",
    });
  });

  it("CAD čuva original i ne parsira", () => {
    expect(policyForFilename("osnova.dwg")).toEqual({
      kind: "dwg",
      parsePolicy: "store_only",
    });
    expect(policyForFilename("osnova.dwfx")).toEqual({
      kind: "dwfx",
      parsePolicy: "store_only",
    });
    expect(isCadKind("dwg")).toBe(true);
  });

  it("odbija nepodržan format", () => {
    expect(policyForFilename("slika.png")).toBeNull();
    expect(policyForFilename("nema_ext")).toBeNull();
  });
});
