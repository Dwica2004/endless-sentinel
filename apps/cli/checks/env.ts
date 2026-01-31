import { execSync } from 'child_process';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_ENV,
    STATUS_PASS,
    STATUS_FAIL,
    MIN_NODE_VERSION,
    MIN_NPM_VERSION
} from '../../../shared/constants.js';

/**
 * Parse version string to comparable number
 * e.g., "18.17.0" -> 18017000
 */
function parseVersion(versionString: string): number {
    const cleaned = versionString.replace(/^v/, '');
    const parts = cleaned.split('.').map(Number);
    return parts[0] * 1000000 + (parts[1] || 0) * 1000 + (parts[2] || 0);
}

/**
 * Check Node.js version
 */
function checkNodeVersion(): Check {
    const currentVersion = process.version;
    const current = parseVersion(currentVersion);
    const required = parseVersion(MIN_NODE_VERSION);

    const isValid = current >= required;

    return {
        name: 'Node.js Version',
        status: isValid ? STATUS_PASS : STATUS_FAIL,
        expected: `>=${MIN_NODE_VERSION}`,
        actual: currentVersion,
        message: isValid
            ? `Node.js ${currentVersion} is compatible`
            : `Node.js ${currentVersion} is too old`,
        suggestion: isValid
            ? null
            : `Upgrade to Node.js ${MIN_NODE_VERSION} or higher. Run: nvm install 20`
    };
}

/**
 * Check npm version
 */
function checkNpmVersion(): Check {
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
        const current = parseVersion(npmVersion);
        const required = parseVersion(MIN_NPM_VERSION);

        const isValid = current >= required;

        return {
            name: 'npm Version',
            status: isValid ? STATUS_PASS : STATUS_FAIL,
            expected: `>=${MIN_NPM_VERSION}`,
            actual: npmVersion,
            message: isValid
                ? `npm ${npmVersion} is compatible`
                : `npm ${npmVersion} is too old`,
            suggestion: isValid
                ? null
                : `Upgrade npm: npm install -g npm@latest`
        };
    } catch (error) {
        return {
            name: 'npm Version',
            status: STATUS_FAIL,
            expected: `>=${MIN_NPM_VERSION}`,
            actual: 'not found',
            message: 'npm is not installed or not in PATH',
            suggestion: 'Install npm with Node.js from nodejs.org'
        };
    }
}

/**
 * Run all environment checks
 */
export function runChecks(): CategoryResult {
    const checks: Check[] = [
        checkNodeVersion(),
        checkNpmVersion()
    ];

    // Determine overall status (fail if any fail, otherwise pass)
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const overallStatus = hasFailed ? STATUS_FAIL : STATUS_PASS;

    return {
        category: CATEGORY_ENV,
        status: overallStatus,
        checks
    };
}
