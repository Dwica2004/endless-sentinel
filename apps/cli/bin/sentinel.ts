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
    REPORT_FILENAME
} from '../../../shared/constants.js';

// Import check modules
import * as envChecks from '../checks/env.js';
import * as projectChecks from '../checks/project.js';
import * as hygieneChecks from '../checks/hygiene.js';

/**
 * Status symbols for console output
 */
const SYMBOLS = {
    [STATUS_PASS]: '✓',
    [STATUS_WARN]: '⚠',
    [STATUS_FAIL]: '✗'
};

/**
 * Run all checks and aggregate results
 */
async function runAllChecks(cwd: string): Promise<Report> {
    const categories: CategoryResult[] = [
        envChecks.runChecks(),
        projectChecks.runChecks(cwd),
        hygieneChecks.runChecks(cwd)
    ];

    // Calculate summary
    const allChecks = categories.flatMap(cat => cat.checks);
    const summary = {
        total: allChecks.length,
        passed: allChecks.filter(c => c.status === STATUS_PASS).length,
        warnings: allChecks.filter(c => c.status === STATUS_WARN).length,
        failed: allChecks.filter(c => c.status === STATUS_FAIL).length
    };

    return {
        timestamp: new Date().toISOString(),
        version: SCHEMA_VERSION,
        summary,
        categories
    };
}

/**
 * Print human-readable report to console
 */
function printReport(report: Report): void {
    console.log('\n🛡️  Endless Sentinel — Project Inspection\n');

    // Print each category
    for (const category of report.categories) {
        const categoryName = CATEGORY_NAMES[category.category] || category.category;
        console.log(`\n${categoryName}`);

        for (const check of category.checks) {
            const symbol = SYMBOLS[check.status];
            console.log(`  ${symbol} ${check.message}`);

            // Show suggestion if check failed or warned
            if (check.suggestion) {
                console.log(`    → ${check.suggestion}`);
            }
        }
    }

    // Print summary
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
        `✗ ${summary.failed} failed\n`);
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
 * Main CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    const shouldOutputJson = args.includes('--json');
    const cwd = process.cwd();

    try {
        // Run all checks
        const report = await runAllChecks(cwd);

        // Print to console
        printReport(report);

        // Optionally save JSON
        if (shouldOutputJson) {
            const outputPath = join(cwd, REPORT_FILENAME);
            saveReport(report, outputPath);
        }

        // Exit with appropriate code
        const exitCode = report.summary.failed > 0 ? 1 : 0;
        process.exit(exitCode);

    } catch (error) {
        console.error('\n❌ Sentinel encountered an error:\n', error);
        process.exit(2);
    }
}

// Run CLI
main();
