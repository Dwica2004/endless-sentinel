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
 * Move Security Scanner v2.0
 * Improved: strips comments before analysis, multi-line aware, reduced false positives
 */

interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    pattern: string;
    file: string;
    line: number;
    description: string;
    context: string;
}

/**
 * Strip comments from Move code to prevent false positives
 */
function stripComments(code: string): string {
    let result = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        // Preserve line count for accurate line numbers
        return match.replace(/[^\n]/g, ' ');
    });
    result = result.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));
    return result;
}

/**
 * Security patterns with improved matching
 * Each pattern works on comment-stripped code to reduce false positives
 */
const SECURITY_PATTERNS = [
    {
        // Detect public entry functions without signer parameter (potential access control issue)
        test: (line: string) => /public\s+entry\s+fun\s+\w+\s*\(/.test(line) && !line.includes('signer'),
        severity: 'high' as const,
        name: 'Public Entry Without Access Control',
        description: 'Public entry function without signer parameter — anyone can call this'
    },
    {
        // Detect unchecked arithmetic in non-trivial expressions
        test: (line: string) => {
            // Only flag if it looks like a variable operation, not a constant
            if (/\w+\s*\+\s*\w+/.test(line) && !line.includes('const') && !line.includes('spec')) {
                // Exclude obvious safe patterns
                if (line.includes('vector::length') || line.includes('.length()')) return false;
                if (line.includes('assert!')) return false;
                // Check for operations on variables (not just literals)
                return /[a-z_]\w*\s*[\+\-\*]\s*[a-z_]\w*/i.test(line);
            }
            return false;
        },
        severity: 'medium' as const,
        name: 'Potential Arithmetic Overflow',
        description: 'Unchecked arithmetic on variables — consider using checked math or overflow guards'
    },
    {
        // Detect timestamp dependency
        test: (line: string) => /timestamp::now_seconds|timestamp::now_microseconds/.test(line),
        severity: 'medium' as const,
        name: 'Timestamp Dependency',
        description: 'Relying on block timestamp can expose manipulation risks in time-sensitive logic'
    },
    {
        // Detect transfer to arbitrary address without validation
        test: (line: string) => /coin::transfer/.test(line) && !line.includes('signer::address_of'),
        severity: 'high' as const,
        name: 'Unchecked Token Transfer',
        description: 'Token transfer without validating recipient via signer — verify this is intentional'
    },
    {
        // Detect public functions that modify state without acquires
        test: (line: string) => /public\s+(entry\s+)?fun\s+/.test(line) && line.includes('move_to') && !line.includes('acquires'),
        severity: 'low' as const,
        name: 'Resource Move Without Acquires',
        description: 'Function uses move_to but may be missing acquires annotation'
    }
];

function scanMoveFile(filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (!fs.existsSync(filePath)) return issues;

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const strippedContent = stripComments(rawContent);
    const lines = strippedContent.split('\n');

    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx].trim();
        if (!line) continue;

        for (const pattern of SECURITY_PATTERNS) {
            if (pattern.test(line)) {
                issues.push({
                    severity: pattern.severity,
                    pattern: pattern.name,
                    file: path.basename(filePath),
                    line: idx + 1,
                    description: pattern.description,
                    context: line.substring(0, 80)
                });
            }
        }
    }

    return issues;
}

