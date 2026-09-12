"""Verifier payload: slot + page + criterion. Never include pass-1 value."""
from __future__ import annotations

ALLOWED = frozenset(
    {"slot", "document_id", "page_no", "region", "text", "criterion", "queries"}
)
FORBIDDEN = frozenset({"value", "pass1", "observation", "fact", "excerpt_value"})


def build_payload(
    *,
    slot: str,
    document_id: str,
    page_no: int,
    criterion: str,
    text: str,
    queries: list[str] | None = None,
    region: dict | None = None,
) -> dict:
    payload: dict = {
        "slot": slot,
        "document_id": document_id,
        "page_no": page_no,
        "criterion": criterion,
        "text": text,
    }
    if queries:
        payload["queries"] = queries
    if region:
        payload["region"] = region
    leak = FORBIDDEN.intersection(payload)
    extra = set(payload) - ALLOWED
    if leak or extra:
        raise ValueError(f"verifier payload leak/extra: {leak or extra}")
    return payload


def assert_independent(payload: dict) -> None:
    keys = set(payload)
    if keys - ALLOWED:
        raise ValueError(f"nedozvoljena polja u verifikatoru: {keys - ALLOWED}")
    if "value" in payload:
        raise ValueError("verifikator ne sme videti value prvog prolaza")
