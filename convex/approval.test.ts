import { describe, expect, it } from "vitest";
import { applyAcceptance } from "./approval.ts";

describe("applyAcceptance", () => {
  it("prvi put prebacuje proposed u accepted, ne u verified", () => {
    const result = applyAcceptance(
      { approvalState: "proposed", lifecycle: "proposed" },
      "M. Jovanović",
      1,
    );
    expect(result.duplicated).toBe(false);
    expect(result.snapshot).toEqual({
      approvalState: "accepted",
      lifecycle: "accepted",
      approvedBy: "M. Jovanović",
      approvedAt: 1,
    });
  });

  it("ponovljeni klik ne duplira odobrenje", () => {
    const first = applyAcceptance(
      { approvalState: "proposed", lifecycle: "proposed" },
      "M. Jovanović",
      1,
    );
    const second = applyAcceptance(first.snapshot, "M. Jovanović", 2);
    expect(second.duplicated).toBe(true);
    expect(second.snapshot).toEqual(first.snapshot);
    expect(second.snapshot.approvedAt).toBe(1);
  });
});
