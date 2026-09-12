#!/usr/bin/env python3
"""Build a 2-page anonymized PDF fixture (no client data) and ingest it."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from sandbox.ingest.manifest import ingest_pdf  # noqa: E402

FIX = ROOT / "evals" / "fixtures" / "ingest"
PDF = FIX / "anon-two-page.pdf"


def write_fixture_pdf(path: Path) -> None:
    doc = fitz.open()
    p1 = doc.new_page(width=595, height=842)
    p1.insert_text((72, 72), "Nalaznik anon fixture page 1", fontsize=16)
    p1.insert_text((72, 110), "EI 60 SRPS EN 13501-2", fontsize=12)
    p2 = doc.new_page(width=595, height=842)
    # No text layer: unreadable / scanned placeholder. Must be partial, not empty.
    p2.insert_image(p2.rect, stream=_tiny_png())
    path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(path)
    doc.close()


def _tiny_png() -> bytes:
    import struct
    import zlib

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", 8, 8, 8, 2, 0, 0, 0)
    raw = b"".join(b"\x00" + bytes([200, 200, 200]) * 8 for _ in range(8))
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


def main() -> int:
    write_fixture_pdf(PDF)
    out = FIX / "anon-two-page"
    manifest = ingest_pdf(PDF, out, "doc_anon_two_page")
    schema_path = ROOT / "contracts" / "jsonschema" / "document-manifest.schema.json"
    from jsonschema import Draft202012Validator

    Draft202012Validator(json.loads(schema_path.read_text())).validate(manifest)
    assert manifest["page_count"] == 2
    assert [p["page_no"] for p in manifest["pages"]] == [1, 2]
    assert manifest["pages"][0]["readability"] == "full"
    assert manifest["pages"][1]["readability"] == "partial"
    assert manifest["pages"][1]["is_scanned"] is True
    print("OK ingest fixture page_count=2 full+partial")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
