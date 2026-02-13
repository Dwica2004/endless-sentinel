import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_MOVE,
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    MOVE_FILE_EXTENSION,
    MOVE_TOML_FILE,
    MOVE_SOURCE_DIR
} from '../../../shared/constants.js';

/**
 * Check if Move.toml exists (Move project manifest)
 */
function checkMoveToml(cwd: string): Check {
    const moveTomlPath = join(cwd, MOVE_TOML_FILE);
    const exists = existsSync(moveTomlPath);

    if (!exists) {
        return {
            name: 'Move Project Manifest',
            status: STATUS_WARN,
            expected: MOVE_TOML_FILE,
            actual: 'not found',
            message: 'No Move.toml found (not a Move project)',
            suggestion: 'If building Move contracts, create Move.toml with your project configuration'
        };
    }

    // Check if it's valid TOML (basic check)
    try {
        const content = readFileSync(moveTomlPath, 'utf-8');
        const hasPackage = content.includes('[package]');
        const hasName = content.includes('name =');

        if (!hasPackage || !hasName) {
            return {
                name: 'Move Project Manifest',
                status: STATUS_WARN,
                expected: 'Valid Move.toml with [package] and name',
                actual: 'incomplete configuration',
                message: 'Move.toml exists but may be incomplete',
                suggestion: 'Ensure Move.toml has [package] section with name field'
            };
        }

        return {
            name: 'Move Project Manifest',
            status: STATUS_PASS,
            expected: MOVE_TOML_FILE,
            actual: 'found',
            message: 'Move.toml found and valid',
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'Move Project Manifest',
            status: STATUS_FAIL,
            expected: 'Valid Move.toml',
            actual: 'parse error',
            message: 'Move.toml exists but cannot be read',
            suggestion: 'Check Move.toml syntax and permissions'
        };
    }
}

/**
 * Check for Move source files
 */
function checkMoveSourceFiles(cwd: string): Check {
    const sourcesDir = join(cwd, MOVE_SOURCE_DIR);

    if (!existsSync(sourcesDir)) {
        return {
            name: 'Move Source Files',
            status: STATUS_WARN,
            expected: `${MOVE_SOURCE_DIR}/ directory`,
            actual: 'not found',
            message: 'No sources directory found',
            suggestion: `Create ${MOVE_SOURCE_DIR}/ directory and add your .move files there`
        };
    }

    try {
        const files = readdirSync(sourcesDir);
        const moveFiles = files.filter(f => f.endsWith(MOVE_FILE_EXTENSION));

        if (moveFiles.length === 0) {
            return {
                name: 'Move Source Files',
                status: STATUS_WARN,
                expected: 'At least one .move file',
                actual: 'no .move files found',
                message: 'sources/ directory exists but contains no .move files',
                suggestion: 'Add your Move smart contract files to sources/ directory'
            };
        }

        return {
            name: 'Move Source Files',
            status: STATUS_PASS,
            expected: '.move files in sources/',
            actual: `${moveFiles.length} file(s) found`,
            message: `Found ${moveFiles.length} Move source file(s)`,
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'Move Source Files',
            status: STATUS_FAIL,
            expected: 'Readable sources/ directory',
            actual: 'error reading directory',
            message: 'Cannot read sources/ directory',
            suggestion: 'Check directory permissions'
        };
    }
}

/**
 * Check for common Move security patterns (basic analysis)
 */
