#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Report, CategoryResult } from '../../../shared/schema.js';
import {
    CATEGORY_NAMES,
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    SCHEMA_VERSION,
    REPORT_FILENAME,
    CLI_VERSION
} from '../../../shared/constants.js';

// Import check modules
import * as envChecks from '../checks/env.js';
import * as projectChecks from '../checks/project.js';
import * as hygieneChecks from '../checks/hygiene.js';
import * as networkChecks from '../checks/network.js';
import * as moveChecks from '../checks/move.js';
import * as cliChecks from '../checks/cli.js';
import * as securityChecks from '../checks/security.js';

// Import health score
import { calculateHealthScore, printHealthScore } from '../utils/health-score.js';

/**
 * Status symbols for console output
 */
const SYMBOLS: Record<string, string> = {
    [STATUS_PASS]: '✓',
    [STATUS_WARN]: '⚠',
    [STATUS_FAIL]: '✗'
};

/**
 * Run all checks and aggregate results
 * Network checks are now async (live RPC probe)
 */
async function runAllChecks(cwd: string): Promise<Report> {
    // Run sync and async checks — collect ALL results before any printing
    const [
        envResult,
        projectResult,
        hygieneResult,
        networkResult,
        moveResult,
        cliResult,
        securityResult
    ] = await Promise.all([
        Promise.resolve(envChecks.runChecks()),
        Promise.resolve(projectChecks.runChecks(cwd)),
        Promise.resolve(hygieneChecks.runChecks(cwd)),
        networkChecks.runChecks(cwd),           // async: live RPC probe
        Promise.resolve(moveChecks.runChecks(cwd)),
        Promise.resolve(cliChecks.runChecks()),
        Promise.resolve(securityChecks.runChecks(cwd))
    ]);

    const categories: CategoryResult[] = [
        envResult,
        projectResult,
        hygieneResult,
        networkResult,
        moveResult,
        cliResult,
        securityResult
    ];

    // Calculate summary
    const allChecks = categories.flatMap(cat => cat.checks);
    const summary = {
        total: allChecks.length,
        passed: allChecks.filter(c => c.status === STATUS_PASS).length,
        warnings: allChecks.filter(c => c.status === STATUS_WARN).length,
        failed: allChecks.filter(c => c.status === STATUS_FAIL).length
    };

    const report: Report = {
        timestamp: new Date().toISOString(),
        version: SCHEMA_VERSION,
        summary,
        categories
    };

    // Calculate health score
    const healthResult = calculateHealthScore(report);
    report.healthScore = healthResult.score;
    report.grade = healthResult.grade;

    return report;
}

/**
 * Print human-readable report to console
 */
function printReport(report: Report): void {
    console.log(`\n🛡️  Endless Sentinel v${CLI_VERSION} — Project Inspection\n`);

    // Print each category
    for (const category of report.categories) {
        const categoryName = CATEGORY_NAMES[category.category] || category.category;
        console.log(`\n${categoryName}`);

        for (const check of category.checks) {
            const symbol = SYMBOLS[check.status] || '?';
            console.log(`  ${symbol} ${check.message}`);

            if (check.suggestion) {
                console.log(`    → ${check.suggestion}`);
            }
        }
    }

    // Print summary line
    console.log('\n' + '─'.repeat(50));

    const { summary } = report;
    const hasFailed = summary.failed > 0;
    const hasWarned = summary.warnings > 0;

    let statusSymbol = '✅';
    let statusText = 'READY';

    if (hasFailed) {
        statusSymbol = '❌';
        statusText = 'NOT READY';
    } else if (hasWarned) {
        statusSymbol = '⚠️';
        statusText = 'READY (with warnings)';
    }

    console.log(`\nStatus: ${statusSymbol} ${statusText}`);
    console.log(`Total: ${summary.total} checks | ` +
        `✓ ${summary.passed} passed | ` +
        `⚠ ${summary.warnings} warnings | ` +
        `✗ ${summary.failed} failed`);

    // Print health score
    const healthResult = calculateHealthScore(report);
    printHealthScore(healthResult);
}

/**
 * Save report to JSON file
 */
function saveReport(report: Report, outputPath: string): void {
    try {
        writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
        console.log(`📄 Report saved to: ${outputPath}\n`);
    } catch (error) {
        console.error('❌ Failed to save report:', error);
    }
}

/**
 * Show help text
 */
