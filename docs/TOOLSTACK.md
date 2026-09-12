# Alati, MCP-ovi i env matrica

## 1. Koji alat za koji posao

| Alat | Za šta | Zašto |
|---|---|---|
| **Claude Code** | Contracts, engine, pravila, Convex funkcije, integracija generisanog UI-ja, review | Vidi ceo repo; MCP-ovi (convex, daytona, render, exa, firecrawl) su ovde povezani |
| **Codex** | Izolovani algoritamski zadaci: parser kataloga, PDF ekstrakcija, diff revizija | Dobro radi jedan jasno ograničen fajl u sandboxu |
| **Cursor** | Interaktivna doradа UI-ja, brze vizuelne izmene | Najbrža povratna informacija na ekranu |
| **Grok Bot** | Host editor hakatona — koristiti ga za deo commit-ova | Ocenjuje se korišćenje partner alata |
| **v0** | Generisanje UI ekrana iz prompta (React + Tailwind + shadcn) | Najbrže do upotrebljivog ekrana |
| **Wonder** | Alternativa v0: dizajn canvas → React + Tailwind | Bolje kad želiš vizuelnu kontrolu layout-a |
| **Wispr Flow** | Diktiranje srpskog stručnog teksta (primedbe, opisi) | Brže od kucanja ćirilice/dijakritike |
| **Fal.ai** | Opciono: jedna ilustracija za video | Nije zavisnost ZOP pipeline-a |

**Pravilo:** alat je zamenljiv, kontekst nije. Svaki alat čita `AGENTS.md` /
`CLAUDE.md` → `docs/`. Ako menjaš alat, ne menjaš pravila.

## 2. MCP status

| MCP | Transport | Status | Napomena |
|---|---|---|---|
| `convex` | stdio `npx -y convex@latest mcp start` | ✅ | upiti nad dev deployment-om |
| `daytona` | stdio `daytona mcp start` | ✅ | CLI prijavljen (org Personal) |
| `firecrawl` | http `mcp.firecrawl.dev/v2/mcp` | ✅ | hosted, bez ključa |
| `exa` | http `mcp.exa.ai/mcp` | ✅ | hosted, bez ključa |
| `fal-ai` | http `mcp.fal.ai/mcp` | ✅ | header `Authorization: Key <id>:<secret>` |
| `render` | http `mcp.render.com/mcp` | ✅ | header `Authorization: Bearer rnd_…` |
| `wonder` | http `mcp.wonder.so/mcp` | ⚠️ | traži `claude mcp login wonder` u pravom terminalu |

Dodavanje (user scope, van repoa):

```bash
claude mcp add -s user convex -- npx -y convex@latest mcp start
claude mcp add -s user daytona -- daytona mcp start
claude mcp add -s user -t http exa https://mcp.exa.ai/mcp
claude mcp add -s user -t http firecrawl https://mcp.firecrawl.dev/v2/mcp
claude mcp add -s user -t http wonder https://mcp.wonder.so/mcp
claude mcp add -s user -t http render https://mcp.render.com/mcp -H 'Authorization: Bearer <RENDER_API_KEY>'
claude mcp add -s user -t http fal-ai https://mcp.fal.ai/mcp -H 'Authorization: Key <FAL_KEY>'
```

⚠️ Render **ne** radi preko hosted OAuth-a u Claude Code (nema dynamic client
registration), a npm paket `@render-oss/render-mcp-server` **ne postoji** (404).
Radi samo hosted endpoint + `Bearer` ključ, kako je gore.

## 3. Env matrica — koji ključ gde ide

| Promenljiva | `.env.local` (lokalno) | Convex **dev** | Convex **prod** | Render env |
|---|:--:|:--:|:--:|:--:|
| `XAI_API_KEY` | ✅ | ✅ | ✅ | ✗ |
| `XAI_MODEL` (`grok-4.6`) | ✅ | ✅ | ✅ | ✗ |
| `DAYTONA_API_KEY` | ✅ | ✅ | ✅ | ✗ |
| `DAYTONA_SNAPSHOT` (`saglasnik-docs-v1`) | ✅ | ✅ | ✅ | ✗ |
| `FAL_KEY` | ✅ | opciono | opciono | ✗ |
| `RENDER_API_KEY` | ✅ (MCP) | ✗ | ✗ | ✗ |
| `EXA_API_KEY`, `FIRECRAWL_API_KEY` | opciono | samo ako app dopunjuje znanje | ✗ | ✗ |
| `CONVEX_DEPLOY_KEY` | ✗ | ✗ | ✗ | ✅ samo tu |
| `VITE_CONVEX_URL` | CLI upisuje | — | — | build ga dobija |

