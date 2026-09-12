import { describe, expect, it } from "vitest";
import { anonDocsByRole, hasPageText, roleFromFilename } from "./pageRoles.ts";

describe("roleFromFilename", () => {
  it("mapira sveske na uloge koje R3 par traži", () => {
    expect(roleFromFilename("GPZOP-PZI.docx")).toBe("gpzop");
    expect(roleFromFilename("arh-fasada.pdf")).toBe("arh");
    expect(roleFromFilename("predmer.xlsx")).toBe("predmer");
    expect(roleFromFilename("Predračun.xlsx")).toBe("predmer");
    expect(roleFromFilename("elektro-rasveta.pdf")).toBe("elektro");
  });

  it("ne izmišlja ulogu za nepoznat naziv", () => {
    expect(roleFromFilename("sveska-a.pdf")).toBeNull();
  });
});

describe("hasPageText", () => {
  it("prazan trim nije tekst strane", () => {
    expect(
      hasPageText({
        gpzop: {
          document_id: "d1",
          revision_id: "r1",
          input_hash: "h",
          pages: [{ page_no: 1, text: "   " }],
        },
      }),
    ).toBe(false);
  });

  it("bez dokumenata nema teksta", () => {
    expect(hasPageText({})).toBe(false);
  });

  it("anon fixture nosi tekst za sve četiri uloge", () => {
    const docs = anonDocsByRole("rev_extract");
    expect(Object.keys(docs).sort()).toEqual(["arh", "elektro", "gpzop", "predmer"]);
    expect(hasPageText(docs)).toBe(true);
    expect(docs.gpzop.pages[0].page_no).toBe(1);
  });
});
