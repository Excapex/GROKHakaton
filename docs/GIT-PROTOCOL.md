# Git protokol i podela posla

Cilj: dva člana i više agenata (Claude Code, Codex, Cursor, Grok Bot) rade
paralelno **bez konflikata i bez izgubljenog rada**.

## 1. Osnovno pravilo

> **Jedan issue = jedna kratkotrajna grana = jedan agent = jedan vlasnik.**

Ne postoji trajna `ui` ili `pipeline` grana. Posle squash merge-a grana se gasi
i otvara se nova za sledeći issue.

## 2. Ownership fajlova — ko sme da menja šta

| Putanja | Vlasnik | Napomena |
|---|---|---|
| `contracts/` | **A** | 🔥 hot — vidi §5 |
| `engine/`, `domains/`, `evals/` | **A** | pravila, ZOP pack, evaluacija |
| `sandbox/ingest/`, `sandbox/compute/` | **A** | Python, Daytona |
| `convex/workflows/`, `convex/lib/` | **A** | perception, providers, daytona adapter |
| `src/`, `public/` | **B** | ceo UI |
| `src/components/generated/` | **B** | karantin za v0/Wonder izlaz |
| `convex/schema.ts` | **B** | 🔥 hot |
| `convex/*.ts` (CRUD: queries/mutations) | **B** | |
| `sandbox/artifacts/` | **B** | izvoz i paketi |
| `package.json`, `package-lock.json` | **B** | 🔥 hot — A otvara zahtev, ne menja sam |
| Python zavisnosti, Daytona image | **A** | B otvara zahtev |
| `.github/`, hosting, Render, deploy | **B** | |
| `docs/handoffs/A.md` | **A** | B ne prepisuje |
| `docs/handoffs/B.md` | **B** | A ne prepisuje |
| `docs/RUNBOOK.md`, `docs/PRODUCT.md` | **B** | 🔥 hot |
| `CLAUDE.md`, `AGENTS.md`, `.cursor/` | **B** | 🔥 hot |
| `.gitignore` | **B** | 🔥 hot — samo dopunjavati |

**Ako ti treba fajl koji nije tvoj:** komentar na issue → dogovor → izmena ide
u **jedan** PR sa usklađenim fixture-om i konzumentom. Ne radi paralelnu izmenu.

## 3. Početak zadatka

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/<A|B>/<issue-broj>-kratak-opis
gh issue edit <broj> --add-label in-progress
```

Grane: `feat/B/4-upload-revizije`, `feat/A/7-ekstrakcija-slotova`,
`fix/A/9-integrity-gate`, `chore/B/1-bootstrap`.

## 4. Commit → push → PR

```bash
git diff                                        # pregledaj pre staginga
git add -- <samo namenske putanje>              # nikad `git add .`
git diff --cached --check                       # whitespace
bash scripts/setup/check-no-private-data.sh     # guard: privatni korpus
npm run lint && npm run build                   # relevantne provere
git commit -m "feat(evidence): show source pair (#12)"
git push -u origin $(git branch --show-current)
gh pr create --base main --body-file docs/pr-body.local.md   # UTF-8 fajl
gh pr edit <pr> --add-reviewer <partner>
```

- Višelinijski opis **uvek** kroz `--body-file` (UTF-8, srpski znakovi).
- `docs/pr-body.local.md` je u `.gitignore`.
- PR sadrži: konkretan problem, ponašanje, `Closes #N`, validaciju, promenu
  contracts/env/dependencies, i sliku/video kada je UI menjan.

## 5. 🔥 Hot fajlovi — obavezan lock

`contracts/`, `convex/schema.ts`, `package.json`, `package-lock.json`,
`.gitignore`, `CLAUDE.md`, `AGENTS.md`, `docs/RUNBOOK.md`.

Pre nego što ih diraš:

1. Komentar na issue: `LOCK contracts/dossier.ts — issue #7, ~20 min`
2. Uradi izmenu u **jednom malom PR-u**, odvojeno od feature rada.
3. Merge, pa komentar: `UNLOCK contracts/dossier.ts`
4. Partner tada radi `git fetch origin && git merge origin/main`.

Bez lock-a: dva agenta prepišu isti tip i lockfile se raspadne.

## 6. Sinhronizacija feature grane

```bash
git fetch origin
git merge origin/main        # NE `git pull` naslepo, NE rebase
```

Kada: na početku zadatka, pre PR-a, posle partnerovog merge-a, i pri promeni ugovora.

## 7. Merge

- Merge radi **autor**, tek posle partnerovog review-a **na aktuelnom SHA**.
- Squash + `--match-head-commit <pregledani SHA>`.
- Svaki nov commit zahteva nov pregled.
- Nema partnera za review → issue `blocked`, ne izmišljaj odobrenje.

## 8. Konflikti

1. Pročitaj **oba** namera. Ne `--ours` / `--theirs` refleksno.
2. Uključi vlasnika fajla.
3. Sačuvaj **oba** potrebna ponašanja.
4. `package-lock.json`: usaglasi `package.json` → `npm install` → `npm ci` → `npm run build`.
5. Nikad ne skrivaj neslaganje kroz `any` / `as unknown`.

## 9. Zabranjeno

`git push --force` · `git reset --hard` · `git clean -fd` ·
direktan push na `main` posle scaffolda · dva `convex dev` watcher-a na isti
deployment · production deploy key na feature grani.

## 10. Više agenata na istom repou

- Grok Bot / Cursor / Codex / Claude Code mogu biti otvoreni istovremeno,
  ali **samo jedan menja dati fajl**.
- Jedan agent izvršava issue; drugi alat koristi se za **review**, ne za paralelnu izmenu.
- Pre prelaska alata: `git status --short` mora biti čist ili svesno sačuvan.
- Nezavršen rad ne ostavljaj samo u chat istoriji jednog alata — upiši u
  `docs/handoffs/<uloga>.md`.
