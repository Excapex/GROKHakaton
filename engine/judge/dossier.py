"""Build versioned dossier + ReviewRun after extract/verify/judge/gate."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from engine.extract.pipeline import SLOT_MAP, load_roles, run_extract
from engine.judge.gate import gate
from engine.judge.rules import judge, load_pack
from engine.verify.compare import verify_run

PROMPT_VERSION = "s08-judge-v1"
SCHEMA = "1.0.0"


def _sha(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def build_review_run(*, project_id: str, revision_id: str, pack: dict, docs: list[dict]) -> dict:
    slot_txt = json.dumps(SLOT_MAP, sort_keys=True)
    return {
        "schema_version": SCHEMA,
        "id": "rr_" + hashlib.sha256(revision_id.encode()).hexdigest()[:10],
        "project_id": project_id,
        "revision_id": revision_id,
        "domain_pack_id": "fire_protection",
        "pack_version": str(pack.get("version", "v1")),
        "model_config_hash": _sha("grok-4.6|" + PROMPT_VERSION + "|" + slot_txt[:200]),
        "prompt_version": PROMPT_VERSION,
        "input_hashes": sorted({d.get("input_hash", "") for d in docs if d.get("input_hash")}),
        "status": "done",
    }


def assemble(extract_result: dict, docs_by_role: dict[str, dict], *, project_id: str, revision_id: str) -> dict:
    pack = load_pack()
    docs = list(docs_by_role.values())
    verify_run(extract_result, docs_by_role)
    observations = extract_result["observations"]
    evidence = extract_result["evidence"]
    findings = judge(observations, evidence, pack)
    if not findings:
        findings = [
            {
                "schema_version": SCHEMA,
                "id": "find_none",
                "rule_id": "I-35",
                "status": "unknown",
                "observation_ids": [observations[0]["id"]],
                "severity": "low",
                "rationale": "Nema izvršivog nalaza; nije PASS.",
            }
        ]
    report = gate(observations, evidence, findings)
    mapped = sorted({rid for spec in SLOT_MAP.values() for rid in spec["rule_ids"]})
    unknown_slots = sorted({o["slot"] for o in observations if o.get("value") is None})
    questions = []
    next_actions = []
    for f in findings:
        if f["status"] == "conflict":
            qid = "q_" + f["id"]
            questions.append(
                {
                    "schema_version": SCHEMA,
                    "id": qid,
                    "prompt": "Koje opažanje važi za konflikt " + f["rule_id"] + "?",
                    "finding_ids": [f["id"]],
                    "blocking": True,
                }
            )
            next_actions.append({"kind": "ask", "question_id": qid})
        elif f["status"] == "fail":
            next_actions.append({"kind": "propose_patch", "change_set_id": "cs_" + f["id"]})
        elif f["status"] == "unknown":
            next_actions.append(
                {
                    "kind": "design_task",
                    "description": "Ručno proveriti preduslov za " + f["rule_id"],
                    "reason": "physical_change",
                }
            )
    next_actions.append({"kind": "verify_revision", "revision_id": revision_id})
    run = build_review_run(project_id=project_id, revision_id=revision_id, pack=pack, docs=docs)
    dossier = {
        "schema_version": SCHEMA,
        "review_run_id": run["id"],
        "summary": "Pregled ZOP pack v1 nad izvučenim slotovima R1–R6. Nepoznato nije PASS.",
        "coverage": {
            "checked_rules": [f["rule_id"] for f in findings],
            "skipped_rules": [r for r in mapped if r not in {f["rule_id"] for f in findings}],
            "unknown_slots": unknown_slots,
        },
        "observations": observations,
        "findings": findings,
        "questions": questions,
        "next_actions": next_actions,
        "integrity_report": report,
        "change_set_ids": [a["change_set_id"] for a in next_actions if a.get("kind") == "propose_patch"],
    }
    return {"review_run": run, "dossier": dossier, "evidence": evidence}


def run_dirs(role_dirs: dict[str, Path], *, project_id: str = "proj_anon", revision_id: str = "rev_extract") -> dict:
    docs = load_roles(role_dirs)
    extracted = run_extract(docs)
    return assemble(extracted, docs, project_id=project_id, revision_id=revision_id)
