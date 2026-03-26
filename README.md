<div align="center">

<img src="apps/web/public/logo.png" alt="Endless Sentinel" width="100" />

# Endless Sentinel

**Pre-flight checks for Endless projects.**

Catch broken configs, dead RPCs, bad Move.toml dependencies, and security anti-patterns — before you deploy.

[![Version](https://img.shields.io/badge/v2.0.0-8B5CF6?style=flat-square&label=version)](https://github.com/Dwica2004/endless-sentinel/releases)
[![License: MIT](https://img.shields.io/badge/MIT-blue?style=flat-square&label=license)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Built for Endless](https://img.shields.io/badge/Endless%20Protocol-8B5CF6?style=flat-square)](https://endless.link)

[Live Web UI](https://endless-sentinel-web.vercel.app) · [Report an Issue](https://github.com/Dwica2004/endless-sentinel/issues)

</div>

---

## The Problem

You're building on Endless. You write your Move modules, configure your project, set up your account — then you deploy and something breaks.

Wrong `rev` in `Move.toml`. Dead RPC endpoint. CLI not initialized. `.env` committed to git. An unguarded `transfer` call in your contract.

These are preventable. Endless Sentinel prevents them.

---

## What It Does

Sentinel runs **24 checks** against your local project and produces a structured report with a health score.

```
$ sentinel --json

📊 Health Score: 91 / 100  [Grade A]
   ✓ 22 passed   ⚠ 2 warnings   ✗ 0 failed
```

It checks **seven categories**:

| Category | Checks | What it catches |
|----------|--------|-----------------|
| **Environment** | Node.js, npm versions | Incompatible toolchain |
| **Project** | Config file, network target, source dir | Missing or misconfigured setup |
| **Hygiene** | `.gitignore`, `.env`, README | Leaked secrets, missing docs |
| **Network** | Live RPC probe, account setup | Dead endpoints, missing accounts |
| **Move** | `Move.toml` deps, source analysis, naming | Wrong framework URLs, missing `rev`, no tests |
| **CLI** | Endless CLI, compiler, init status | Deployment blockers |
| **Security** | Move source scanning (8 patterns) | Unchecked math, unguarded transfers, missing signers |

Every check returns `pass`, `warn`, or `fail` — with an expected value, actual value, and actionable fix suggestion.

---

## How It Works

**CLI** — runs locally, reads your project files, probes the network, outputs structured JSON.

```bash
# Run all checks
sentinel

# Output JSON report for the web viewer
sentinel --json
```

**Web Viewer** — upload the JSON report to visualize results. Or use the browser-based tools directly:

- **Report Viewer** — Health score ring, category breakdown, auto-expanding failures
- **RPC Probe** — Test Testnet / Mainnet / Devnet connectivity without the CLI
- **Move.toml Validator** — Paste and validate your deps against the Endless framework

The web viewer is live at **[endless-sentinel-web.vercel.app](https://endless-sentinel-web.vercel.app)**. No login. No data sent to any server.

---

## Installation

```bash
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel/apps/cli
npm install && npm run build
```

Requires Node.js ≥ 18.

---

## Usage

Navigate to your Endless project directory first:

```bash
cd /path/to/your-endless-project
```

Then run:

```bash
# Full check suite
node /path/to/endless-sentinel/apps/cli/dist/apps/cli/bin/sentinel.js

# Generate JSON report
node /path/to/endless-sentinel/apps/cli/dist/apps/cli/bin/sentinel.js --json
```

Create a `sentinel.config.json` in your project root to configure:

```json
{
  "network": "testnet",
  "sourceDir": "src/",
  "contractsDir": "sources/"
}
```

Upload the generated `sentinel-report.json` to the [web viewer](https://endless-sentinel-web.vercel.app) to explore results.

---

## Example Output

```
╔═══════════════════════════════════════════╗
║  Endless Sentinel v2.0.0                  ║
║  Project Health Inspector                 ║
╚═══════════════════════════════════════════╝

[Environment]
  ✓ Node.js Version      v20.11.0
  ✓ npm Version          10.2.4

[Project Configuration]
  ✓ Config File          sentinel.config.json
  ✓ Network              testnet
  ✓ Source Directory      src/

[Network]
  ✓ RPC Probe            chain_id=2 | epoch=1847 | 287ms
  ✓ Account Setup        .endless/config.yaml found

[Move]
  ✓ Move.toml            2 deps validated
  ✓ Source Files          3 files, 486 lines
  ⚠ Code Quality         No #[test] annotations

[Security]
  ✓ Source Scan           3 files — no issues
  ✓ Best Practices       5/5

[CLI]
  ⚠ Endless CLI          Not in PATH
    → npm install -g @endless/cli

────────────────────────────────────────
📊  91 / 100   Grade A
    ✓ 22 passed  ⚠ 2 warnings  ✗ 0 failed
────────────────────────────────────────
```

---

## Health Score

Sentinel calculates a weighted score (0–100) across all categories.

| Grade | Range | Meaning |
|-------|-------|---------|
| **A** | 90–100 | Ship it. |
| **B** | 75–89 | Almost there — minor fixes needed. |
| **C** | 60–74 | Needs work before deploying. |
| **D** | 40–59 | Significant issues detected. |
| **F** | 0–39 | Do not deploy. |

Category weights reflect real-world risk:

| Category | Weight | Why |
|----------|--------|-----|
| Move Contracts | 30% | Core logic — wrong deps break builds |
| Security | 25% | Vulnerabilities can drain funds |
| Network | 20% | Dead RPCs block deployment |
| CLI | 10% | Missing toolchain = can't compile |
| Environment | 8% | Incompatible Node.js = runtime errors |
| Project | 4% | Config issues are quick fixes |
| Hygiene | 3% | Best practices, low severity |

---

## Security Scanner

The security scanner reads `.move` source files with **comment stripping** — it won't flag patterns inside comments or strings.

| Pattern | Severity | Description |
|---------|----------|-------------|
| Unchecked arithmetic | High | Overflow/underflow without `checked_*` variants |
| Unguarded transfers | High | `transfer` without access control |
| Missing signer verification | High | Entry functions that don't verify caller |
| Timestamp dependency | Medium | `timestamp::now_*` used in critical logic |
| Missing abort conditions | Medium | Functions that silently fail |
| Direct storage mutation | Medium | Unguarded `borrow_global_mut` |
| No unit tests | Medium | No `#[test]` annotations in source |
| Missing docs/license | Low | Project best practices |

---

## Why This Exists

The Endless ecosystem is growing. More developers are building Move contracts, deploying modules, integrating with the RPC — but there's no standard tool to verify that a project is correctly set up before deployment.

Sentinel fills that gap. One command, 24 checks, actionable output.

It doesn't replace testing. It doesn't replace audits. It catches the setup and configuration mistakes that waste hours of debugging time.

---

## Project Structure

```
endless-sentinel/
├── apps/
│   ├── cli/                     # CLI tool (TypeScript, ESM)
│   │   ├── bin/sentinel.ts      # Entry point
│   │   └── checks/              # Check modules
│   │       ├── environment.ts
│   │       ├── project.ts
│   │       ├── hygiene.ts
│   │       ├── network.ts       # Live RPC probe
│   │       ├── move.ts          # Move.toml validator
│   │       ├── cli.ts
│   │       ├── security.ts      # Comment-aware scanner
│   │       └── health-score.ts  # Weighted scoring engine
│   └── web/                     # React + Vite web viewer
│       └── src/components/
│           ├── ReportView.tsx
│           ├── NetworkProbe.tsx  # Browser RPC tester
│           └── MoveTomlValidator.tsx
└── shared/
    ├── schema.ts                # Report type definitions
    └── constants.ts             # RPC URLs, category weights
```

---

## Roadmap

- [ ] `npx endless-sentinel` — zero-install execution
- [ ] CI/CD integration — GitHub Actions workflow
- [ ] `Move.toml` lockfile validation
- [ ] Gas estimation checks
- [ ] Multi-project workspace scanning
- [ ] Plugin system for custom checks

---

## Contributing

```bash
# Install dependencies
npm install

# Build CLI
cd apps/cli && npm run build

# Start web dev server
cd apps/web && npm run dev
```

Issues and PRs welcome.

---

## License

MIT · [Dwica2004](https://github.com/Dwica2004)

Built for the [Endless](https://endless.link) ecosystem.
