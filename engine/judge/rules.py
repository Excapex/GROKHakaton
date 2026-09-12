"""Apply mapped pack rules. Unknown stays unknown — never a convenient PASS."""
from __future__ import annotations

import json
from pathlib import Path

from engine.judge.gate import gate

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = "1.0.0"
F_MARKS = {"F30", "F60", "F90"}


def _find(fid: str, rule_id: str, status: str, oids: list[str], severity: str, rationale: str) -> dict:
    return {
        "schema_version": SCHEMA,
        "id": fid,
        "rule_id": rule_id,
        "status": status,
        "observation_ids": oids,
        "severity": severity,
        "rationale": rationale,
    }


def _has_evidence(obs: dict, ev_ids: set[str]) -> bool:
    if obs.get("value") is None:
        return bool(obs.get("search_scope"))
    return bool(obs.get("evidence_id") and obs["evidence_id"] in ev_ids)


def judge(observations: list[dict], evidence: list[dict], pack: dict) -> list[dict]:
    ev_ids = {e["id"] for e in evidence}
    by_slot: dict[str, list[dict]] = {}
    for o in observations:
        by_slot.setdefault(o["slot"], []).append(o)
    findings: list[dict] = []

    # R1 I-35 / VII-75
    r1 = by_slot.get("fire_resistance_mark", [])
    r1_pos = [o for o in r1 if o.get("value") in F_MARKS]
    if r1_pos:
        if all(_has_evidence(o, ev_ids) for o in r1_pos):
            findings.append(
                _find(
                    "find_r1",
                    "I-35",
                    "fail",
                    [o["id"] for o in r1_pos],
                    "high",
                    "Navedena je povučena oznaka F30/F60/F90 umesto EI/REI prema SRPS EN 13501-2.",
                )
            )
        else:
            findings.append(
                _find(
                    "find_r1",
                    "I-35",
                    "unknown",
                    [o["id"] for o in r1_pos],
                    "high",
                    "Oznaka F* postoji u opažanju ali nema dokaza; nije PASS.",
                )
            )
    elif any(o.get("value") is None for o in r1):
        miss = next(o for o in r1 if o.get("value") is None)
        findings.append(
            _find("find_r1", "I-35", "unknown", [miss["id"]], "high", "Oznaka otpornosti nije nađena; preduslov unknown.")
        )

    r2 = [o for o in by_slot.get("fire_resistance_standard", []) if o.get("value")]
    if r2:
        if all(_has_evidence(o, ev_ids) for o in r2):
            findings.append(
                _find(
                    "find_r2",
                    "I-35",
                    "fail",
                    [o["id"] for o in r2],
                    "high",
                    "EI/REI je vezan za SRPS EN 13501-1 (reakcija), ne za otpornost 13501-2.",
                )
            )
        else:
            findings.append(
                _find("find_r2", "I-35", "unknown", [o["id"] for o in r2], "high", "Nedostaje dokaz za R2; unknown.")
            )

    r3 = [o for o in by_slot.get("facade_insulation_material", []) if o.get("value")]
    values = {str(o["value"]) for o in r3}
    if len(values) >= 2 and len(r3) >= 2:
        if all(_has_evidence(o, ev_ids) for o in r3):
            findings.append(
                _find(
                    "find_r3",
                    "I-87",
                    "conflict",
                    [o["id"] for o in r3],
                    "high",
                    "Dva suprotna opažanja materijala fasade. Nije PASS ni FAIL.",
                )
            )
        else:
            findings.append(
                _find("find_r3", "I-87", "unknown", [o["id"] for o in r3], "high", "Konflikt bez oba dokaza; unknown.")
            )
    elif r3 and all(o.get("value") is None for o in by_slot.get("facade_insulation_material", [])):
        pass

    r4_pos = [o for o in by_slot.get("gpzop_element_in_predmer", []) if o.get("value")]
    r4_miss = [o for o in by_slot.get("gpzop_element_in_predmer", []) if o.get("value") is None]
    if r4_pos and r4_miss:
        oids = [r4_pos[0]["id"], r4_miss[0]["id"]]
        if _has_evidence(r4_pos[0], ev_ids) and r4_miss[0].get("search_scope"):
            findings.append(
                _find(
                    "find_r4",
                    "VII-31",
                    "fail",
                    oids,
                    "high",
                    "Element iz GPZOP nije nađen u predmeru (dokumentovan obuhvat).",
                )
            )
        else:
            findings.append(_find("find_r4", "VII-31", "unknown", oids, "high", "R4 bez kompletnog dokaza/obuhvata."))
    elif r4_miss and not r4_pos:
        findings.append(
            _find("find_r4", "VII-31", "unknown", [r4_miss[0]["id"]], "medium", "Element nije potvrđen ni u GPZOP.")
        )

    r5_miss = [o for o in by_slot.get("emergency_lighting_photometry", []) if o.get("value") is None]
    r5_pos = [o for o in by_slot.get("emergency_lighting_photometry", []) if o.get("value")]
    if r5_miss and not r5_pos:
        o = r5_miss[0]
        status = "unknown" if o.get("search_scope") else "unknown"
        findings.append(
            _find(
                "find_r5",
                "II-34",
                "unknown",
                [o["id"]],
                "medium",
                "Fotometrijski proračun nije nađen; nije FAIL iz odsustva citata.",
            )
        )

    r6 = [o for o in by_slot.get("occupant_load_vs_area", []) if o.get("value") and " / " in str(o["value"])]
    r6_ok = [o for o in r6 if "?" not in str(o["value"])]
    if r6_ok:
        oids = [o["id"] for o in r6_ok]
        if all(_has_evidence(o, ev_ids) for o in r6_ok):
            findings.append(
                _find(
                    "find_r6",
                    "I-61",
                    "unknown",
                    oids,
                    "high",
                    "Površina i broj lica su izvučeni; odnos nije automatski PASS ni FAIL.",
                )
            )
        else:
            findings.append(
                _find("find_r6", "I-61", "unknown", oids, "high", "R6 bez dokaza; unknown.")
            )

    _ = pack  # pack_version recorded in ReviewRun, not used to invent PASS
    return findings


def load_pack() -> dict:
    return json.loads((ROOT / "domains/fire_protection/pack.v1.json").read_text(encoding="utf-8"))