function showHelp() {
    console.log(`
🛡️  Endless Sentinel v${CLI_VERSION} — Project Health Inspector

USAGE:
  sentinel [command] [options]

COMMANDS:
  (no command)         Run all health checks (with live RPC probe)
  compare FILE1 FILE2  Compare two reports and show improvements
  badges               Generate shields.io badges for README
  init-ci [TYPE]       Generate CI/CD configuration (github, gitlab, circle)
  scaffold PROJECT     Create ideal Endless project structure

OPTIONS:
  --json              Save report to JSON file
  --help, -h          Show this help message

EXAMPLES:
  sentinel                          # Run all checks
  sentinel --json                   # Run checks + save JSON report
  sentinel compare old.json new.json # Compare two reports
  sentinel badges                   # Generate README badges
  sentinel init-ci github           # Create GitHub Actions workflow
  sentinel scaffold my-project      # Create new Endless project

FEATURES (v2.0):
  ✓ Live RPC probe (actual network connectivity test)
  ✓ Move.toml dependency validator (validates against Endless framework)
  ✓ Health score engine (0-100 weighted score + letter grade)
  ✓ Security scanner (comment-aware, reduced false positives)

For more information: https://github.com/Dwica2004/endless-sentinel
`);
}

/**
 * Main CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const cwd = process.cwd();

    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    try {
        if (command === 'compare') {
            const { compareReports } = await import('../utils/compare.js');
            const { readFileSync } = await import('fs');

            const file1Path = args[1];
            const file2Path = args[2];

            if (!file1Path || !file2Path) {
                console.error('❌ Usage: sentinel compare <old-report.json> <new-report.json>');
                process.exit(1);
            }

            const oldReport = JSON.parse(readFileSync(file1Path, 'utf-8'));
            const newReport = JSON.parse(readFileSync(file2Path, 'utf-8'));
            const comparison = compareReports(oldReport, newReport);

            console.log('\n📊 Report Comparison\n');
            console.log(`✅ Improved:  ${comparison.improved}`);
            console.log(`❌ Regressed: ${comparison.regressed}`);
            console.log(`➖ Unchanged: ${comparison.unchanged}`);
            console.log(`🆕 New:       ${comparison.newChecks}`);
            console.log(`🗑️  Removed:   ${comparison.removedChecks}\n`);

            if (comparison.improved > 0 || comparison.regressed > 0) {
                console.log('Changes:');
                comparison.details
                    .filter(d => d.change !== 'unchanged')
                    .forEach(d => {
                        const icon = d.change === 'improved' ? '✅' :
                            d.change === 'regressed' ? '❌' :
                                d.change === 'new' ? '🆕' : '🗑️';
                        console.log(`  ${icon} ${d.checkName}: ${d.oldStatus} → ${d.newStatus}`);
                    });
            }

            process.exit(comparison.regressed > 0 ? 1 : 0);

        } else if (command === 'badges') {
            const { generateMarkdownBadges } = await import('../utils/badges.js');
            const { readFileSync } = await import('fs');

            const reportPath = join(cwd, REPORT_FILENAME);
            const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
            const badges = generateMarkdownBadges(report);

            console.log('\n📛 Generated Badges for README.md:\n');
            console.log(badges);
            console.log('\n💡 Copy and paste into your README.md file!\n');

        } else if (command === 'init-ci') {
            const { generateGitHubActionsWorkflow, generateGitLabCIConfig, generateCircleCIConfig }
                = await import('../utils/ci-templates.js');
            const { writeFileSync, mkdirSync } = await import('fs');

            const ciType = args[1] || 'github';
            let workflow = '';
            let filePath = '';

            if (ciType === 'github') {
                workflow = generateGitHubActionsWorkflow();
                filePath = join(cwd, '.github', 'workflows', 'sentinel.yml');
                mkdirSync(join(cwd, '.github', 'workflows'), { recursive: true });
            } else if (ciType === 'gitlab') {
                workflow = generateGitLabCIConfig();
                filePath = join(cwd, '.gitlab-ci.yml');
            } else if (ciType === 'circle') {
                workflow = generateCircleCIConfig();
                filePath = join(cwd, '.circleci', 'config.yml');
                mkdirSync(join(cwd, '.circleci'), { recursive: true });
            } else {
                console.error('❌ Unknown CI type. Use: github, gitlab, or circle');
                process.exit(1);
            }

            writeFileSync(filePath, workflow);
            console.log(`\n✅ Created ${ciType.toUpperCase()} CI configuration: ${filePath}\n`);
            console.log('💡 Commit this file to enable automated checks!\n');

        } else if (command === 'scaffold') {
            const { scaffoldProject } = await import('../utils/scaffold.js');
            const projectName = args[1];

            if (!projectName) {
                console.error('❌ Usage: sentinel scaffold <project-name>');
                process.exit(1);
            }

            const targetDir = join(cwd, projectName);
            scaffoldProject(targetDir, {
                projectName,
                network: 'testnet',
                includeMoveContracts: true,
                includeTests: true,
                includeCI: true
            });

        } else {
            // Default: run all checks
            const shouldOutputJson = args.includes('--json');
            const report = await runAllChecks(cwd);

            printReport(report);

            if (shouldOutputJson) {
                const outputPath = join(cwd, REPORT_FILENAME);
                saveReport(report, outputPath);
            }

            const exitCode = report.summary.failed > 0 ? 1 : 0;
            process.exit(exitCode);
        }

    } catch (error) {
        console.error('\n❌ Sentinel encountered an error:\n', error);
        process.exit(2);
    }
}

main();
