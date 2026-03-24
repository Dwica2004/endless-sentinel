<div align="center">

<img src="apps/web/public/logo.png" alt="Endless Sentinel Logo" width="120" />

# Endless Sentinel

**The Developer Health Inspector for the Endless Ecosystem**

[![Version](https://img.shields.io/badge/version-2.0.0-8B5CF6?style=flat-square)](https://github.com/Dwica2004/endless-sentinel/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Built for Endless](https://img.shields.io/badge/Built%20for-Endless%20Protocol-8B5CF6?style=flat-square)](https://endless.link)
[![Live Demo](https://img.shields.io/badge/Live_Demo-endless--sentinel--web.vercel.app-10B981?style=flat-square&logo=vercel)](https://endless-sentinel-web.vercel.app)

*Run 24 automated checks on your Endless project in under 10 seconds.*  
*No cloud. No sign-up. No telemetry. 100% local-first.*

[**→ Try Live Demo**](https://endless-sentinel-web.vercel.app) · [**→ GitHub**](https://github.com/Dwica2004/endless-sentinel) · [**→ Endless Docs**](https://docs.endless.link)

</div>

---

## Why Endless Sentinel?

Every Endless developer has broken a build because of:
- A missing or wrong `rev` in `Move.toml`
- No account configured before deploying
- A dead RPC endpoint that silently fails
- A Move module with unchecked arithmetic

Endless Sentinel catches **all of that**, before you push.

It's a **CLI tool** that scans your project in seconds and produces a structured JSON report. Pair it with the **web viewer** to explore results visually — or load the [live demo](https://endless-sentinel-web.vercel.app) to see what a real report looks like, right now, with no installation.

---

## Features at a Glance

| Feature | What it Does | v2.0 |
|---------|-------------|------|
| 🌐 **Live RPC Probe** | Actually pings the Endless network — returns `chain_id`, `epoch`, `block_height`, and response time (ms) | ✅ |
| 📄 **Move.toml Validator** | Deep-parses `Move.toml` — validates git URLs against `endless-labs/endless-move-framework`, checks `subdir`, flags missing `rev` | ✅ |
| 📊 **Health Score Engine** | Calculates a weighted 0–100 score + letter grade (A–F) based on all check results | ✅ |
| 🔒 **Security Scanner v2** | Comment-aware `.move` scanning — detects unchecked arithmetic, unprotected transfers, timestamp dependencies, missing access control | ✅ |
| ⚙️ **Environment Checks** | Verifies Node.js ≥18, npm ≥9, and all toolchain requirements | ✅ |
| 🗂️ **Project Hygiene** | `.gitignore`, `.env` security, README, LICENSE, source directory structure | ✅ |
| 🔧 **CLI Readiness** | Detects Endless CLI, checks account initialization, move compiler availability | ✅ |
| 🖥️ **Web Report Viewer** | Upload and explore your JSON report in a browser — health score ring, category breakdown, auto-expand failures | ✅ |
| 🎯 **Browser RPC Probe** | Ping Testnet / Mainnet / Devnet directly from the web UI — zero install needed | ✅ |
| 📋 **Browser Move.toml Validator** | Paste your `Move.toml` and validate it instantly in the browser | ✅ |

---

## Quick Start

### 1. Clone & Build

```bash
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel/apps/cli
npm install
npm run build
```

### 2. Configure your project

Create `sentinel.config.json` in your Endless project root:

```json
{
  "network": "testnet",
  "sourceDir": "src/",
  "contractsDir": "sources/"
}
```

### 3. Run

```bash
# Navigate to your Endless project
cd /path/to/your-endless-project

# Run all checks
node /path/to/endless-sentinel/apps/cli/dist/apps/cli/bin/sentinel.js

# Output JSON report (for web viewer)
node /path/to/endless-sentinel/apps/cli/dist/apps/cli/bin/sentinel.js --json
```

### 4. View Results

Upload the generated `sentinel-report.json` to **[endless-sentinel-web.vercel.app](https://endless-sentinel-web.vercel.app)** to explore results visually.

---

## What the CLI Output Looks Like

```
╔════════════════════════════════════════╗
║   Endless Sentinel v2.0.0              ║
║   Project Health Inspector             ║
╚════════════════════════════════════════╝

[Environment]
  ✓ Node.js Version     v20.11.0 (≥18 required)
  ✓ npm Version         10.2.4 (≥9 required)

[Project]
  ✓ Configuration File  sentinel.config.json found
  ✓ Network             testnet
  ✓ Source Directory    src/

[Network — Live RPC]
  ✓ RPC Probe           testnet LIVE [chain_id=2 | epoch=1847 | block=12048392 | 287ms]
  ✓ Account Setup       .endless/config.yaml found

[Move.toml]
  ✓ Dependencies        EndlessFramework → endless-framework ✓
  ⚠ Code Quality        No #[test] annotations found — add unit tests

[Security]
  ✓ Security Scan       3 file(s) scanned — no issues found

[CLI]
  ⚠ Endless CLI         Not found in PATH
    → Install: npm install -g @endless/cli

────────────────────────────────────────
📊 Health Score: 91 / 100  Grade: A
   ✓ 22 passed  ⚠ 2 warnings  ✗ 0 failed
────────────────────────────────────────
```

---

## Health Score System

Endless Sentinel calculates a **weighted health score (0–100)** across all check categories:

| Grade | Score | Meaning |
|-------|-------|---------|
| **A** | 90–100 | Excellent — project is ready |
| **B** | 75–89 | Good — minor improvements needed |
| **C** | 60–74 | Fair — several issues to address |
| **D** | 40–59 | Poor — significant problems detected |
| **F** | 0–39 | Critical — immediate action required |

**Category weights:**

| Category | Weight | Reason |
|----------|--------|--------|
| Move Contracts | 30% | Core of every Endless project |
| Security | 25% | Vulnerabilities can cause fund loss |
| Network | 20% | Live RPC connectivity is critical |
| CLI | 10% | Deployment readiness |
| Environment | 8% | Toolchain compatibility |
| Project | 4% | Config and structure |
| Hygiene | 3% | Best practices |

---

## Web Viewer Features

The web app at **[endless-sentinel-web.vercel.app](https://endless-sentinel-web.vercel.app)** provides three tools — **all usable without installing anything**:

### 📊 Report Viewer
- Upload your `sentinel-report.json` to visualize checks
- Health Score ring + letter grade
- Auto-expand failing/warning categories
- Compact check preview when categories are collapsed
- **"✨ Try Demo"** — load a Grade A sample report instantly

### 🌐 Live RPC Probe
- Test Endless **Testnet / Mainnet / Devnet** connectivity directly from your browser
- Shows `chain_id`, `epoch`, `block_height`, `ledger_version`, and response time
- No CLI or Node.js required

### 📄 Move.toml Validator
- Paste your `Move.toml` content and validate it instantly
- Checks git URLs against `endless-labs/endless-move-framework`
- Validates `subdir` values (`endless-framework`, `endless-stdlib`, etc.)
- Flags missing `rev` fields
- Shows a 0–100 score with per-dependency results

---

## Security Checks in Detail

Endless Sentinel v2.0 features a **comment-aware** security scanner that reads `.move` source files and detects:

| Pattern | Risk Level | Description |
|---------|-----------|-------------|
| Unchecked arithmetic | 🔴 High | Integer overflow/underflow without `checked_*` variants |
| Unprotected token transfers | 🔴 High | `transfer` calls without access control guards |
| Missing `signer` check | 🔴 High | Entry functions that don't verify caller identity |
| Timestamp dependency | 🟡 Medium | `timestamp::now_*` used for randomness or critical logic |
| Missing `abort` conditions | 🟡 Medium | Functions that may silently fail |
| Direct storage mutation | 🟡 Medium | Unguarded `borrow_global_mut` patterns |
| No unit tests | 🟡 Medium | No `#[test]` annotations found in source |
| Missing README / LICENSE | 🟢 Low | Project best practices |

---

## Project Structure

```
endless-sentinel/
├── apps/
│   ├── cli/                    # TypeScript CLI tool
│   │   ├── bin/sentinel.ts     # Entry point
│   │   ├── checks/
│   │   │   ├── environment.ts  # Node.js / npm version checks
│   │   │   ├── project.ts      # Config, network, source dir
│   │   │   ├── hygiene.ts      # .gitignore, .env, docs
│   │   │   ├── network.ts      # Live RPC probe + account
│   │   │   ├── move.ts         # Move.toml deep validator
│   │   │   ├── cli.ts          # Endless CLI detection
│   │   │   ├── security.ts     # Move security scanner v2
│   │   │   └── health-score.ts # Weighted score engine
│   │   └── package.json
│   └── web/                    # React + Vite web viewer
│       ├── src/
│       │   ├── components/
│       │   │   ├── ReportView.tsx      # Main report display
│       │   │   ├── CategoryCard.tsx    # Accordion category card
│       │   │   ├── CheckItem.tsx       # Individual check row
│       │   │   ├── UploadZone.tsx      # File upload + demo
│       │   │   ├── NetworkProbe.tsx    # Browser RPC tester
│       │   │   └── MoveTomlValidator.tsx # Browser TOML checker
│       └── package.json
└── shared/
    ├── schema.ts       # Report types (Report, CategoryResult, Check)
    └── constants.ts    # RPC URLs, weights, category names
```

---

## Checks Reference (All 24)

<details>
<summary><strong>🖥️ Environment (2 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| Node.js Version | ≥ 18.0.0 | Ensures async/ESM compatibility |
| npm Version | ≥ 9.0.0 | Modern lockfile and workspace support |

</details>

<details>
<summary><strong>⚙️ Project Configuration (3 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| Configuration File | `sentinel.config.json` | Sentinel config present |
| Network | testnet / mainnet / devnet | Valid network target |
| Source Directory | `src/` | Source directory exists |

</details>

<details>
<summary><strong>🧹 Code Hygiene (3 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| .env Security | In `.gitignore` | Secrets not committed |
| node_modules | In `.gitignore` | Dependencies not tracked |
| Documentation | `README.md` exists | Project is documented |

</details>

<details>
<summary><strong>🌐 Network / RPC (4 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| Network Config | Valid network | Correctly set in config |
| Account Setup | `.endless/config.yaml` | Endless account configured |
| Network Safety | Testnet for dev | Not accidentally using mainnet |
| **Live RPC Probe** | Responsive, <3000ms | Actually pings the Endless RPC |

</details>

<details>
<summary><strong>📜 Move Contracts (5 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| Move.toml Present | Valid toml | Manifest exists and parses |
| Dependencies | Official framework git URL | Against `endless-labs/endless-move-framework` |
| Source Files | `.move` files in `sources/` | Contracts present |
| Code Quality | Modules, entry fns, resources | Structure analysis |
| Naming Conventions | `snake_case` | Module naming follows convention |

</details>

<details>
<summary><strong>🔧 CLI Readiness (5 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| CLI Installation | `endless` in PATH | CLI available globally |
| CLI Commands | Commands accessible | Full CLI detected |
| Account Config | CLI account configured | Deployment account set up |
| CLI Initializaton | `endless init` run | CLI properly initialized |
| Move Compiler | Included in CLI | Build toolchain ready |

</details>

<details>
<summary><strong>🔒 Security (2 checks)</strong></summary>

| Check | Expected | Description |
|-------|----------|-------------|
| Move Security Scan | 0 high-severity issues | Comment-aware pattern detection |
| Best Practices | Tests, README, `.gitignore`, LICENSE, sources | 5/5 project hygiene markers |

</details>

---

## Changelog

### v2.0.0 — March 2026
- ✅ **Live RPC Probe** — Real network connectivity test with chain data
- ✅ **Move.toml Validator** — Deep dependency analysis against Endless framework
- ✅ **Health Score Engine** — Weighted 0–100 score system with letter grades
- ✅ **Security Scanner v2** — Comment-stripping, function-based patterns
- ✅ **3-Tab Web UI** — Report Viewer + Browser RPC Probe + Browser Move.toml Validator
- ✅ **Demo Mode** — Try web viewer instantly without installing CLI
- ✅ **ESM migration** — Full ESM compatibility, clean async output
- ✅ **Account detection** — Reads `.endless/config.yaml` for real account status

### v1.2.0 — February 2026
- Basic check suite (18 checks)
- Initial web report viewer
- JSON report output
- Move.toml presence check

### v1.0.0 — February 2026
- Initial release
- CLI with 12 environment and project checks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI | TypeScript, Node.js ESM, tsx |
| Web UI | React 18, Vite, TypeScript |
| Styling | Vanilla CSS (dark mode, glassmorphism, animations) |
| Shared | TypeScript monorepo with npm workspaces |
| Deploy | Vercel (web), GitHub (CLI) |

---

## Contributing

Pull requests and issues are welcome.

```bash
# Install all workspaces
npm install

# Build CLI
cd apps/cli && npm run build

# Run web dev server
cd apps/web && npm run dev
```

---

## License

MIT © [Dwica2004](https://github.com/Dwica2004)

Built for the [Endless Protocol](https://endless.link) ecosystem. Not officially affiliated with Endless Labs.

---

<div align="center">

Made with ❤️ for the Endless developer community

[![Star on GitHub](https://img.shields.io/github/stars/Dwica2004/endless-sentinel?style=social)](https://github.com/Dwica2004/endless-sentinel)

</div>
