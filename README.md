# Endless Sentinel

Local project health inspector for Endless developers.

## What is this?

Sentinel checks if your development environment is ready before you start building on Endless. It validates Node.js versions, project config, and basic code hygiene stuff.

Instead of spending hours debugging setup issues, run Sentinel and fix problems in 30 seconds.

## How it works

1. Run the CLI in your project folder
2. Sentinel checks your environment and project structure
3. Get a report (console or JSON)
4. Fix whatever failed

Everything runs locally. No remote calls, no data collection.

## What it checks

**Environment:**
- Node.js >= 18.0.0
- npm >= 9.0.0

**Project:**
- Config file exists (`sentinel.config.json`)
- Network is valid (`testnet`, `mainnet`, or `devnet`)
- `src/` directory present

**Hygiene:**
- `.env` is in `.gitignore`
- `node_modules` is ignored
- `README.md` exists

## Installation

```bash
# Clone the repo
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel

# Build CLI
cd apps/cli
npm install
npm run build
```

## Usage

### Run checks

```bash
# From any project
node /path/to/endless-sentinel/apps/cli/dist/apps/cli/bin/sentinel.js
```

**Example output:**
```
🛡️  Endless Sentinel — Project Inspection

Environment
  ✓ Node.js v20.10.0 is compatible
  ✓ npm 10.2.3 is compatible

Project Configuration
  ✗ sentinel.config.json missing
    → Create sentinel.config.json with {"network": "testnet"}

Status: ❌ NOT READY
```

### Generate JSON report

```bash
node /path/to/sentinel.js --json
```

This creates `sentinel-report.json` in your project directory.

### View report in browser (optional)

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173 and upload your `sentinel-report.json`.

## Project structure

```
endless-sentinel/
├── apps/cli/        # CLI that runs checks
├── apps/web/        # Web viewer for reports
└── shared/          # Types and constants
```

- **CLI** runs all the checks and generates JSON
- **Web** just displays the JSON (read-only)
- **Shared** keeps types consistent between both

## Config file

Create `sentinel.config.json` in your project:

```json
{
  "network": "testnet"
}
```

Valid networks: `testnet`, `mainnet`, `devnet`

## Adding custom checks

Create a new file in `apps/cli/checks/` and export a `runChecks()` function:

```typescript
import type { CategoryResult } from '../../../shared/schema.js';

export function runChecks(): CategoryResult {
  return {
    category: 'custom',
    status: 'pass',
    checks: [
      {
        name: 'My Check',
        status: 'pass',
        expected: 'something',
        actual: 'something',
        message: 'All good',
        suggestion: null
      }
    ]
  };
}
```

Then import it in `apps/cli/bin/sentinel.ts`.

## Why local-first?

- No API calls means it works offline
- Your code never leaves your machine
- No authentication needed
- Fast (checks run in <1 second)

## License

MIT — do whatever you want with it.

## Built for Endless

Made as part of the Endless Developer Program to help builders catch setup issues early.

If it saved you time, share it. 🛡️
