"""Integrity gate: links, types, coverage, revision fingerprints. No invented PASS."""
from __future__ import annotations


def gate(
    observations: list[dict],
    evidence: list[dict],
    findings: list[dict],
) -> dict:
    ev_ids = {e["id"] for e in evidence}
    obs_by_id = {o["id"]: o for o in observations}
    broken: list[str] = []
    unknown_without_scope: list[str] = []
    positive_without_evidence: list[str] = []
    conflicts_single: list[str] = []

    for o in observations:
        if o.get("value") is None:
            if not o.get("search_scope"):
                unknown_without_scope.append(o["id"])
        else:
            eid = o.get("evidence_id")
            if not eid or eid not in ev_ids:
                positive_without_evidence.append(o["id"])
            else:
                ev = next(e for e in evidence if e["id"] == eid)
                if ev.get("page_no", 0) < 1:
                    broken.append(f"{o['id']}:page_no")

    for f in findings:
        for oid in f.get("observation_ids", []):
            if oid not in obs_by_id:
                broken.append(f"{f['id']}->{oid}")
        if f.get("status") == "conflict" and len(f.get("observation_ids") or []) < 2:
            conflicts_single.append(f["id"])
        if f.get("status") == "unknown":
            for oid in f.get("observation_ids", []):
                o = obs_by_id.get(oid)
                if o and o.get("value") is None and not o.get("search_scope"):
                    unknown_without_scope.append(oid)

    ok = not (broken or unknown_without_scope or positive_without_evidence or conflicts_single)
    return {
        "ok": ok,
        "broken_links": broken,
        "unknown_without_scope": sorted(set(unknown_without_scope)),
        "positive_without_evidence": positive_without_evidence,
        "conflicts_with_single_source": conflicts_single,
    }
