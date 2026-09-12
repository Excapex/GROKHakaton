#!/usr/bin/env python3
"""S07: second pass never sees pass-1 value; disagreement is unknown."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from engine.extract.pipeline import load_roles, run_extract  # noqa: E402
from engine.verify.compare import decide, verify_run  # noqa: E402
from engine.verify.payload import build_payload  # noqa: E402
from engine.verify.second_pass import payload_for_evidence, read_slot  # noqa: E402

FIX = ROOT / "evals/fixtures/extract"


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    try:
        build_payload(
            slot="x",
            document_id="d",
            page_no=1,
            criterion="c",
            text="t",
        )
    except ValueError:
        fail("prazan payload mora proći")
    from engine.verify.payload import assert_independent

    try:
        assert_independent(
            {
                "slot": "x",
                "document_id": "d",
                "page_no": 1,
                "criterion": "c",
                "text": "t",
                "value": "F60",
            }
        )
        fail("payload sa value mora pasti")
    except ValueError:
        pass

    same = decide("F60", "F60")
    if same["decision"] != "verified":
        fail("slaganje F60")
    clash = decide("180 m2 / 90 lica", "200 m2 / 90 lica")
    if clash["decision"] != "unknown" or clash["agreement"] != "disagree":
        fail("neslaganje mora biti unknown, ne prosek")
    if "1.9" in str(clash) or "190" in str(clash):
        fail("ne sme nastati prosek")

    docs = load_roles(
        {
            "gpzop": FIX / "gpzop",
            "arh": FIX / "arh",
            "predmer": FIX / "predmer",
            "elektro": FIX / "elektro",
        }
    )
    extracted = run_extract(docs)
    log = verify_run(extracted, docs)
    if log["sent_to_second_pass"] < 1:
        fail("nema drugog prolaza")
    r1 = next(r for r in log["rows"] if r["slot"] == "fire_resistance_mark")
    if r1["pass1"] != "F60" or r1["pass2"] != "F60" or r1["agreement"] != "agree":
        fail("R1 fixture drugi prolaz")
    ev = extracted["evidence"][0]
    payload = payload_for_evidence(
        "fire_resistance_mark",
        ev,
        (FIX / "gpzop/pages/0001.txt").read_text(encoding="utf-8"),
        "kriterijum",
        ["F60"],
    )
    if "value" in payload:
        fail("payload curi value")
    if read_slot(payload) != "F60":
        fail("read_slot F60")

    print(
        f"evals/test_verify: OK sent={log['sent_to_second_pass']} disagreed={log['disagreed']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
