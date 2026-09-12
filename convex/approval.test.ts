import { describe, expect, it } from "vitest";
import { applyAcceptance, applyApplied, applyVerified } from "./approval.ts";

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

describe("applyApplied / applyVerified", () => {
  it("applied samo posle accepted, nikad verified", () => {
    const accepted = applyAcceptance(
      { approvalState: "proposed", lifecycle: "proposed" },
      "M. Jovanović",
      1,
    ).snapshot;
    const applied = applyApplied(accepted);
    expect(applied.error).toBeNull();
    expect(applied.snapshot.lifecycle).toBe("applied");
    expect(applied.snapshot.approvalState).toBe("accepted");
    expect(applyApplied({ approvalState: "proposed", lifecycle: "proposed" }).error).toMatch(
      /prihvatanje/i,
    );
  });

  it("isti hash i otvoren nalaz ne postaju verified", () => {
    const applied = {
      approvalState: "accepted" as const,
      lifecycle: "applied" as const,
      approvedBy: "M. Jovanović",
      approvedAt: 1,
    };
    expect(
      applyVerified(applied, { inputHashChanged: false, findingClosedOnReread: true }).error,
    ).toMatch(/isti hash/i);
    expect(
      applyVerified(applied, { inputHashChanged: true, findingClosedOnReread: false }).error,
    ).toMatch(/novo čitanje/i);
    expect(
      applyVerified(applied, { inputHashChanged: true, findingClosedOnReread: true }).snapshot
        .lifecycle,
    ).toBe("verified");
  });
});
