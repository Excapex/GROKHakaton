# AGENTS.md — univerzalni ulaz za sve agente

Ovaj fajl čitaju **Codex** i **Cursor**. Claude Code čita `CLAUDE.md`.
Grok Bot čita ovaj fajl ili `CLAUDE.md`, zavisno od podešavanja.

**Svi alati dele isti kontekst kroz `docs/`. Ne duplirati pravila ovde — samo pokazivati na izvor.**

## Obavezno pročitati pre prvog rada

| Fajl | Šta daje |
|---|---|
| `CLAUDE.md` | Zajednički protokol: uloge, issues, git, kvalitet |
| `docs/RUNBOOK.md` | **Step-by-step: ko radi šta, u kom alatu, kojim redom** |
| `docs/GIT-PROTOCOL.md` | Push, ownership fajlova, izbegavanje konflikata |
| `docs/TOOLSTACK.md` | Alati, MCP-ovi, env matrica, v0/Wonder integracija |
| `docs/LOCAL-DATA.md` | **Šta NIKAD ne ide u Git** |
| `docs/PRODUCT.md` | Šta pravimo i šta je van obuhvata |
| `docs/CONTRACTS.md` | Tipovi i ugovori između A i B |
| `CLAUDE.local.md` | Tvoja lokalna uloga (A ili B), nije u Gitu |

## Pravila koja važe za svaki alat

1. **Jedan issue = jedna grana = jedan agent.** Ne puštaj dva agenta na isti fajl, čak ni iz različitih alata.
2. **Poštuj ownership iz `docs/GIT-PROTOCOL.md`.** Ako ti treba tuđi fajl, otvori komentar na issue-u i čekaj.
3. **Nikad `git push --force`, `git reset --hard`, `git clean`.**
4. **Pre commita:** `bash scripts/setup/check-no-private-data.sh`
5. **Ne izmišljaj rezultat.** `Done` znači izmereno i pregledano, ne „napisano u specifikaciji".
6. **Ne ispisuj tajne.** Ključevi su u `.env.local` i u Convex/Render dashboardu.
7. **Nepoznat podatak ostaje `unknown`** — nikad povoljan `PASS`.
8. **Generisani UI (v0/Wonder) ide u `src/components/generated/`** i integriše ga samo B.

## Prvi korak svake sesije

```bash
cat CLAUDE.local.md          # koja sam uloga
git status --short && git branch --show-current
git fetch origin
gh issue list --assignee @me --label ready
```
