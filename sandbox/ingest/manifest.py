#!/usr/bin/env python3
"""PDF -> DocumentManifest. Physical page_no is the PDF index (1-based).

Run locally or inside Daytona snapshot saglasnik-docs-v1 (PyMuPDF + Poppler).

    python3 sandbox/ingest/manifest.py path/to.pdf --out sandbox/artifacts/doc_id

Original PDF is never copied into --out. Renders and text extracts are.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        print("Nedostaje pymupdf. pip install -r requirements.txt", file=sys.stderr)
        sys.exit(1)

SCHEMA_VERSION = "1.0.0"
FULL_TEXT_MIN_CHARS = 40
MAX_REGIONS = 40


def input_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return "sha256:" + h.hexdigest()


def norm_region(rect: fitz.Rect, page: fitz.Page) -> dict:
    pr = page.rect
    w = pr.width or 1.0
    h = pr.height or 1.0
    return {
        "x": round(rect.x0 / w, 4),
        "y": round(rect.y0 / h, 4),
        "w": round(max(rect.width, 0) / w, 4),
        "h": round(max(rect.height, 0) / h, 4),
    }


def page_regions(page: fitz.Page) -> list[dict]:
    data = page.get_text("dict")
    out: list[dict] = []
    for block in data.get("blocks", []):
        bbox = block.get("bbox")
        if not bbox:
            continue
        if block.get("type") == 0 and not any(
            span.get("text", "").strip()
            for line in block.get("lines", [])
            for span in line.get("spans", [])
        ):
            continue
        region = norm_region(fitz.Rect(bbox), page)
        if region["w"] <= 0 or region["h"] <= 0:
            continue
        out.append(region)
        if len(out) >= MAX_REGIONS:
            break
    return out


def ingest_page(page: fitz.Page, page_no: int, out_dir: Path) -> dict:
    text = page.get_text("text") or ""
    chars = len(text.strip())
    blocks = page.get_text("dict").get("blocks", [])
    text_layers = sum(1 for b in blocks if b.get("type") == 0)
    image_blocks = sum(1 for b in blocks if b.get("type") == 1)
    has_text = chars > 0
    is_scanned = (not has_text and image_blocks > 0) or (chars < FULL_TEXT_MIN_CHARS and image_blocks > 0)
    readability = "full" if chars >= FULL_TEXT_MIN_CHARS else "partial"

    stem = f"{page_no:04d}"
    text_name = f"pages/{stem}.txt"
    render_name = f"pages/{stem}.png"
    (out_dir / "pages").mkdir(parents=True, exist_ok=True)
    (out_dir / text_name).write_text(text, encoding="utf-8")
    pix = page.get_pixmap(dpi=72, alpha=False)
    pix.save(str(out_dir / render_name))

    return {
        "page_no": page_no,
        "width_pt": round(page.rect.width, 2),
        "height_pt": round(page.rect.height, 2),
        "rotation": int(page.rotation),
        "has_text": has_text,
        "is_scanned": bool(is_scanned),
        "text_layer_count": text_layers,
        "char_count": chars,
        "readability": readability,
        "regions": page_regions(page),
        "text_artifact": text_name,
        "render_artifact": render_name,
    }


def ingest_pdf(pdf: Path, out_dir: Path, document_id: str) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf)
    try:
        pages = [ingest_page(doc[i], i + 1, out_dir) for i in range(doc.page_count)]
    finally:
        doc.close()
    if not pages:
        raise SystemExit("PDF nema strana — ingest ne izmišlja page_no.")
    manifest = {
        "schema_version": SCHEMA_VERSION,
        "document_id": document_id,
        "source_filename": pdf.name,
        "input_hash": input_hash(pdf),
        "page_count": len(pages),
        "pages": pages,
    }
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> int:
    p = argparse.ArgumentParser(description="Nalaznik PDF ingest")
    p.add_argument("pdf", type=Path)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--document-id", default="")
    args = p.parse_args()
    pdf = args.pdf.expanduser()
    if not pdf.is_file():
        print(f"Nema PDF: {pdf}", file=sys.stderr)
        return 2
    doc_id = args.document_id or pdf.stem
    manifest = ingest_pdf(pdf, args.out.expanduser(), doc_id)
    print(f"document_id={manifest['document_id']} page_count={manifest['page_count']}")
    for page in manifest["pages"]:
        print(
            f"  page_no={page['page_no']} readability={page['readability']} "
            f"chars={page['char_count']} scanned={page['is_scanned']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
