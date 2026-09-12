"""Second pass over one page. Does not receive pass-1 value."""
from __future__ import annotations

from engine.extract.slots import (
    extract_r1,
    extract_r2,
    extract_r3,
    extract_r5,
    extract_r6,
    GPZOP_ELEMENT,
)
from engine.verify.payload import assert_independent, build_payload


def _one_page_doc(payload: dict) -> dict:
    return {
        "document_id": payload["document_id"],
        "revision_id": "rev_verify",
        "input_hash": "sha256:verify",
        "pages": [
            {
                "page_no": payload["page_no"],
                "text": payload["text"],
                "region": payload.get("region"),
                "render_artifact": None,
            }
        ],
    }


def read_slot(payload: dict) -> str | int | None:
    """Independent read. Payload must not contain pass-1 value."""
    assert_independent(payload)
    slot = payload["slot"]
    doc = _one_page_doc(payload)
    if slot == "fire_resistance_mark":
        pairs = extract_r1([doc])
        return pairs[0][0]["value"] if pairs else None
    if slot == "fire_resistance_standard":
        pairs = extract_r2([doc])
        return pairs[0][0]["value"] if pairs else None
    if slot == "facade_insulation_material":
        pairs = extract_r3([doc])
        return pairs[0][0]["value"] if pairs else None
    if slot == "gpzop_element_in_predmer":
        text = payload["text"]
        m = GPZOP_ELEMENT.search(text)
        return " ".join(m.group(0).split()) if m else None
    if slot == "emergency_lighting_photometry":
        pairs = extract_r5([doc])
        return pairs[0][0]["value"] if pairs else None
    if slot == "occupant_load_vs_area":
        pairs = extract_r6([doc])
        return pairs[0][0]["value"] if pairs else None
    return None


def payload_for_evidence(slot: str, evidence: dict, page_text: str, criterion: str, queries: list[str]) -> dict:
    return build_payload(
        slot=slot,
        document_id=evidence["document_id"],
        page_no=evidence["page_no"],
        criterion=criterion,
        text=page_text,
        queries=queries,
        region=evidence.get("region"),
    )
