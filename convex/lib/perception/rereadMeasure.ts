export type FindingLite = {
  id: string;
  status: "pass" | "fail" | "conflict" | "unknown" | string;
};

/**
 * Same rule as evals/test_reread.py: a prior fail/conflict is closed when the
 * new ingest no longer produces that status. unknown is not fail — it does not
 * keep the finding open. Client booleans are not an input.
 */
export function findingClosedOnReread(
  findingId: string,
  findings: FindingLite[],
): boolean {
  const row = findings.find((item) => item.id === findingId);
  if (!row) return true;
  return row.status !== "fail" && row.status !== "conflict";
}

export function measureVerifiedGate(input: {
  hasIngestText: boolean;
  inputHashChanged: boolean;
  findingId: string;
  findings: FindingLite[];
}): { ok: true } | { ok: false; reason: string } {
  if (!input.hasIngestText) {
    return {
      ok: false,
      reason:
        "Nema ingestovanog teksta na ovoj reviziji. Fixture i prazan dosije nisu provera.",
    };
  }
  if (!input.inputHashChanged) {
    return {
      ok: false,
      reason: "Isti hash nije nova revizija. verified se ne upisuje.",
    };
  }
  if (!input.findingId.trim()) {
    return {
      ok: false,
      reason: "Nalaz nije vezan za ChangeSet. ID se ne izmišlja.",
    };
  }
  if (!findingClosedOnReread(input.findingId, input.findings)) {
    return {
      ok: false,
      reason: "Novo čitanje nije zatvorilo nalaz. verified se ne upisuje.",
    };
  }
  return { ok: true };
}
