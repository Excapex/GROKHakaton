"""S11: ChangeSet from a finding. DWG -> design_task. Hash mismatch rejects patch."""
from __future__ import annotations

SCHEMA = "1.0.0"


class StaleSourceError(ValueError):
    """Patch refused because the source input_hash changed."""


def plan_r1(
    *,
    gpzop_id: str,
    gpzop_hash: str,
    predmer_id: str,
    predmer_hash: str,
    dwg_id: str | None,
    from_mark: str = "F60",
    to_mark: str = "EI 60 prema SRPS EN 13501-2",
) -> dict:
    patches = [
        {
            "document_id": gpzop_id,
            "format": "docx",
            "op": "replace_text",
            "locator": "body:fire-resistance-mark",
            "from": from_mark,
            "to": to_mark,
        },
        {
            "document_id": predmer_id,
            "format": "xlsx",
            "op": "set_cell",
            "locator": "Sheet1!C12",
            "from": from_mark,
            "to": "EI 60",
        },
    ]
    tasks = []
    if dwg_id:
        tasks.append(
            {
                "id": "dt_cad_mark",
                "description": "Oznaku otpornosti na DWG/DWFX uskladiti ručno; parser ne patch-uje CAD.",
                "reason": "unsupported_format",
                "document_id": dwg_id,
            }
        )
    return {
        "schema_version": SCHEMA,
        "id": "cs_r1_fire_mark",
        "lifecycle": "proposed",
        "base_hashes": {gpzop_id: gpzop_hash, predmer_id: predmer_hash},
        "patches": patches,
        "design_tasks": tasks,
        "dependencies": ["patch:docx-opis", "patch:xlsx-predmer"],
        "approval": {"state": "proposed"},
        "artifact_ids": [],
    }


def apply_if_fresh(change_set: dict, current_hashes: dict[str, str]) -> dict:
    """Refuse patches when any base hash drifted. Design tasks still listed."""
    for doc_id, expected in change_set["base_hashes"].items():
        got = current_hashes.get(doc_id)
        if got != expected:
            raise StaleSourceError(f"{doc_id}: base {expected} != current {got}")
    out = dict(change_set)
    out["lifecycle"] = "applied"
    return out
