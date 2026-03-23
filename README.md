# 🛡️ Endless Sentinel

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-8B5CF6)](https://github.com/Dwica2004/endless-sentinel/releases)
[![Built for Endless](https://img.shields.io/badge/Built%20for-Endless-purple)](https://endless.link)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Web_UI-8B5CF6?style=for-the-badge&logo=vercel)](https://endless-sentinel-web.vercel.app)

**Local-first project health inspector for Endless developers.**  
Run it in 30 seconds. Fix issues before they break your build.

---

## What it does

Endless Sentinel runs **24 automated checks** across your local project and reports exactly what's broken, what's risky, and what's ready.

It's a CLI tool. It reads your files. It probes your network. It gives you a **Health Score**.  
No cloud. No sign-up. No telemetry.

---

## What's new in v2.0.0

| Feature | Description |
|---------|-------------|
| 🌐 **Live RPC Probe** | Actually pings the Endless RPC, returns `chain_id`, `epoch`, `block_height`, and response time |
| 📄 **Move.toml Validator** | Validates dependencies against `endless-labs/endless-move-framework` — catches wrong `subdir`, missing `rev`, bad git URLs |
| 📊 **Health Score Engine** | Weighted 0–100 score + letter grade (A–F) with per-category breakdown |
| 🔒 **Security Scanner v2** | Comment-aware scanning, function-based patterns, detects unchecked token transfers and missing access control |
| 🐛 **Bug fixes** | Real account detection via `.endless/config.yaml`, consistent versioning, async output ordering |

---

## Quick Start

```bash
# Clone and build
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel/apps/cli
npm install
npm run build

# Run checks
node dist/apps/cli/bin/sentinel.js

# Run checks + save JSON report
node dist/apps/cli/bin/sentinel.js --json
```

Create `sentinel.config.json` in your project root:

```json
{
  "network": "testnet"
}
```

---

## Example Output

```
🛡️  Endless Sentinel v2.0.0 — Project Inspection

Environment
  ✓ Node.js v20.10.0 is compatible
  ✓ npm 10.2.3 is compatible

Project Configuration
  ✓ Configuration file found
  ✓ Network set to: testnet
  ✓ Source directory exists

Code Hygiene
  ✓ .env is properly ignored by git
  ✓ node_modules is properly ignored
  ✓ README.md exists

Endless Network
  ✓ Network configured: testnet
  ✓ Account configured (.endless/config.yaml found)
  ✓ Using testnet (safe for development)
  ✓ RPC is LIVE [chain_id=2 | epoch=412 | block=8823901 | 341ms]

Move Smart Contracts
  ✓ Move.toml found and valid
  ✓ Move dependencies valid: EndlessFramework → endless-framework ✓
  ✓ Found 3 Move source file(s) (412 lines)
  ✓ Move code quality good: 2 module(s), entry functions ✓, resources ✓
  ✓ Module naming follows conventions

Security Analysis
  ✓ Scanned 3 Move file(s) — no issues found
  ✓ Project follows best practices (4/5 checks)

──────────────────────────────────────────────────
Status: ✅ READY
Total: 24 checks | ✓ 22 passed | ⚠ 2 warnings | ✗ 0 failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HEALTH SCORE: 92/100  │  Grade: 🟢 A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Category Breakdown:
  environment    [████████████████████] 100% (2/2) [w:10]
  project        [████████████████████] 100% (3/3) [w:15]
  hygiene        [████████████████████] 100% (3/3) [w:10]
  network        [████████████████████] 100% (4/4) [w:15]
  move           [████████████████████] 100% (5/5) [w:20]
  cli            [████████░░░░░░░░░░░░]  40% (2/5) [w:5]
  security       [████████████████████] 100% (2/2) [w:25]
```

---

## Commands

```bash
sentinel                          # Run all 24 checks (default)
sentinel --json                   # Run checks + save sentinel-report.json
sentinel compare old.json new.json # Compare two reports
sentinel badges                   # Generate shields.io badges for README
sentinel init-ci github           # Generate GitHub Actions workflow
sentinel scaffold my-project      # Scaffold Endless project structure
sentinel --help                   # Show help
```

---

## What it checks

### 🌐 Environment
- Node.js version ≥ 18.0.0
- npm version ≥ 9.0.0

### ⚙️ Project Configuration
- `sentinel.config.json` — valid and present
- Network — must be one of: `testnet`, `mainnet`, `devnet`, `localnet`
- `src/` — project source directory

### 🧹 Code Hygiene
- `.env` in `.gitignore` (security risk if missing)
- `node_modules/` in `.gitignore`
- `README.md` present

### 🌐 Endless Network *(v2.0: live probe)*
- Network configuration validity
- **Live RPC Probe** — HTTP request to `rpc.endless.link`, returns `chain_id`, `epoch`, `block_height`, response time
- **Account detection** — checks `~/.endless/config.yaml` for real account presence
- Production safety warning (mainnet detected)

### 📜 Move Smart Contracts *(v2.0: deep validator)*
- `Move.toml` — syntax and required fields
- **Dependency Validator** — validates `git` URLs against `endless-labs/endless-move-framework`, checks `subdir` (must be `endless-framework`, `endless-stdlib`, `endless-token`, or `move-stdlib`), checks `rev`
- Source files — `.move` file count and line total
- Code quality — entry functions, resources, view functions, test annotations
- Module naming — snake_case convention

### 🔧 Endless CLI
- CLI installation and command availability
- Account configuration
- CLI initialization status
- Move compiler availability

### 🔒 Security Analysis *(v2.0: comment-aware)*
- **Move Security Scanner** — strips comments before analysis to eliminate false positives
  - Unprotected `public entry fun` without signer
  - Unchecked arithmetic on variables
  - `timestamp::now_seconds` dependency
  - `coin::transfer` without signer validation
  - `move_to` without `acquires`
- **Best Practices** — tests, README, .gitignore, LICENSE, sources (scored 0–5)

---

## Health Score

Every report includes a weighted Health Score (0–100) with a letter grade.

| Grade | Score | Meaning |
|-------|-------|---------|
| 🟢 A | 90–100 | Excellent — project is ready |
| 🟢 B | 75–89 | Good — minor improvements available |
| 🟡 C | 60–74 | Fair — several issues need attention |
| 🟠 D | 40–59 | Poor — significant problems |
| 🔴 F | 0–39 | Critical — immediate action required |

**Category weights:**

| Category | Weight |
|----------|--------|
| Security | 25% |
| Move | 20% |
| Network | 15% |
| Project | 15% |
| Environment | 10% |
| Hygiene | 10% |
| CLI | 5% |

The score is included in the JSON report (`healthScore`, `grade`) and displayed in the web viewer.

---

## Web Viewer

Upload your `sentinel-report.json` to the hosted web viewer for a visual breakdown:

**[https://endless-sentinel-web.vercel.app](https://endless-sentinel-web.vercel.app)**

Or run locally:

```bash
cd apps/web
npm install
npm run dev
# Open http://localhost:5173
```

---

## Configuration

`sentinel.config.json` supports the following fields:

```json
{
  "network": "testnet",
  "rpc": "https://rpc-testnet.endless.link"
}
```

| Field | Required | Values |
|-------|----------|--------|
| `network` | Yes | `testnet`, `mainnet`, `devnet`, `localnet` |
| `rpc` | No | Custom RPC URL (overrides default) |

---

## Project Structure

```
endless-sentinel/
├── apps/
│   ├── cli/                    # Command-line tool
│   │   ├── bin/sentinel.ts     # CLI entry point
│   │   ├── checks/             # 7 check modules
│   │   │   ├── env.ts          # Environment
│   │   │   ├── project.ts      # Project config
│   │   │   ├── hygiene.ts      # Code hygiene
│   │   │   ├── network.ts      # Live RPC probe + account
│   │   │   ├── move.ts         # Move.toml + source analysis
│   │   │   ├── cli.ts          # CLI toolchain
│   │   │   └── security.ts     # Security scanner
│   │   └── utils/              # Utilities
│   │       ├── health-score.ts # Weighted scoring engine
│   │       ├── compare.ts      # Report comparison
│   │       ├── badges.ts       # README badge generator
│   │       ├── ci-templates.ts # CI/CD templates
│   │       └── scaffold.ts     # Project scaffolding
│   └── web/                    # React report viewer
│       └── src/components/     # ReportView, CategoryCard, UploadZone
└── shared/                     # Shared types & constants
    ├── schema.ts               # Report + Check types
    └── constants.ts            # Networks, weights, framework paths
```

---

## Adding a Custom Check

```typescript
// apps/cli/checks/my-check.ts
import type { CategoryResult, Check } from '../../../shared/schema.js';
import { STATUS_PASS, STATUS_FAIL } from '../../../shared/constants.js';

export function runChecks(cwd: string): CategoryResult {
  const checks: Check[] = [{
    name: 'My Check',
    status: STATUS_PASS,
    expected: 'something',
    actual: 'something',
    message: 'Check passed!',
    suggestion: null
  }];

  return { category: 'custom', status: STATUS_PASS, checks };
}
```

Register it in `bin/sentinel.ts` and add a weight in `shared/constants.ts`. Done.

---

## Privacy & Security

- ✅ **100% local** — all file checks run on your machine
- ✅ **Minimal network** — only the Live RPC Probe makes one outbound HTTP request to the Endless public RPC
- ✅ **No telemetry** — zero data collection
- ✅ **Open source** — MIT License, review the code yourself

---

## Built for Endless

Created as part of the **Endless Developer Program** to reduce onboarding friction and help teams ship faster.

- 📚 [Endless Documentation](https://docs.endless.link/)
- 🔗 [Endless SDK](https://github.com/endless-labs/endless-ts-sdk)
- 🏗️ [Move Framework](https://github.com/endless-labs/endless-move-framework)
- 🔍 [Endless Explorer](https://scan.endless.link)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Dwica2004/endless-sentinel/issues)
- **Source**: [github.com/Dwica2004/endless-sentinel](https://github.com/Dwica2004/endless-sentinel)

---

MIT License © 2026 — Built with ❤️ for the Endless community.

```bash
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel/apps/cli && npm install && npm run build
node dist/apps/cli/bin/sentinel.js
```
