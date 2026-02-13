import { execSync } from 'child_process';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_CLI,
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    ENDLESS_CLI_COMMAND
} from '../../../shared/constants.js';

/**
 * Check if Endless CLI is installed
 */
function checkCliInstallation(): Check {
    try {
        // Try to run endless --version
        const output = execSync(`${ENDLESS_CLI_COMMAND} --version`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        return {
            name: 'Endless CLI Installation',
            status: STATUS_PASS,
            expected: 'Endless CLI installed',
            actual: output || 'installed',
            message: `Endless CLI is installed${output ? `: ${output}` : ''}`,
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'Endless CLI Installation',
            status: STATUS_FAIL,
            expected: 'Endless CLI installed',
            actual: 'not found',
            message: 'Endless CLI is not installed or not in PATH',
            suggestion: 'Install Endless CLI: npm install -g @endless/cli or follow https://docs.endless.link/endless/devbuild/build/endless-cli/use-endless-cli'
        };
    }
}

/**
 * Check Endless CLI help command availability
 */
function checkCliCommands(): Check {
    try {
        // Check if we can access CLI help
        execSync(`${ENDLESS_CLI_COMMAND} --help`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        return {
            name: 'CLI Commands Available',
            status: STATUS_PASS,
            expected: 'CLI commands accessible',
            actual: 'help command works',
            message: 'Endless CLI commands are accessible',
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'CLI Commands Available',
            status: STATUS_WARN,
            expected: 'Working CLI commands',
            actual: 'help command failed',
            message: 'CLI installed but commands may not work properly',
            suggestion: 'Reinstall Endless CLI or check your installation'
        };
    }
}

/**
 * Check if account commands are available
 */
function checkAccountCommand(): Check {
    try {
        // Try to list accounts
        const output = execSync(`${ENDLESS_CLI_COMMAND} account list`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        // Check if there are any accounts
        const hasAccounts = output && !output.toLowerCase().includes('no account found');

        if (!hasAccounts) {
            return {
                name: 'Endless Accounts',
                status: STATUS_WARN,
                expected: 'At least one account configured',
                actual: 'no accounts found',
                message: 'No Endless accounts configured',
                suggestion: 'Create an account: endless account create --network testnet'
            };
        }

        return {
            name: 'Endless Accounts',
            status: STATUS_PASS,
            expected: 'Account(s) configured',
            actual: 'accounts found',
            message: 'Endless account(s) configured',
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'Endless Accounts',
            status: STATUS_WARN,
            expected: 'Account command working',
            actual: 'command failed',
            message: 'Cannot check accounts (CLI may not be fully configured)',
            suggestion: 'Verify Endless CLI installation and run: endless init'
        };
    }
}

/**
 * Check CLI configuration
 */
function checkCliConfig(): Check {
    try {
        // Check if config command works
        execSync(`${ENDLESS_CLI_COMMAND} config show`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        return {
            name: 'CLI Configuration',
            status: STATUS_PASS,
            expected: 'CLI configured',
            actual: 'config accessible',
            message: 'Endless CLI is configured',
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'CLI Configuration',
            status: STATUS_WARN,
            expected: 'CLI configuration',
            actual: 'not configured',
            message: 'Endless CLI may need initialization',
            suggestion: 'Run: endless init to set up your CLI configuration'
        };
    }
}

/**
 * Check if Move compiler is available
 */
function checkMoveCompiler(): Check {
    try {
        // Try to check Move compilation capability
        const output = execSync(`${ENDLESS_CLI_COMMAND} move --help`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const hasCompile = output.includes('compile') || output.includes('build');

        if (!hasCompile) {
            return {
                name: 'Move Compiler',
                status: STATUS_WARN,
                expected: 'Move compiler available',
                actual: 'compiler commands unclear',
                message: 'Move compiler availability uncertain',
                suggestion: 'Verify Endless CLI supports Move compilation'
            };
        }

        return {
            name: 'Move Compiler',
            status: STATUS_PASS,
            expected: 'Move compiler available',
            actual: 'compiler commands found',
            message: 'Move compiler is available via Endless CLI',
            suggestion: null
        };
    } catch (error) {
        return {
            name: 'Move Compiler',
            status: STATUS_WARN,
            expected: 'Move compiler in CLI',
            actual: 'not found or not accessible',
            message: 'Cannot verify Move compiler availability',
            suggestion: 'Ensure Endless CLI includes Move toolchain'
        };
    }
}

/**
 * Run all CLI checks
 */
export function runChecks(): CategoryResult {
    const checks: Check[] = [
        checkCliInstallation(),
        checkCliCommands(),
        checkAccountCommand(),
        checkCliConfig(),
        checkMoveCompiler()
    ];

    // Determine overall status
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_CLI,
        status: overallStatus,
        checks
    };
}