function checkMoveSecurityPatterns(cwd: string): Check {
    const sourcesDir = join(cwd, MOVE_SOURCE_DIR);

    if (!existsSync(sourcesDir)) {
        return {
            name: 'Move Security Patterns',
            status: STATUS_WARN,
            expected: 'Move files to analyze',
            actual: 'no sources directory',
            message: 'Cannot perform security analysis (no sources)',
            suggestion: 'Add Move source files for security validation'
        };
    }

    try {
        const files = readdirSync(sourcesDir);
        const moveFiles = files.filter(f => f.endsWith(MOVE_FILE_EXTENSION));

        if (moveFiles.length === 0) {
            return {
                name: 'Move Security Patterns',
                status: STATUS_WARN,
                expected: 'Move files to analyze',
                actual: 'no .move files',
                message: 'No Move files to analyze',
                suggestion: null
            };
        }

        // Basic pattern checks across all Move files
        let hasPublicFunctions = false;
        let hasResources = false;
        let totalLines = 0;

        for (const file of moveFiles) {
            const filePath = join(sourcesDir, file);
            const content = readFileSync(filePath, 'utf-8');
            totalLines += content.split('\n').length;

            if (content.includes('public fun') || content.includes('public entry fun')) {
                hasPublicFunctions = true;
            }
            if (content.includes('struct') && (content.includes('has key') || content.includes('has store'))) {
                hasResources = true;
            }
        }

        const warnings: string[] = [];

        if (hasPublicFunctions && !hasResources) {
            warnings.push('Public functions found without resource definitions - verify this is intentional');
        }

        if (totalLines > 1000) {
            warnings.push('Large codebase detected - consider modular design');
        }

        if (warnings.length > 0) {
            return {
                name: 'Move Security Patterns',
                status: STATUS_WARN,
                expected: 'Best practices followed',
                actual: 'potential improvements',
                message: 'Security patterns analyzed - suggestions available',
                suggestion: warnings.join('; ')
            };
        }

        return {
            name: 'Move Security Patterns',
            status: STATUS_PASS,
            expected: 'Move best practices',
            actual: 'basic checks passed',
            message: 'Move code structure looks good',
            suggestion: null
        };

    } catch (error) {
        return {
            name: 'Move Security Patterns',
            status: STATUS_FAIL,
            expected: 'Readable Move files',
            actual: 'error analyzing files',
            message: 'Cannot analyze Move source files',
            suggestion: 'Check file permissions and syntax'
        };
    }
}

/**
 * Check for Move module naming conventions
 */
function checkMoveModuleNaming(cwd: string): Check {
    const sourcesDir = join(cwd, MOVE_SOURCE_DIR);

    if (!existsSync(sourcesDir)) {
        return {
            name: 'Move Module Naming',
            status: STATUS_WARN,
            expected: 'Move modules to check',
            actual: 'no sources directory',
            message: 'Cannot check module naming',
            suggestion: null
        };
    }

    try {
        const files = readdirSync(sourcesDir);
        const moveFiles = files.filter(f => f.endsWith(MOVE_FILE_EXTENSION));

        if (moveFiles.length === 0) {
            return {
                name: 'Move Module Naming',
                status: STATUS_WARN,
                expected: 'Move files to check',
                actual: 'no .move files',
                message: 'No Move modules to validate',
                suggestion: null
            };
        }

        // Check naming conventions (snake_case recommended)
        const badNames = moveFiles.filter(f => {
            const name = f.replace(MOVE_FILE_EXTENSION, '');
            // Check if name contains uppercase or special chars (except underscore)
            return /[A-Z]/.test(name) || /[^a-z0-9_]/.test(name);
        });

        if (badNames.length > 0) {
            return {
                name: 'Move Module Naming',
                status: STATUS_WARN,
                expected: 'snake_case naming (e.g., my_module.move)',
                actual: `${badNames.length} file(s) with non-standard names`,
                message: 'Some Move files use non-standard naming',
                suggestion: `Consider renaming: ${badNames.slice(0, 3).join(', ')} to snake_case`
            };
        }

        return {
            name: 'Move Module Naming',
            status: STATUS_PASS,
            expected: 'snake_case naming',
            actual: 'all files follow convention',
            message: 'Move module naming follows conventions',
            suggestion: null
        };

    } catch (error) {
        return {
            name: 'Move Module Naming',
            status: STATUS_FAIL,
            expected: 'Readable sources directory',
            actual: 'error',
            message: 'Cannot check module naming',
            suggestion: null
        };
    }
}

/**
 * Run all Move checks
 */
export function runChecks(cwd: string): CategoryResult {
    const checks: Check[] = [
        checkMoveToml(cwd),
        checkMoveSourceFiles(cwd),
        checkMoveSecurityPatterns(cwd),
        checkMoveModuleNaming(cwd)
    ];

    // Determine overall status
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_MOVE,
        status: overallStatus,
        checks
    };
}
