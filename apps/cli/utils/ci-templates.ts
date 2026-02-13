/**
 * Generate GitHub Actions workflow for Endless Sentinel
 */

export function generateGitHubActionsWorkflow(): string {
    return `name: Endless Sentinel Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  sentinel:
    name: Run Endless Sentinel
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Endless Sentinel
        run: npm install -g @endless/sentinel-cli

      - name: Run Sentinel Checks
        run: sentinel --json > sentinel-report.json
        continue-on-error: true

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: sentinel-report
          path: sentinel-report.json

      - name: Comment PR (if failed)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('sentinel-report.json', 'utf8'));
            
            let comment = '## 🛡️ Endless Sentinel Report\\n\\n';
            comment += \`**Status:** \${report.summary.overall === 'pass' ? '✅ Passing' : '❌ Failed'}\\n\\n\`;
            comment += \`**Summary:** \${report.summary.passed}/\${report.summary.total} checks passed\\n\`;
            comment += \`- ✓ Passed: \${report.summary.passed}\\n\`;
            comment += \`- ⚠ Warnings: \${report.summary.warnings}\\n\`;
            comment += \`- ✗ Failed: \${report.summary.failed}\\n\\n\`;
            
            // Add failed checks
            if (report.summary.failed > 0) {
              comment += '### ❌ Failed Checks\\n\\n';
              report.categories.forEach(cat => {
                const failedChecks = cat.checks.filter(c => c.status === 'fail');
                if (failedChecks.length > 0) {
                  comment += \`**\${cat.category}:**\\n\`;
                  failedChecks.forEach(check => {
                    comment += \`- ❌ \${check.name}: \${check.message}\\n\`;
                    if (check.suggestion) {
                      comment += \`  💡 \${check.suggestion}\\n\`;
                    }
                  });
                  comment += '\\n';
                }
              });
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: comment
            });

      - name: Fail if critical issues
        run: |
          FAILED=$(jq '.summary.failed' sentinel-report.json)
          if [ "$FAILED" -gt 0 ]; then
            echo "❌ Sentinel found $FAILED failed checks"
            exit 1
          fi
`;
}

export function generateGitLabCIConfig(): string {
    return `# Endless Sentinel CI Configuration

sentinel:
  image: node:20
  stage: test
  script:
    - npm install -g @endless/sentinel-cli
    - sentinel --json > sentinel-report.json
  artifacts:
    when: always
    paths:
      - sentinel-report.json
    reports:
      junit: sentinel-report.json
  allow_failure: false
`;
}

export function generateCircleCIConfig(): string {
    return `version: 2.1

jobs:
  sentinel:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Install Sentinel
          command: npm install -g @endless/sentinel-cli
      - run:
          name: Run Checks
          command: sentinel --json > sentinel-report.json
      - store_artifacts:
          path: sentinel-report.json

workflows:
  version: 2
  build:
    jobs:
      - sentinel
`;
}
