import { describe, expect, it } from "vitest";
import { anonExtractRoles } from "./lib/perception/anonFixture.ts";
import { hasPageText } from "./pageRoles.ts";

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
    const docs = anonExtractRoles("rev_extract");
    expect(Object.keys(docs).sort()).toEqual(["arh", "elektro", "gpzop", "predmer"]);
    expect(hasPageText(docs)).toBe(true);
  });
});
