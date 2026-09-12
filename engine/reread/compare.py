"""S13: new revision is ingested from scratch; verified only on new reading."""
from __future__ import annotations

from engine.judge.rules import judge, load_pack


def judge_extract(extract_result: dict) -> list[dict]:
    return judge(extract_result["observations"], extract_result["evidence"], load_pack())


def compare_revisions(prev_findings: list[dict], new_findings: list[dict]) -> dict:
    new_by_id = {f["id"]: f for f in new_findings}
    still_open = []
    verified = []
    for f in prev_findings:
        n = new_by_id.get(f["id"])
        if f["status"] == "fail" and (n is None or n["status"] != "fail"):
            verified.append({"id": f["id"], "rule_id": f["rule_id"], "was": f["status"], "now": None if n is None else n["status"]})
            continue
        if n is None:
            continue
        if n["status"] in ("fail", "conflict", "unknown"):
            still_open.append({"id": n["id"], "rule_id": n["rule_id"], "was": f["status"], "now": n["status"]})
    return {
        "verified": verified,
        "still_open": still_open,
        "note": "Promena broja u tekstu nije dokaz fizičke izmene. verified samo posle novog ingest-a.",
    }
