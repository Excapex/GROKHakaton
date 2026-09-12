export type ApprovalSnapshot = {
  approvalState: "proposed" | "accepted" | "rejected";
  lifecycle: "proposed" | "accepted" | "applied" | "verified";
  approvedBy?: string;
  approvedAt?: number;
};

/**
 * Prihvatanje je eksplicitna projektantska odluka.
 * Ne prelazi na applied/verified i ponovljen poziv ne menja zapis.
 */
export function applyAcceptance(
  current: ApprovalSnapshot,
  actor: string,
  at: number,
): { snapshot: ApprovalSnapshot; duplicated: boolean } {
  if (current.approvalState === "accepted") {
    return { snapshot: current, duplicated: true };
  }
  return {
    snapshot: {
      approvalState: "accepted",
      lifecycle: "accepted",
      approvedBy: actor,
      approvedAt: at,
    },
    duplicated: false,
  };
}
