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
    MOVE_SOURCE_DIR,
    ENDLESS_FRAMEWORK_REPO,
    ENDLESS_FRAMEWORK_SUBDIRS
} from '../../../shared/constants.js';

/**
 * Check if Move.toml exists and is well-formed
 */
function checkMoveToml(cwd: string): Check {
    const moveTomlPath = join(cwd, MOVE_TOML_FILE);

    if (!existsSync(moveTomlPath)) {
        return {
            name: 'Move Project Manifest',
            status: STATUS_WARN,
            expected: MOVE_TOML_FILE,
            actual: 'not found',
            message: 'No Move.toml found (not a Move project)',
            suggestion: 'If building Move contracts, create Move.toml with your project configuration'
        };
    }

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
            actual: 'found and valid',
            message: 'Move.toml found and valid',
            suggestion: null
        };
    } catch {
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
 * DEEP Move.toml Dependency Validator
 * Validates that dependencies point to the correct Endless framework repos and subdirectories.
 * This catches the #1 cause of "my Move project won't compile" errors.
 */
function checkMoveTomlDependencies(cwd: string): Check {
    const moveTomlPath = join(cwd, MOVE_TOML_FILE);

    if (!existsSync(moveTomlPath)) {
        return {
            name: 'Move Dependencies',
            status: STATUS_WARN,
            expected: 'Move.toml with [dependencies]',
            actual: 'no Move.toml',
            message: 'Cannot validate dependencies — no Move.toml',
            suggestion: null
        };
    }

    try {
        const content = readFileSync(moveTomlPath, 'utf-8');
        const issues: string[] = [];
        const goodDeps: string[] = [];

        // Check if [dependencies] section exists
        if (!content.includes('[dependencies]')) {
            return {
                name: 'Move Dependencies',
                status: STATUS_WARN,
                expected: '[dependencies] section',
                actual: 'no dependencies declared',
                message: 'No [dependencies] section in Move.toml',
                suggestion: 'Add Endless framework dependencies. Example:\n[dependencies]\nEndlessFramework = { git = "https://github.com/endless-labs/endless-move-framework.git", subdir = "endless-framework", rev = "main" }'
            };
        }

        // Parse dependency lines (basic TOML parsing focused on git deps)
        const lines = content.split('\n');
        let inDeps = false;
        const depEntries: Array<{ name: string; line: string; lineNum: number }> = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '[dependencies]') {
                inDeps = true;
                continue;
            }
            if (line.startsWith('[') && line !== '[dependencies]') {
                inDeps = false;
                continue;
            }
            if (inDeps && line.includes('=') && !line.startsWith('#')) {
                const name = line.split('=')[0].trim();
                depEntries.push({ name, line, lineNum: i + 1 });
            }
        }

        if (depEntries.length === 0) {
            return {
                name: 'Move Dependencies',
                status: STATUS_WARN,
                expected: 'At least one dependency',
                actual: '0 dependencies',
                message: 'No dependencies declared in Move.toml',
                suggestion: 'Most Endless projects need the framework. Add EndlessFramework dependency.'
            };
        }

        // Validate each dependency
        for (const dep of depEntries) {
            const { name, line } = dep;

            // Check if it references Endless framework
            if (line.includes('endless') || line.includes('Endless')) {
                // Validate git URL
                if (line.includes('git =')) {
                    const gitMatch = line.match(/git\s*=\s*"([^"]+)"/);
                    if (gitMatch) {
                        const gitUrl = gitMatch[1];
                        if (!gitUrl.includes('endless-labs/endless-move-framework')) {
                            issues.push(`${name}: git URL "${gitUrl}" doesn't match official repo (${ENDLESS_FRAMEWORK_REPO})`);
                        }
                    }
                }

                // Validate subdir
                if (line.includes('subdir =')) {
                    const subdirMatch = line.match(/subdir\s*=\s*"([^"]+)"/);
                    if (subdirMatch) {
                        const subdir = subdirMatch[1];
                        const validSubdirs = ENDLESS_FRAMEWORK_SUBDIRS as readonly string[];
                        if (!validSubdirs.includes(subdir)) {
                            issues.push(`${name}: subdir "${subdir}" is not valid. Expected one of: ${ENDLESS_FRAMEWORK_SUBDIRS.join(', ')}`);
                        } else {
                            goodDeps.push(`${name} → ${subdir} ✓`);
                        }
                    }
                } else if (line.includes('git =')) {
                    issues.push(`${name}: missing "subdir" field. Add subdir = "endless-framework" (or endless-stdlib, endless-token, move-stdlib)`);
                }

                // Validate rev
                if (line.includes('git =') && !line.includes('rev =')) {
                    issues.push(`${name}: missing "rev" field. Pin to a specific version with rev = "main" or a release tag`);
                }
            }

            // Check for local dependencies that might not work in CI
            if (line.includes('local =')) {
                issues.push(`${name}: uses local path — this won't work in CI/CD or for other developers`);
            }
        }

        if (issues.length > 0) {
            return {
                name: 'Move Dependencies',
                status: issues.some(i => i.includes("doesn't match")) ? STATUS_FAIL : STATUS_WARN,
                expected: 'Valid Endless framework dependencies',
                actual: `${issues.length} issue(s) found`,
                message: `Dependency issues: ${issues[0]}`,
                suggestion: issues.length > 1
                    ? `Also: ${issues.slice(1).join('; ')}`
                    : 'Fix the dependency configuration in Move.toml'
            };
        }

        return {
            name: 'Move Dependencies',
            status: STATUS_PASS,
            expected: 'Valid framework dependencies',
            actual: `${depEntries.length} dep(s) validated`,
            message: `Move dependencies valid: ${goodDeps.join(', ') || `${depEntries.length} dependency(s) checked`}`,
            suggestion: null
        };

    } catch {
        return {
            name: 'Move Dependencies',
            status: STATUS_FAIL,
            expected: 'Readable Move.toml',
            actual: 'error reading file',
            message: 'Cannot read Move.toml for dependency validation',
            suggestion: 'Check file permissions'
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

        // Count total lines for info
        let totalLines = 0;
        for (const file of moveFiles) {
            const content = readFileSync(join(sourcesDir, file), 'utf-8');
            totalLines += content.split('\n').length;
        }

        return {
            name: 'Move Source Files',
            status: STATUS_PASS,
            expected: '.move files in sources/',
            actual: `${moveFiles.length} file(s), ${totalLines} lines`,
            message: `Found ${moveFiles.length} Move source file(s) (${totalLines} lines)`,
            suggestion: null
        };
    } catch {
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
 * Check Move code quality patterns (improved: filters comments, reduces false positives)
 */
function checkMoveCodeQuality(cwd: string): Check {
    const sourcesDir = join(cwd, MOVE_SOURCE_DIR);

    if (!existsSync(sourcesDir)) {
        return {
            name: 'Move Code Quality',
            status: STATUS_WARN,
            expected: 'Move files to analyze',
            actual: 'no sources directory',
            message: 'Cannot analyze code quality (no sources)',
            suggestion: null
        };
    }

    try {
        const files = readdirSync(sourcesDir).filter(f => f.endsWith(MOVE_FILE_EXTENSION));
        if (files.length === 0) {
            return {
                name: 'Move Code Quality',
                status: STATUS_WARN,
                expected: 'Move files to analyze',
                actual: 'no .move files',
                message: 'No Move files to analyze',
                suggestion: null
            };
        }

        let hasPublicFunctions = false;
        let hasEntryFunctions = false;
        let hasResources = false;
        let hasTests = false;
        let hasViewFunctions = false;
        let totalModules = 0;

        for (const file of files) {
            const content = readFileSync(join(sourcesDir, file), 'utf-8');

            // Strip comments before analysis to reduce false positives
            const stripped = stripComments(content);

            if (/public\s+fun\s+/.test(stripped)) hasPublicFunctions = true;
            if (/public\s+entry\s+fun\s+/.test(stripped)) hasEntryFunctions = true;
            if (/struct\s+\w+\s+has\s+(key|store)/.test(stripped)) hasResources = true;
            if (/#\[test/.test(stripped)) hasTests = true;
            if (/#\[view\]/.test(stripped)) hasViewFunctions = true;
            if (/module\s+\w+::\w+/.test(stripped)) totalModules++;
        }

        const insights: string[] = [];
        const warnings: string[] = [];

        if (totalModules > 0) insights.push(`${totalModules} module(s)`);
        if (hasEntryFunctions) insights.push('entry functions ✓');
        if (hasResources) insights.push('resources ✓');
        if (hasViewFunctions) insights.push('view functions ✓');

        if (hasPublicFunctions && !hasResources) {
            warnings.push('Public functions without resource definitions — verify this is intentional');
        }
        if (!hasTests) {
            warnings.push('No #[test] annotations found — add unit tests');
        }
        if (hasEntryFunctions && !hasViewFunctions) {
            warnings.push('Entry functions without #[view] — consider adding view functions for read access');
        }

        if (warnings.length > 0) {
            return {
                name: 'Move Code Quality',
                status: STATUS_WARN,
                expected: 'Move best practices',
                actual: insights.join(', '),
                message: `Code structure: ${insights.join(', ')} — ${warnings.length} suggestion(s)`,
                suggestion: warnings.join('; ')
            };
        }

        return {
            name: 'Move Code Quality',
            status: STATUS_PASS,
            expected: 'Move best practices',
            actual: insights.join(', '),
            message: `Move code quality good: ${insights.join(', ')}`,
            suggestion: null
        };
    } catch {
        return {
            name: 'Move Code Quality',
            status: STATUS_FAIL,
            expected: 'Readable Move files',
            actual: 'error',
            message: 'Cannot analyze Move source files',
            suggestion: 'Check file permissions'
        };
    }
}

/**
 * Check Move module naming conventions
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
        const moveFiles = readdirSync(sourcesDir).filter(f => f.endsWith(MOVE_FILE_EXTENSION));

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

        const badNames = moveFiles.filter(f => {
            const name = f.replace(MOVE_FILE_EXTENSION, '');
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
    } catch {
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
 * Strip single-line and multi-line comments from Move code
 * Reduces false positives in pattern matching
 */
function stripComments(code: string): string {
    // Remove multi-line comments
    let result = code.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments
    result = result.replace(/\/\/.*$/gm, '');
    return result;
}

/**
 * Run all Move checks
 */
export function runChecks(cwd: string): CategoryResult {
    const checks: Check[] = [
        checkMoveToml(cwd),
        checkMoveTomlDependencies(cwd),
        checkMoveSourceFiles(cwd),
        checkMoveCodeQuality(cwd),
        checkMoveModuleNaming(cwd)
    ];

    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_MOVE,
        status: overallStatus,
        checks
    };
}
