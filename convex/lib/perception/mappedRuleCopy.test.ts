import { describe, expect, it } from "vitest";
import { mappedRuleCopy, mappedRuleCopies } from "./mappedRuleCopy.ts";
import { MAPPED_RULES } from "./types.ts";

describe("mappedRuleCopy", () => {
  it("I-35 vraća pack tekst, ne slot oznaku", () => {
    const copy = mappedRuleCopy("I-35");
    expect(copy?.section).toBe(
      "Stepen otpornosti konstrukcije i otpornost elemenata prema požaru",
    );
    expect(copy?.primedba).toContain("F30, F60, F90");
    expect(copy?.korekcija).toContain("važećem sistemu klasifikacije");
    expect(copy?.osnov_raw).toContain("SRPS EN 13501-2");
  });

  it("nepoznato pravilo je null", () => {
    expect(mappedRuleCopy("IX-999")).toBeNull();
  });

  it("ima svih 8 mapped pravila", () => {
    expect(mappedRuleCopies().map((row) => row.id)).toEqual([...MAPPED_RULES]);
  });
});
