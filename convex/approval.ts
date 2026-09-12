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

/** Copies saved on a new revision. Never jumps to verified. */
export function applyApplied(
  current: ApprovalSnapshot,
): { snapshot: ApprovalSnapshot; duplicated: boolean; error: string | null } {
  if (current.lifecycle === "applied" || current.lifecycle === "verified") {
    return { snapshot: current, duplicated: true, error: null };
  }
  if (current.approvalState !== "accepted" || current.lifecycle !== "accepted") {
    return {
      snapshot: current,
      duplicated: false,
      error: "Prvo prihvatanje, pa primena. Prihvaćeno nije primenjeno.",
    };
  }
  return {
    snapshot: { ...current, lifecycle: "applied" },
    duplicated: false,
    error: null,
  };
}

/** verified only after a new ingest, not because a number changed on disk. */
export function applyVerified(
  current: ApprovalSnapshot,
  args: { inputHashChanged: boolean; findingClosedOnReread: boolean },
): { snapshot: ApprovalSnapshot; duplicated: boolean; error: string | null } {
  if (current.lifecycle === "verified") {
    return { snapshot: current, duplicated: true, error: null };
  }
  if (current.lifecycle !== "applied") {
    return {
      snapshot: current,
      duplicated: false,
      error: "Provera ide posle primene. Prihvaćeno nije provereno.",
    };
  }
  if (!args.inputHashChanged) {
    return {
      snapshot: current,
      duplicated: false,
      error: "Isti hash nije nova revizija. verified se ne upisuje.",
    };
  }
  if (!args.findingClosedOnReread) {
    return {
      snapshot: current,
      duplicated: false,
      error: "Novo čitanje nije zatvorilo nalaz. verified se ne upisuje.",
    };
  }
  return {
    snapshot: { ...current, lifecycle: "verified" },
    duplicated: false,
    error: null,
  };
}
