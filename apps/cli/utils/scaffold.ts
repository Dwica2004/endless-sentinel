import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate ideal Endless project structure
 */

export interface ScaffoldOptions {
    projectName: string;
    network: 'testnet' | 'mainnet';
    includeMoveContracts: boolean;
    includeTests: boolean;
    includeCI: boolean;
}

export function scaffoldProject(targetDir: string, options: ScaffoldOptions): void {
    const { projectName, network, includeMoveContracts, includeTests, includeCI } = options;

    // Create directory structure
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate .endlessrc.json
    const endlessConfig = {
        network,
        rpc: network === 'testnet'
            ? 'https://testnet.endless.link'
            : 'https://mainnet.endless.link'
    };
    fs.writeFileSync(
        path.join(targetDir, '.endlessrc.json'),
        JSON.stringify(endlessConfig, null, 2)
    );

    // Generate .gitignore
    const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# Endless
.endless/
`;
    fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignore);

    // Generate README.md
    const readme = `# ${projectName}

![Sentinel](https://img.shields.io/badge/Sentinel-passing-brightgreen)
![Built for Endless](https://img.shields.io/badge/Built_for-Endless-8B5CF6)

${includeMoveContracts ? '## Move Smart Contracts\n\nThis project contains Move smart contracts for the Endless blockchain.\n' : ''}

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Endless CLI

### Installation

\`\`\`bash
# Install dependencies
npm install

# Initialize Endless CLI
endless init
\`\`\`

${includeMoveContracts ? `### Build Contracts

\`\`\`bash
# Compile Move contracts
endless move compile

# Run tests
endless move test
\`\`\`
` : ''}

### Development

\`\`\`bash
# Run development server
npm run dev
\`\`\`

### Testing

\`\`\`bash
# Run all tests
npm test

# Run Endless Sentinel health check
npx @endless/sentinel-cli
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── ${includeMoveContracts ? 'sources/          # Move smart contracts\n├── tests/            # Test files\n├── ' : ''}package.json
├── .endlessrc.json   # Endless configuration
└── README.md
\`\`\`

## Contributing

Pull requests are welcome! Please run \`sentinel\` before submitting.

## License

MIT
`;
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);

    // Generate package.json
    const packageJson = {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: `Endless project: ${projectName}`,
        scripts: {
            test: includeTests ? 'endless move test' : 'echo "No tests configured"',
            build: includeMoveContracts ? 'endless move compile' : 'echo "No build configured"',
            check: 'sentinel'
        },
        keywords: ['endless', 'blockchain', 'move'],
        license: 'MIT'
    };
    fs.writeFileSync(
        path.join(targetDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    // Generate Move.toml if Move contracts requested
    if (includeMoveContracts) {
        fs.mkdirSync(path.join(targetDir, 'sources'), { recursive: true });

        const moveToml = `[package]
name = "${projectName}"
version = "1.0.0"

[addresses]
${projectName} = "_"

[dependencies]
EndlessFramework = { git = "https://github.com/endless/framework.git", subdir = "framework", rev = "main" }
`;
        fs.writeFileSync(path.join(targetDir, 'Move.toml'), moveToml);

        // Create example Move module
        const exampleMove = `module ${projectName}::example {
    use std::signer;

    struct Counter has key {
        value: u64
    }

    public entry fun initialize(account: &signer) {
        move_to(account, Counter { value: 0 });
    }

    public entry fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }

    #[view]
    public fun get_count(addr: address): u64 acquires Counter {
        borrow_global<Counter>(addr).value
    }
}
`;
        fs.writeFileSync(
            path.join(targetDir, 'sources', 'example.move'),
            exampleMove
        );
    }

    // Generate tests directory
    if (includeTests) {
        fs.mkdirSync(path.join(targetDir, 'tests'), { recursive: true });

        if (includeMoveContracts) {
            const testMove = `#[test_only]
module ${projectName}::example_tests {
    use ${projectName}::example;
    use std::signer;

    #[test(account = @0x1)]
    public fun test_counter(account: signer) {
        example::initialize(&account);
        example::increment(&account);
        assert!(example::get_count(signer::address_of(&account)) == 1, 0);
    }
}
`;
            fs.writeFileSync(
                path.join(targetDir, 'tests', 'example_tests.move'),
                testMove
            );
        }
    }

    // Generate GitHub Actions if requested
    if (includeCI) {
        const githubDir = path.join(targetDir, '.github', 'workflows');
        fs.mkdirSync(githubDir, { recursive: true });

        const workflow = `name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @endless/sentinel-cli
      - run: sentinel
`;
        fs.writeFileSync(
            path.join(githubDir, 'ci.yml'),
            workflow
        );
    }

    console.log(`✅ Project scaffolded successfully at: ${targetDir}`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${path.basename(targetDir)}`);
    if (includeMoveContracts) {
        console.log(`  endless move compile`);
    }
    console.log(`  sentinel`);
}