**Tvrda pravila:**
- Nijedan serverski ključ **nikad** ne dobija `VITE_` prefiks.
- `.env.local` je u `.gitignore`. `.env.example` ostaje bez vrednosti.
- Spoljni API pozivi idu iz Convex **server action-a**, nikad iz `src/`.
- Production deploy key nikad na feature grani.

Provera pre svakog PR-a:

```bash
grep -rn 'VITE_[A-Z_]*\(API_KEY\|SECRET\|TOKEN\|DEPLOY_KEY\)' src/ && echo LEAK || echo ok
```

## 4. Modeli (x.ai) — provereno

Dostupno na našem ključu: `grok-4.6`, `grok-4.5`, `grok-4.3`,
`grok-4.20-0309-reasoning`, `grok-4.20-0309-non-reasoning`,
`grok-4.20-multi-agent-0309`, `grok-build-0.1`. Svi primaju `text` + `image`.

Izabran: **`grok-4.6`**. Strukturisani izlaz (`json_schema`, `strict: true`)
proveren — PASS.

```bash
node --env-file=.env.local scripts/setup/smoke-api.mjs xai
```

Slike crteža zahtevaju vision model — `grok-4.6` to ima. Rezultat ekstrakcije
nad stvarnim crtežom se **meri** u `docs/MODEL-EVAL.md`, ne pretpostavlja.

## 5. v0 ili Wonder — integracioni ugovor

Oba su dopuštena i **zamenjiva**. Bira se po brzini, ne po ideologiji.

### Ugovor koji važi za oba

1. Generisani kod ide **isključivo** u `src/components/generated/`.
2. Generisani kod **ne sme**: importovati `convex/`, čitati `import.meta.env`,
   hardkodovati podatke, ni sam dohvatati podatke.
3. Komponente primaju **typed props i callback-ove** iz `docs/CONTRACTS.md`.
4. B ih prepakuje u `src/features/<oblast>/` i tek tu vezuje na Convex.
5. Ni v0 ni Wonder **ne smeju** dirati `convex/`, `contracts/`, `package-lock.json`.
6. Svaki inicijalni podatak je jasno označen kao **demo fixture**.

### v0 tok

```
prompt u v0  →  pregled  →  `npx shadcn add <v0-url>`  ili copy/paste
             →  src/components/generated/<Ekran>.tsx
             →  git diff  →  ručno ukloniti mock fetch/state
             →  B veže na Convex u src/features/
```

### Wonder tok

```
canvas u Wonder  →  export React+Tailwind
                 →  src/components/generated/
                 →  isti diff/čišćenje kao za v0
```

### Zajednički prompt (radi i u v0 i u Wonder-u)

> Build a professional Serbian-language workspace for technical project review.
> React + TypeScript + Tailwind. A working workspace, not a landing page.
> Shared navigation: Pregled, Dokumenti, Zadaci, Revizije, Moduli.
> Module catalog: "Zaštita od požara" = Aktivno; architecture, structural,
> electrical, mechanical, hydrotechnical = Planirano, disabled, no results.
> ZOP dossier screen: findings list left, cited original document center,
> contextual actions right. A conflict shows BOTH source observations side by side.
> Show state chain explicitly: predloženo → prihvaćeno → primenjeno → provereno.
> Never conflate acceptance with resolution.
> Understated document-focused visual system, excellent typography, accessible
> contrast, keyboard controls, responsive. Prioritize legibility of technical drawings.
> Empty, loading, error and partial states must all exist.
> Components take typed props and callbacks only — no data fetching, no secrets.
> Label all sample data as demo fixtures.

## 6. Lokalni alati — provereno na ovoj mašini

| Alat | Verzija | Status |
|---|---|---|
| git | 2.50.1 | ✅ |
| gh | 2.96.0 | ✅ prijavljen (`Excapex`), ⚠️ nema `workflow` scope |
| node | 26.5.0 | ✅ (`engines: >=24`; CI koristi 24) |
| npm | 11.17.0 | ✅ |
| python3.12 | 3.12.14 | ✅ (`python3` je 3.9.6 — koristi `python3.12`) |
| Daytona CLI | v0.211.2 | ✅ prijavljen; ⚠️ API je v0.213.0 (samo warning) |
| Cursor, Wonder, Wispr Flow | instalirani | ✅ u `/Applications` |
