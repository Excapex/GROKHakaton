"""Optional grok-4.6 JSON pass. Never invents page_no; model may only pick from given pages."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "hits": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "slot": {"type": "string"},
                    "value": {"type": ["string", "null"]},
                    "document_id": {"type": "string"},
                    "page_no": {"type": "integer"},
                    "excerpt": {"type": "string"},
                },
                "required": ["slot", "value", "document_id", "page_no", "excerpt"],
            },
        }
    },
    "required": ["hits"],
}


def grok_slot_hits(pages: list[dict], slots: list[str]) -> list[dict]:
    key = os.environ.get("XAI_API_KEY", "")
    model = os.environ.get("XAI_MODEL", "grok-4.6")
    if not key:
        raise RuntimeError("XAI_API_KEY nije postavljen")
    payload_pages = [
        {
            "document_id": p["document_id"],
            "page_no": p["page_no"],
            "text": p["text"][:4000],
        }
        for p in pages
    ]
    body = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Izvuci samo tražene slotove. page_no mora biti jedan od datih. "
                    "Ako nema podatka, ne izmišljaj excerpt."
                ),
            },
            {
                "role": "user",
                "content": json.dumps({"slots": slots, "pages": payload_pages}, ensure_ascii=False),
            },
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "extract_hits", "strict": True, "schema": SCHEMA},
        },
    }
    req = urllib.request.Request(
        "https://api.x.ai/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"xAI HTTP {exc.code}") from None
    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    allowed = {(p["document_id"], p["page_no"]) for p in pages}
    hits = []
    for hit in parsed.get("hits", []):
        if (hit["document_id"], hit["page_no"]) in allowed:
            hits.append(hit)
    return hits
