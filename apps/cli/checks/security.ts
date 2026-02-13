import type { Check, CategoryResult } from '../../../shared/schema.js';
import {
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    CATEGORY_SECURITY
} from '../../../shared/constants.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Move Security Scanner
 * Detects common security vulnerabilities in Move smart contracts
 */

interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    pattern: string;
    file: string;
    line: number;
    description: string;
}

const SECURITY_PATTERNS = [
    {
        pattern: /public\s+fun\s+\w+.*\{[^}]*abort/gi,
        severity: 'high' as const,
        name: 'Unprotected Public Function with Abort',
        description: 'Public function can abort without access control'
    },
    {
        pattern: /\d+\s*\+\s*\w+|\w+\s*\+\s*\d+/g,
        severity: 'medium' as const,
        name: 'Potential Arithmetic Overflow',
        description: 'Unchecked arithmetic operation detected'
    },
    {
        pattern: /timestamp::now_seconds/gi,
        severity: 'medium' as const,
        name: 'Timestamp Dependency',
        description: 'Using timestamp can lead to manipulation'
    },
    {
        pattern: /public\s+fun\s+\w+.*\(.*signer/gi,
        severity: 'low' as const,
        name: 'Public Function with Signer',
        description: 'Ensure proper authorization checks'
    }
];

function scanMoveFile(filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (!fs.existsSync(filePath)) {
        return issues;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    SECURITY_PATTERNS.forEach(({ pattern, severity, name, description }) => {
        lines.forEach((line, idx) => {
            if (pattern.test(line)) {
                issues.push({
                    severity,
                    pattern: name,
                    file: path.basename(filePath),
                    line: idx + 1,
                    description
                });
            }
        });
    });

    return issues;
}

function checkMoveSecurityScan(cwd: string): Check {
    const sourcesDir = path.join(cwd, 'sources');

    if (!fs.existsSync(sourcesDir)) {
        return {
            name: 'Move Security Analysis',
            status: STATUS_WARN,
            message: 'No sources directory found',
            suggestion: 'Create sources/ directory with .move files for security analysis',
            expected: 'sources/ directory with Move files',
            actual: 'Not found'
        };
    }

    const moveFiles = fs.readdirSync(sourcesDir)
        .filter(f => f.endsWith('.move'))
        .map(f => path.join(sourcesDir, f));

    if (moveFiles.length === 0) {
        return {
            name: 'Move Security Analysis',
            status: STATUS_WARN,
            message: 'No .move files found for analysis',
            suggestion: 'Add Move smart contract files to sources/ directory',
            expected: 'At least one .move file',
            actual: '0 files'
        };
    }

    const allIssues: SecurityIssue[] = [];
    moveFiles.forEach(file => {
        const issues = scanMoveFile(file);
        allIssues.push(...issues);
    });

    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const highCount = allIssues.filter(i => i.severity === 'high').length;
    const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
    const lowCount = allIssues.filter(i => i.severity === 'low').length;

    if (criticalCount > 0 || highCount > 0) {
        const topIssue = allIssues.find(i => i.severity === 'critical' || i.severity === 'high');
        return {
            name: 'Move Security Analysis',
            status: STATUS_FAIL,
            message: `Found ${criticalCount} critical and ${highCount} high severity issues`,
            suggestion: topIssue
                ? `${topIssue.file}:${topIssue.line} - ${topIssue.description}`
                : 'Review security findings carefully',
            expected: '0 critical/high severity issues',
            actual: `${criticalCount} critical, ${highCount} high`
        };
    }

    if (mediumCount > 0) {
        return {
            name: 'Move Security Analysis',
            status: STATUS_WARN,
            message: `Found ${mediumCount} medium and ${lowCount} low severity issues`,
            suggestion: 'Review and address medium severity findings',
            expected: '0 security issues',
            actual: `${mediumCount} medium, ${lowCount} low`
        };
    }

    return {
        name: 'Move Security Analysis',
        status: STATUS_PASS,
        message: `Scanned ${moveFiles.length} Move files - no critical issues found`,
        suggestion: null,
        expected: 'Clean security scan',
        actual: `${moveFiles.length} files scanned, ${lowCount} low severity notes`
    };
}

function checkSecurityBestPractices(cwd: string): Check {
    const sourcesDir = path.join(cwd, 'sources');

    if (!fs.existsSync(sourcesDir)) {
        return {
            name: 'Security Best Practices',
            status: STATUS_WARN,
            message: 'Cannot verify best practices (no sources)',
            suggestion: null,
            expected: 'sources/ directory',
            actual: 'Not found'
        };
    }

    const moveFiles = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.move'));
    const hasTests = fs.existsSync(path.join(cwd, 'tests'));
    const hasReadme = fs.existsSync(path.join(cwd, 'README.md'));

    const score = [hasTests, hasReadme, moveFiles.length > 0].filter(Boolean).length;

    if (score === 3) {
        return {
            name: 'Security Best Practices',
            status: STATUS_PASS,
            message: 'Project follows security best practices',
            suggestion: null,
            expected: 'Tests, documentation, source files',
            actual: 'All present'
        };
    }

    const missing = [];
    if (!hasTests) missing.push('tests/');
    if (!hasReadme) missing.push('README.md');

    return {
        name: 'Security Best Practices',
        status: STATUS_WARN,
        message: `Missing security-critical components: ${missing.join(', ')}`,
        suggestion: 'Add comprehensive tests and documentation for security review',
        expected: 'Complete project structure',
        actual: `Missing: ${missing.join(', ')}`
    };
}

export function runChecks(cwd: string): CategoryResult {
    const checks: Check[] = [
        checkMoveSecurityScan(cwd),
        checkSecurityBestPractices(cwd)
    ];

    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_SECURITY,
        status: overallStatus,
        checks
    };
}
