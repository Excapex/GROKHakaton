#!/usr/bin/env python3
"""Office ingest: demo DOCX/XLSX yield page_no + F60 text."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def extract(path: Path) -> dict:
    raw = subprocess.check_output(
        [sys.executable, str(ROOT / "sandbox/ingest/extract_text.py"), str(path)],
        text=True,
    )
    return json.loads(raw)


def main() -> int:
    subprocess.check_call([sys.executable, str(ROOT / "scripts/demo/make_demo_sources.py")])
    gpzop = extract(ROOT / "sandbox/artifacts/source/anon-gpzop.docx")
    predmer = extract(ROOT / "sandbox/artifacts/source/anon-predmer.xlsx")
    pdf = extract(ROOT / "evals/fixtures/ingest/anon-two-page.pdf")
    gpages = gpzop.get("pages") or []
    if not gpages or gpages[0].get("page_no") != 1 or "F60" not in (gpages[0].get("text") or ""):
        fail("DOCX mora imati page_no 1 i F60")
    ppages = predmer.get("pages") or []
    if not ppages or ppages[0].get("page_no") != 1 or "F60" not in (ppages[0].get("text") or ""):
        fail("XLSX mora imati list 1 i F60")
    pdf_pages = pdf.get("pages") or []
    if len(pdf_pages) != 2 or pdf_pages[0].get("page_no") != 1 or pdf_pages[1].get("page_no") != 2:
        fail("PDF fixture mora imati page_no 1 i 2")
    cad = Path("/tmp/saglasnik-empty.dwg")
    cad.write_bytes(b"")
    cad_out = extract(cad)
    if cad_out.get("pages"):
        fail("CAD/nepoznat format ne sme da izmisli strane")
    print("evals/test_office_ingest: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
