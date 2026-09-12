"""Compare pass-1 and pass-2. Disagreement is unknown, never an average."""
from __future__ import annotations

from pathlib import Path

from engine.extract.pipeline import SLOT_MAP, load_roles, run_extract
from engine.verify.second_pass import payload_for_evidence, read_slot


def _norm(value) -> str | None:
    if value is None:
        return None
    return " ".join(str(value).split()).lower()


def decide(pass1, pass2: object) -> dict:
    a, b = _norm(pass1), _norm(pass2)
    if a is None and b is None:
        return {
            "agreement": "agree",
            "decision": "unknown",
            "note": "Oba prolaza: nema podatka. Ostaje unknown, nije PASS.",
        }
    if a is not None and b is not None and a == b:
        return {
            "agreement": "agree",
            "decision": "verified",
            "note": "Prolazi se slažu.",
        }
    return {
        "agreement": "disagree",
        "decision": "unknown",
        "note": "Neslaganje. Nije prosek. Traži se ručna provera izvora.",
    }


def _page_text(docs: list[dict], document_id: str, page_no: int) -> str | None:
    for doc in docs:
        if doc["document_id"] != document_id:
            continue
        for page in doc["pages"]:
            if page["page_no"] == page_no:
                return page["text"]
    return None


def _spec_for_slot(slot: str) -> dict:
    for spec in SLOT_MAP.values():
        if slot in spec["slots"]:
            return spec
    raise KeyError(slot)


def verify_run(extract_result: dict, docs_by_role: dict[str, dict]) -> dict:
    docs = list(docs_by_role.values())
    ev_by_id = {e["id"]: e for e in extract_result["evidence"]}
    rows = []
    sent = 0
    disagreed = 0
    for obs in extract_result["observations"]:
        spec = _spec_for_slot(obs["slot"])
        if spec.get("error_severity") not in ("high", "medium"):
            continue
        evidence = ev_by_id.get(obs["evidence_id"])
        if obs.get("value") is None and obs.get("search_scope"):
            scope = obs["search_scope"]
            found = None
            page_no = scope["pages"][0] if scope["pages"] else 1
            doc_id = scope["documents"][0]
            for did in scope["documents"]:
                for pno in scope["pages"]:
                    text = _page_text(docs, did, pno) or ""
                    payload = payload_for_evidence(
                        obs["slot"],
                        {"document_id": did, "page_no": pno, "region": None},
                        text,
                        spec["criterion"],
                        spec["queries"],
                    )
                    found = read_slot(payload)
                    if found is not None:
                        doc_id, page_no = did, pno
                        break
                if found is not None:
                    break
            if found is None:
                text = _page_text(docs, doc_id, page_no) or ""
                payload = payload_for_evidence(
                    obs["slot"],
                    {"document_id": doc_id, "page_no": page_no, "region": None},
                    text,
                    spec["criterion"],
                    spec["queries"],
                )
                found = read_slot(payload)
            sent += 1
            verdict = decide(None, found)
            if verdict["agreement"] == "disagree":
                disagreed += 1
            rows.append(
                {
                    "evidence_id": obs["evidence_id"],
                    "slot": obs["slot"],
                    "pass1": None,
                    "pass2": found,
                    **verdict,
                    "page_no": page_no,
                    "document_id": doc_id,
                }
            )
            continue
        if not evidence:
            continue
        text = _page_text(docs, evidence["document_id"], evidence["page_no"])
        if text is None:
            continue
        payload = payload_for_evidence(
            obs["slot"],
            evidence,
            text,
            spec["criterion"],
            spec["queries"],
        )
        pass2 = read_slot(payload)
        sent += 1
        verdict = decide(obs.get("value"), pass2)
        if verdict["agreement"] == "disagree":
            disagreed += 1
        rows.append(
            {
                "evidence_id": evidence["id"],
                "slot": obs["slot"],
                "pass1": obs.get("value"),
                "pass2": pass2,
                **verdict,
                "page_no": evidence["page_no"],
                "document_id": evidence["document_id"],
            }
        )
        obs["verified_by_second_pass"] = verdict["decision"] == "verified"

    return {
        "schema_version": "1.0.0",
        "sent_to_second_pass": sent,
        "disagreed": disagreed,
        "rows": rows,
    }


def verify_dirs(role_dirs: dict[str, Path]) -> dict:
    docs = load_roles(role_dirs)
    extracted = run_extract(docs)
    log = verify_run(extracted, docs)
    return {"extract": extracted, "verification": log}
