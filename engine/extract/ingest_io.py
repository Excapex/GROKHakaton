"""Load ingest output (manifest.json + pages/*.txt) without inventing page_no."""
from __future__ import annotations

import json
from pathlib import Path


def load_ingest_dir(path: Path) -> dict:
    manifest_path = path / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    pages = []
    for page in manifest["pages"]:
        page_no = page["page_no"]
        text_rel = page.get("text_artifact") or f"pages/{page_no:04d}.txt"
        text_path = path / text_rel
        text = text_path.read_text(encoding="utf-8") if text_path.is_file() else ""
        pages.append(
            {
                "page_no": page_no,
                "text": text,
                "region": (page.get("regions") or [None])[0],
                "readability": page.get("readability", "partial"),
                "render_artifact": page.get("render_artifact"),
            }
        )
    pages.sort(key=lambda p: p["page_no"])
    return {
        "document_id": manifest["document_id"],
        "source_filename": manifest.get("source_filename", path.name),
        "input_hash": manifest.get("input_hash", ""),
        "page_count": manifest["page_count"],
        "pages": pages,
        "revision_id": "rev_extract",
    }


def all_page_nos(doc: dict) -> list[int]:
    return [p["page_no"] for p in doc["pages"]]
