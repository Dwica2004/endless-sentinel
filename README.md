# 🛡️ Endless Sentinel

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built for Endless](https://img.shields.io/badge/Built%20for-Endless-purple)](https://endless.link)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Web_UI-8B5CF6?style=for-the-badge&logo=vercel)](https://endless-sentinel-web.vercel.app)

**Your Endless project health inspector — catch setup issues before you deploy.**

Endless Sentinel is a comprehensive developer tool that validates your Endless development environment, Move smart contracts, network configuration, and project hygiene in seconds. Built specifically for the Endless ecosystem, it eliminates hours of debugging by catching configuration issues, security patterns, and environment problems before they become blockers.

---

## 🚀 Why Sentinel?

Building on Endless requires proper environment setup, Move language knowledge, network configuration, and CLI tools. **Setting all this up correctly is hard.** Sentinel automates the validation process so you can focus on building great DApps.

### Real Problems Sentinel Solves:

- ✅ **"Why won't my Move contract compile?"** → Sentinel checks Move.toml, source structure, and naming conventions
- ✅ **"Is my network configured correctly?"** → Validates RPC endpoints, network settings, and account setup
- ✅ **"Do I have the right CLI tools?"** → Checks Endless CLI installation, commands, and Move compiler
- ✅ **"Are my dependencies up to date?"** → Validates Node.js, npm, and ecosystem versions
- ✅ **"Is my project following best practices?"** → Checks code hygiene, gitignore rules, and documentation

Instead of spending hours debugging, **run Sentinel and fix issues in 30 seconds.**

---

## 📊 What It Checks

Sentinel performs **23 comprehensive checks** across 7 categories, plus powerful team collaboration tools:

### 🌐 **Environment**
- Node.js version compatibility (≥18.0.0)
- npm version validation (≥9.0.0)

### ⚙️ **Project Configuration**
- `sentinel.config.json` presence and validity
- Network configuration (testnet/mainnet/devnet/localnet)
- Source directory structure

### 🧹 **Code Hygiene**
- `.env` in `.gitignore` (security)
- `node_modules` ignored
- README.md exists

### 🌐 **Endless Network**
- Network configuration validity
- RPC endpoint connectivity
- Account setup verification
- Production vs development safety checks

### 📜 **Move Smart Contracts**
- `Move.toml` manifest validation
- Move source files detection
- Security pattern analysis
- Module naming conventions (snake_case)
- Resource usage patterns
- Public function safety

### 🔧 **Endless CLI**
- Endless CLI installation
- Command availability
- Account configuration
- CLI initialization status
- Move compiler availability

### 🔒 **Security Analysis** *(NEW in v1.2.0)*
- **Move Vulnerability Scanner**
  - Unprotected public functions
  - Arithmetic overflow/underflow detection
  - Timestamp dependency risks
  - Missing access control
- **Best Practices Validation**
  - Test coverage
  - Documentation completeness

### 🤝 **Team Collaboration** *(NEW in v1.2.0)*
- **Compare Reports** - Track improvements over time
- **Badge Generation** - shields.io badges for README
- **CI/CD Templates** - Auto-generate GitHub Actions, GitLab CI, CircleCI
- **Project Scaffolding** - Create ideal Endless project structure

---

## 🎯 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel

# Install dependencies and build
cd apps/cli
npm install
npm run build
```

### Usage

```bash
# Run all checks
sentinel

# Save report as JSON
sentinel --json

# Compare two reports (track improvements)
sentinel compare old-report.json new-report.json

# Generate badges for README
sentinel badges

# Setup CI/CD (GitHub Actions, GitLab CI, CircleCI)
sentinel init-ci github

# Create new Endless project
sentinel scaffold my-project

# Show help
sentinel --help
```

**Example output:**

```
🛡️  Endless Sentinel — Project Inspection

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
  ✓ RPC endpoint ready: https://testnet.endless.link
  ⚠ Verify your Endless account is set up
    → Run: endless account list
  ✓ Using testnet (safe for development)

Move Smart Contracts
  ✓ Move.toml found and valid
  ✓ Found 3 Move source file(s)
  ✓ Move code structure looks good
  ✓ Module naming follows conventions

Endless CLI
  ✓ Endless CLI is installed: v1.0.0
  ✓ CLI commands are accessible
  ✓ Endless account(s) configured
  ✓ Endless CLI is configured
  ✓ Move compiler is available via Endless CLI

──────────────────────────────────────────────────

Status: ✅ READY
Total: 21 checks | ✓ 20 passed | ⚠ 1 warnings | ✗ 0 failed
```

### Generate JSON Report

```bash
# Create machine-readable report
node /path/to/sentinel.js --json
# Creates sentinel-report.json in your project directory
```

### View in Browser (Optional)

```bash
# Start web UI
cd apps/web
npm install
npm run dev

# Open http://localhost:5173
# Upload your sentinel-report.json for visual report
```

---

## 📁 Project Structure

```
endless-sentinel/
├── apps/
│   ├── cli/              # Command-line tool (core checks)
│   │   ├── bin/          # CLI entry point
│   │   ├── checks/       # Check modules
│   │   │   ├── env.ts        # Environment checks
│   │   │   ├── project.ts    # Project config
│   │   │   ├── hygiene.ts    # Code hygiene
│   │   │   ├── network.ts    # Endless network
│   │   │   ├── move.ts       # Move contracts
│   │   │   └── cli.ts        # CLI validation
│   │   └── dist/         # Compiled output
│   └── web/              # Web UI for reports
├── shared/               # Shared types & constants
├── README.md
└── package.json
```

**Architecture:**
- **CLI** performs all checks and generates JSON reports
- **Web UI** provides visual interface for reports (read-only)
- **Shared** maintains type consistency between CLI and web

---

## ⚙️ Configuration

Create `sentinel.config.json` in your project root:

```json
{
  "network": "testnet"
}
```

**Valid networks:**
- `testnet` - For testing (recommended for development)
- `mainnet` - Production network ⚠️ Use with caution
- `devnet` - Development network
- `localnet` - Local Endless node

---

## 🔧 Adding Custom Checks

Extend Sentinel with your own validation logic:

### 1. Create a new check module

```typescript
// apps/cli/checks/my-custom-check.ts
import type { CategoryResult, Check } from '../../../shared/schema.js';
import { STATUS_PASS, STATUS_FAIL } from '../../../shared/constants.js';

export function runChecks(cwd: string): CategoryResult {
  const checks: Check[] = [
    {
      name: 'My Custom Check',
      status: STATUS_PASS,
      expected: 'something',
      actual: 'something',
      message: 'Check passed!',
      suggestion: null
    }
  ];

  return {
    category: 'custom',
    status: STATUS_PASS,
    checks
  };
}
```

### 2. Register in `apps/cli/bin/sentinel.ts`

```typescript
import * as customChecks from '../checks/my-custom-check.js';

// In runAllChecks():
const categories: CategoryResult[] = [
  // ... existing checks
  customChecks.runChecks(cwd)
];
```

### 3. Add category name in `shared/constants.ts`

```typescript
export const CATEGORY_CUSTOM = 'custom' as const;

export const CATEGORY_NAMES: Record<string, string> = {
  // ... existing categories
  [CATEGORY_CUSTOM]: 'My Custom Checks'
};
```

---

## 🎨 Features & Highlights

### **Endless-Native Design**
Built specifically for Endless ecosystem with deep integration:
- Move language validation
- Endless network connectivity
- RPC endpoint verification
- CLI toolchain checks

### **Fast & Local-First**
- All checks run locally (< 2 seconds)
- No external API calls
- No data collection
- Works completely offline
- Your code never leaves your machine

### **Actionable Insights**
Every failed check includes:
- What was expected
- What was actually found
- Specific suggestion to fix the issue

### **Developer-Friendly**
- Color-coded console output
- Machine-readable JSON reports
- Optional web UI for visualization
- Extensible architecture for custom checks

### **Production-Ready**
- Type-safe TypeScript codebase
- Comprehensive error handling
- Exit codes for CI/CD integration
- Modular, testable architecture

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Adding New Checks
1. Create a new check module in `apps/cli/checks/`
2. Follow the existing pattern (see `env.ts` as reference)
3. Export a `runChecks()` function returning `CategoryResult`
4. Add tests for your check logic
5. Submit a pull request

### Improving Existing Checks
- Found a false positive? Open an issue
- Better validation logic? Send a PR
- New security patterns? We'd love to see them

### Documentation
- Fix typos or unclear sections
- Add usage examples
- Create tutorials or guides

---

## 📖 Documentation

### For Developers
- [Architecture Overview](./docs/architecture.md) - System design and structure
- [API Reference](./docs/api.md) - Type definitions and interfaces
- [Adding Custom Checks](./docs/custom-checks.md) - Extension guide

### For Users
- [Quick Start Guide](./docs/quickstart.md) - Get up and running
- [FAQ](./docs/faq.md) - Common questions
- [Troubleshooting](./docs/troubleshooting.md) - Fix common issues

---

## 🔒 Security & Privacy

- ✅ **100% Local**: All checks run on your machine
- ✅ **No Telemetry**: Zero data collection or tracking
- ✅ **No External Calls**: No network requests (except CLI network validation)
- ✅ **Open Source**: Full transparency - review the code yourself

---

## 🌟 Why Local-First?

**No API calls** means:
- Works offline (perfect for travel/remote work)
- Your code stays private
- No authentication required
- Blazing fast execution (< 2 seconds)
- No rate limits or quotas

---

## 📜 License

MIT License - do whatever you want with it.

See [LICENSE](./LICENSE) for full details.

---

## 🏗️ Built for Endless

Created as part of the **Endless Developer Program** to help builders ship faster and avoid common setup pitfalls.

Endless Sentinel saves developers time by catching issues early, enabling them to focus on what matters: **building amazing Web3 applications.**

### Learn More
- 📚 [Endless Documentation](https://docs.endless.link/)
- 🚀 [Quick Start Guide](https://docs.endless.link/endless/devbuild/quick_start)
- 👥 [Developer Community](https://docs.endless.link/endless/discovery/endless-developer-community)

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Dwica2004/endless-sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Dwica2004/endless-sentinel/discussions)
- **Endless Community**: [Join the ecosystem](https://docs.endless.link/endless/discovery/endless-developer-community)

---

## 🙏 Acknowledgments

Built with ❤️ for the Endless developer community.

Special thanks to:
- The Endless team for building an amazing Web3 platform
- All contributors and early testers
- The Move community for language patterns and best practices

---

## ⭐ Show Your Support

If Endless Sentinel saved you time, give it a star! ⭐

It helps other developers discover the tool and motivates continued development.

---

**Ready to inspect your project? Let's go! 🛡️**

```bash
git clone https://github.com/Dwica2004/endless-sentinel.git
cd endless-sentinel/apps/cli
npm install && npm run build
node dist/apps/cli/bin/sentinel.js
```
