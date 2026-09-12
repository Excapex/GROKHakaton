import { describe, expect, it } from "vitest";
import {
  changeSetsVisibleOnRevision,
  evaluateMarkApplied,
  evaluateMarkVerified,
  patchButtonVisible,
  readChangeSetLifecycleApi,
  type LifecycleChangeSet,
  type LifecycleDoc,
  type LifecycleRevision,
} from "./changeSetLifecycle.ts";

const revisions: LifecycleRevision[] = [
  { _id: "rev1", index: 1 },
  { _id: "rev2", index: 2 },
];

const officeDocs: LifecycleDoc[] = [
  {
    _id: "doc1",
    revisionId: "rev1",
    filename: "elaborat.docx",
    kind: "docx",
    sha256: "hash-r1",
  },
  {
    _id: "doc2",
    revisionId: "rev2",
    filename: "elaborat.docx",
    kind: "docx",
    sha256: "hash-r2",
  },
];

const accepted: LifecycleChangeSet = {
  _id: "cs1",
  documentId: "doc1",
  lifecycle: "accepted",
  approvalState: "accepted",
  baseHashes: { doc1: "hash-r1" },
};

const applied: LifecycleChangeSet = {
  ...accepted,
  lifecycle: "applied",
};

describe("changeSetLifecycle API surface", () => {
  it("bez markApplied/markVerified ostaje isključeno", () => {
    const surface = readChangeSetLifecycleApi({
      listForProject: {},
      accept: {},
    });
    expect(surface.hasMarkApplied).toBe(false);
    expect(surface.hasMarkVerified).toBe(false);
    expect(surface.markApplied).toBeNull();
    expect(surface.markVerified).toBeNull();
  });

  it("kad mutacije stignu na objekat, vidi ih", () => {
    const surface = readChangeSetLifecycleApi({
      accept: {},
      markApplied: { _type: "mutation" },
      markVerified: { _type: "mutation" },
    });
    expect(surface.hasMarkApplied).toBe(true);
    expect(surface.hasMarkVerified).toBe(true);
  });
});

describe("evaluateMarkApplied", () => {
  it("disabled dok API nije na main", () => {
    const gate = evaluateMarkApplied({
      hasApi: false,
      changeSet: accepted,
      documents: officeDocs,
      revisions,
    });
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.reason).toMatch(/markApplied/);
  });

  it("ne zove se dok kopije nisu na novoj reviziji", () => {
    const gate = evaluateMarkApplied({
      hasApi: true,
      changeSet: accepted,
      documents: [officeDocs[0]],
      revisions,
    });
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.reason).toMatch(/Kopije/);
  });

  it("posle uploada kopija vraća revisionId", () => {
    const gate = evaluateMarkApplied({
      hasApi: true,
      changeSet: accepted,
      documents: officeDocs,
      revisions,
    });
    expect(gate).toEqual({ ok: true, revisionId: "rev2" });
  });
});

describe("evaluateMarkVerified", () => {
  const closed = {
    hasApi: true,
    changeSet: applied,
    documents: officeDocs,
    revisions,
    findingId: "f1",
    pipelineReady: true,
    dossierSource: "ingest" as const,
    findings: [{ id: "f1", status: "pass" as const }],
    reviewRevisionId: "rev2",
  };

  it("ne skače sa Prihvati na verified", () => {
    const gate = evaluateMarkVerified({
      ...closed,
      changeSet: accepted,
    });
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.reason).toMatch(/Prihvati/);
  });

  it("isti hash nije nova provera", () => {
    const sameHash: LifecycleDoc[] = [
      officeDocs[0],
      { ...officeDocs[1], sha256: "hash-r1" },
    ];
    const gate = evaluateMarkVerified({ ...closed, documents: sameHash });
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.reason).toMatch(/Isti hash/);
  });

  it("integrity/anon fixture nisu dokaz", () => {
    const anon = evaluateMarkVerified({
      ...closed,
      dossierSource: "anon_fixture",
    });
    expect(anon.ok).toBe(false);
    const unknownFinding = evaluateMarkVerified({
      ...closed,
      findings: [{ id: "f1", status: "unknown" }],
    });
    expect(unknownFinding.ok).toBe(false);
    const missing = evaluateMarkVerified({
      ...closed,
      findings: [{ id: "other", status: "pass" }],
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.reason).toMatch(/ne izmišlja|nije na novom/i);
  });

  it("hash promenjen i nalaz zatvoren na ingest revizije 2", () => {
    expect(evaluateMarkVerified(closed)).toEqual({
      ok: true,
      revisionId: "rev2",
    });
  });

  it("FAIL ili druga revizija čitanja nisu verified", () => {
    expect(
      evaluateMarkVerified({
        ...closed,
        findings: [{ id: "f1", status: "fail" }],
      }).ok,
    ).toBe(false);
    expect(
      evaluateMarkVerified({
        ...closed,
        reviewRevisionId: "rev1",
      }).ok,
    ).toBe(false);
  });
});

describe("changeSetsVisibleOnRevision", () => {
  it("vidi ChangeSet na reviziji 2 i kad je original i dalje na reviziji 1", () => {
    const visible = changeSetsVisibleOnRevision([accepted], officeDocs, "rev2");
    expect(visible.map((row) => row._id)).toEqual(["cs1"]);
    expect(changeSetsVisibleOnRevision([accepted], [officeDocs[0]], "rev2")).toEqual(
      [],
    );
  });
});

describe("CAD patch", () => {
  it("nema lažnog patch dugmeta", () => {
    const cad: LifecycleChangeSet = {
      ...accepted,
      designTask: "Izmena crteža je zadatak projektanta.",
    };
    expect(patchButtonVisible(cad, officeDocs)).toBe(false);
    expect(
      patchButtonVisible(accepted, [
        { ...officeDocs[0], kind: "dwg", filename: "plan.dwg" },
      ]),
    ).toBe(false);
    expect(patchButtonVisible(accepted, officeDocs)).toBe(true);
  });

  it("CAD posle kopije sme applied, i dalje bez patch dugmeta", () => {
    const cad: LifecycleChangeSet = {
      ...accepted,
      designTask: "Izmena crteža je zadatak projektanta.",
    };
    const docs: LifecycleDoc[] = [
      {
        _id: "cad1",
        revisionId: "rev1",
        filename: "plan.dwg",
        kind: "dwg",
        sha256: "h1",
      },
      {
        _id: "cad2",
        revisionId: "rev2",
        filename: "plan.dwg",
        kind: "dwg",
        sha256: "h2",
      },
    ];
    const cadSet = { ...cad, documentId: "cad1", baseHashes: { cad1: "h1" } };
    expect(patchButtonVisible(cadSet, docs)).toBe(false);
    expect(
      evaluateMarkApplied({
        hasApi: true,
        changeSet: cadSet,
        documents: docs,
        revisions,
      }),
    ).toEqual({ ok: true, revisionId: "rev2" });
  });
});