function checkMoveSecurityScan(cwd: string): Check {
    const sourcesDir = path.join(cwd, 'sources');

    if (!fs.existsSync(sourcesDir)) {
        return {
            name: 'Move Security Scan',
            status: STATUS_WARN,
            message: 'No sources directory found',
            suggestion: 'Create sources/ directory with .move files for security analysis',
            expected: 'sources/ directory with Move files',
            actual: 'Not found'
        };
    }

    // Recursively find .move files
    const moveFiles: string[] = [];
    function findMoveFiles(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                findMoveFiles(fullPath);
            } else if (entry.name.endsWith('.move')) {
                moveFiles.push(fullPath);
            }
        }
    }
    findMoveFiles(sourcesDir);

    if (moveFiles.length === 0) {
        return {
            name: 'Move Security Scan',
            status: STATUS_WARN,
            message: 'No .move files found for analysis',
            suggestion: 'Add Move smart contract files to sources/ directory',
            expected: 'At least one .move file',
            actual: '0 files'
        };
    }

    const allIssues: SecurityIssue[] = [];
    moveFiles.forEach(file => {
        allIssues.push(...scanMoveFile(file));
    });

    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const highCount = allIssues.filter(i => i.severity === 'high').length;
    const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
    const lowCount = allIssues.filter(i => i.severity === 'low').length;
    const totalIssues = allIssues.length;

    if (criticalCount > 0 || highCount > 0) {
        const topIssue = allIssues.find(i => i.severity === 'critical' || i.severity === 'high');
        return {
            name: 'Move Security Scan',
            status: STATUS_FAIL,
            message: `Found ${criticalCount} critical, ${highCount} high severity issue(s) in ${moveFiles.length} file(s)`,
            suggestion: topIssue
                ? `${topIssue.file}:${topIssue.line} — ${topIssue.description}`
                : 'Review security findings carefully',
            expected: '0 critical/high severity issues',
            actual: `${totalIssues} total: ${criticalCount}C/${highCount}H/${mediumCount}M/${lowCount}L`
        };
    }

    if (mediumCount > 0 || lowCount > 0) {
        return {
            name: 'Move Security Scan',
            status: STATUS_WARN,
            message: `Found ${mediumCount} medium, ${lowCount} low severity note(s) in ${moveFiles.length} file(s)`,
            suggestion: 'Review medium-severity findings for potential improvements',
            expected: 'Clean security scan',
            actual: `${totalIssues} total: ${mediumCount}M/${lowCount}L`
        };
    }

    return {
        name: 'Move Security Scan',
        status: STATUS_PASS,
        message: `Scanned ${moveFiles.length} Move file(s) — no issues found`,
        suggestion: null,
        expected: 'Clean security scan',
        actual: `${moveFiles.length} file(s) scanned, 0 issues`
    };
}

function checkSecurityBestPractices(cwd: string): Check {
    const sourcesDir = path.join(cwd, 'sources');
    const hasTests = fs.existsSync(path.join(cwd, 'tests'));
    const hasReadme = fs.existsSync(path.join(cwd, 'README.md'));
    const hasGitignore = fs.existsSync(path.join(cwd, '.gitignore'));
    const hasLicense = fs.existsSync(path.join(cwd, 'LICENSE'));

    const items = [
        { present: hasTests, label: 'tests/' },
        { present: hasReadme, label: 'README.md' },
        { present: hasGitignore, label: '.gitignore' },
        { present: hasLicense, label: 'LICENSE' },
        { present: fs.existsSync(sourcesDir), label: 'sources/' }
    ];

    const score = items.filter(i => i.present).length;
    const missing = items.filter(i => !i.present).map(i => i.label);

    if (score >= 4) {
        return {
            name: 'Security Best Practices',
            status: STATUS_PASS,
            message: `Project follows best practices (${score}/5 checks)`,
            suggestion: missing.length > 0 ? `Consider adding: ${missing.join(', ')}` : null,
            expected: 'Tests, docs, gitignore, license, sources',
            actual: `${score}/5 present`
        };
    }

    if (score >= 2) {
        return {
            name: 'Security Best Practices',
            status: STATUS_WARN,
            message: `Missing some best practices (${score}/5)`,
            suggestion: `Add: ${missing.join(', ')}`,
            expected: 'Complete project structure',
            actual: `Missing: ${missing.join(', ')}`
        };
    }

    return {
        name: 'Security Best Practices',
        status: STATUS_FAIL,
        message: `Project missing critical components (${score}/5)`,
        suggestion: `Add: ${missing.join(', ')}`,
        expected: 'Complete project structure',
        actual: `Only ${score}/5 present`
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
