import { ingestUnavailableReason } from "./client";

export type PageReadability = "full" | "partial";

export type IngestPage = {
  page_no: number;
  text: string;
  readability: PageReadability;
};

export type IngestPagesOk = {
  ok: true;
  pages: IngestPage[];
  skipped: "none" | "store_only";
  reason: null;
};

export type IngestPagesFail = {
  ok: false;
  pages: [];
  skipped: "none";
  reason: string;
};

export type IngestPagesResult = IngestPagesOk | IngestPagesFail;

export type IngestGate =
  | { action: "skip_cad" }
  | { action: "unavailable"; reason: string }
  | { action: "run" };

const FULL_TEXT_MIN_CHARS = 40;

export function ingestGate(args: {
  parsePolicy: "ingest" | "store_only";
  daytonaConfigured: boolean;
}): IngestGate {
  if (args.parsePolicy === "store_only") return { action: "skip_cad" };
  if (!args.daytonaConfigured) {
    return { action: "unavailable", reason: ingestUnavailableReason() };
  }
  return { action: "run" };
}

export function skipCadResult(): IngestPagesOk {
  return { ok: true, pages: [], skipped: "store_only", reason: null };
}

export function unavailableResult(reason: string): IngestPagesFail {
  return { ok: false, pages: [], skipped: "none", reason };
}

/** Map sandbox JSON. Drops page_no < 1. Does not invent missing indices. */
export function pagesFromExtractJson(raw: unknown): IngestPage[] {
  if (!raw || typeof raw !== "object") return [];
  const pages = (raw as { pages?: unknown }).pages;
  if (!Array.isArray(pages)) return [];
  const out: IngestPage[] = [];
  for (const row of pages) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const pageNo = rec.page_no;
    if (typeof pageNo !== "number" || !Number.isInteger(pageNo) || pageNo < 1) continue;
    const text = typeof rec.text === "string" ? rec.text : "";
    const readability = normalizeReadability(rec.readability, text);
    out.push({ page_no: pageNo, text, readability });
  }
  return out;
}

function normalizeReadability(value: unknown, text: string): PageReadability {
  if (value === "full" || value === "partial") return value;
  return text.trim().length >= FULL_TEXT_MIN_CHARS ? "full" : "partial";
}

/** Same contract as `sandbox/ingest/extract_text.py` (keep in sync). */
export const EXTRACT_TEXT_PY = `
import json, sys
from pathlib import Path
FULL_TEXT_MIN_CHARS = 40

def _readability(text):
    return "full" if len(text.strip()) >= FULL_TEXT_MIN_CHARS else "partial"

def extract_pdf(path):
    try:
        import pymupdf as fitz
    except ImportError:
        import fitz
    doc = fitz.open(path)
    try:
        pages = []
        for i, page in enumerate(doc, start=1):
            text = page.get_text() or ""
            pages.append({"page_no": i, "text": text, "readability": _readability(text), "char_count": len(text.strip())})
        return pages
    finally:
        doc.close()

def extract_docx(path):
    from docx import Document
    text = "\\n".join(p.text for p in Document(path).paragraphs)
    return [{"page_no": 1, "text": text, "readability": _readability(text), "char_count": len(text.strip())}]

def extract_xlsx(path):
    from openpyxl import load_workbook
    book = load_workbook(path, data_only=True, read_only=True)
    pages = []
    try:
        for i, name in enumerate(book.sheetnames, start=1):
            sheet = book[name]
            lines = [name]
            for row in sheet.iter_rows(values_only=True):
                lines.append("\\t".join("" if cell is None else str(cell) for cell in row))
            text = "\\n".join(lines)
            pages.append({"page_no": i, "text": text, "readability": _readability(text), "char_count": len(text.strip())})
    finally:
        book.close()
    return pages

path = Path(sys.argv[1])
suf = path.suffix.lower()
if suf == ".pdf":
    pages = extract_pdf(path)
elif suf == ".docx":
    pages = extract_docx(path)
elif suf == ".xlsx":
    pages = extract_xlsx(path)
else:
    pages = []
print(json.dumps({"schema_version": "1.0.0", "page_count": len(pages), "pages": pages}, ensure_ascii=False))
`.trim();

export function remoteIngestName(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "tmp/ingest.pdf";
  if (lower.endsWith(".docx")) return "tmp/ingest.docx";
  if (lower.endsWith(".xlsx")) return "tmp/ingest.xlsx";
  return null;
}
