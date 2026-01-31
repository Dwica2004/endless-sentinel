import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_HYGIENE,
    STATUS_PASS,
    STATUS_FAIL,
    STATUS_WARN
} from '../../../shared/constants.js';

/**
 * Check if .env is ignored by git
 */
function checkEnvIgnored(cwd: string): Check {
    const gitignorePath = join(cwd, '.gitignore');

    if (!existsSync(gitignorePath)) {
        return {
            name: '.env Security',
            status: STATUS_WARN,
            expected: '.env in .gitignore',
            actual: 'no .gitignore',
            message: '.gitignore file missing',
            suggestion: 'Create .gitignore and add .env to it'
        };
    }

    try {
        const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
        const lines = gitignoreContent.split('\n').map(l => l.trim());

        const isIgnored = lines.some(line =>
            line === '.env' ||
            line === '.env*' ||
            line === '*.env' ||
            line.startsWith('.env.')
        );

        return {
            name: '.env Security',
            status: isIgnored ? STATUS_PASS : STATUS_FAIL,
            expected: '.env in .gitignore',
            actual: isIgnored ? 'ignored' : 'not ignored',
            message: isIgnored
                ? '.env is properly ignored by git'
                : '.env is NOT ignored - security risk!',
            suggestion: isIgnored
                ? null
                : 'Add ".env" to your .gitignore file immediately'
        };
    } catch (error) {
        return {
            name: '.env Security',
            status: STATUS_WARN,
            expected: '.env in .gitignore',
            actual: 'error reading .gitignore',
            message: 'Could not verify .env is ignored',
            suggestion: 'Ensure .gitignore is readable and contains .env'
        };
    }
}

/**
 * Check if node_modules is ignored
 */
function checkNodeModulesIgnored(cwd: string): Check {
    const gitignorePath = join(cwd, '.gitignore');

    if (!existsSync(gitignorePath)) {
        return {
            name: 'node_modules Tracking',
            status: STATUS_WARN,
            expected: 'node_modules in .gitignore',
            actual: 'no .gitignore',
            message: '.gitignore missing',
            suggestion: 'Create .gitignore and add node_modules/'
        };
    }

    try {
        const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
        const lines = gitignoreContent.split('\n').map(l => l.trim());

        const isIgnored = lines.some(line =>
            line === 'node_modules' ||
            line === 'node_modules/' ||
            line === '**/node_modules' ||
            line === '**/node_modules/'
        );

        return {
            name: 'node_modules Tracking',
            status: isIgnored ? STATUS_PASS : STATUS_FAIL,
            expected: 'node_modules in .gitignore',
            actual: isIgnored ? 'ignored' : 'not ignored',
            message: isIgnored
                ? 'node_modules is properly ignored'
                : 'node_modules is NOT ignored - will bloat repo!',
            suggestion: isIgnored
                ? null
                : 'Add "node_modules/" to .gitignore'
        };
    } catch (error) {
        return {
            name: 'node_modules Tracking',
            status: STATUS_WARN,
            expected: 'node_modules in .gitignore',
            actual: 'error',
            message: 'Could not verify node_modules is ignored',
            suggestion: 'Ensure .gitignore exists and is readable'
        };
    }
}

/**
 * Check if README.md exists
 */
function checkReadmeExists(cwd: string): Check {
    const readmePath = join(cwd, 'README.md');
    const exists = existsSync(readmePath);

    return {
        name: 'Documentation',
        status: exists ? STATUS_PASS : STATUS_WARN,
        expected: 'README.md',
        actual: exists ? 'README.md' : 'not found',
        message: exists
            ? 'README.md exists'
            : 'README.md missing',
        suggestion: exists
            ? null
            : 'Create README.md to document your project'
    };
}

/**
 * Run all hygiene checks
 */
export function runChecks(cwd: string = process.cwd()): CategoryResult {
    const checks: Check[] = [
        checkEnvIgnored(cwd),
        checkNodeModulesIgnored(cwd),
        checkReadmeExists(cwd)
    ];

    // Determine overall status
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_HYGIENE,
        status: overallStatus,
        checks
    };
}
