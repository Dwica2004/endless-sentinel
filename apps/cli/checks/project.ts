import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_PROJECT,
    STATUS_PASS,
    STATUS_FAIL,
    STATUS_WARN
} from '../../../shared/constants.js';

const VALID_NETWORKS = ['testnet', 'mainnet', 'devnet'];

/**
 * Check for sentinel.config.json or endless.config.json
 */
function checkConfigFile(cwd: string): Check {
    const primaryConfig = join(cwd, 'sentinel.config.json');
    const fallbackConfig = join(cwd, 'endless.config.json');

    const hasPrimary = existsSync(primaryConfig);
    const hasFallback = existsSync(fallbackConfig);

    if (hasPrimary) {
        return {
            name: 'Configuration File',
            status: STATUS_PASS,
            expected: 'sentinel.config.json',
            actual: 'sentinel.config.json',
            message: 'Configuration file found',
            suggestion: null
        };
    }

    if (hasFallback) {
        return {
            name: 'Configuration File',
            status: STATUS_WARN,
            expected: 'sentinel.config.json',
            actual: 'endless.config.json',
            message: 'Using fallback config (endless.config.json)',
            suggestion: 'Consider renaming to sentinel.config.json for consistency'
        };
    }

    return {
        name: 'Configuration File',
        status: STATUS_FAIL,
        expected: 'sentinel.config.json',
        actual: 'not found',
        message: 'No configuration file found',
        suggestion: 'Create sentinel.config.json with {"network": "testnet"}'
    };
}

/**
 * Validate network configuration
 */
function checkNetworkConfig(cwd: string): Check {
    const primaryConfig = join(cwd, 'sentinel.config.json');
    const fallbackConfig = join(cwd, 'endless.config.json');

    const configPath = existsSync(primaryConfig) ? primaryConfig :
        existsSync(fallbackConfig) ? fallbackConfig : null;

    if (!configPath) {
        return {
            name: 'Network Configuration',
            status: STATUS_FAIL,
            expected: 'testnet | mainnet | devnet',
            actual: 'no config file',
            message: 'Cannot validate network - config missing',
            suggestion: 'Create config file first'
        };
    }

    try {
        const content = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(content);

        if (!config.network) {
            return {
                name: 'Network Configuration',
                status: STATUS_FAIL,
                expected: 'testnet | mainnet | devnet',
                actual: 'not set',
                message: 'Network property missing in config',
                suggestion: 'Add "network": "testnet" to config file'
            };
        }

        const isValid = VALID_NETWORKS.includes(config.network);

        return {
            name: 'Network Configuration',
            status: isValid ? STATUS_PASS : STATUS_FAIL,
            expected: 'testnet | mainnet | devnet',
            actual: config.network,
            message: isValid
                ? `Network set to: ${config.network}`
                : `Invalid network: ${config.network}`,
            suggestion: isValid
                ? null
                : `Set network to one of: ${VALID_NETWORKS.join(', ')}`
        };
    } catch (error) {
        return {
            name: 'Network Configuration',
            status: STATUS_FAIL,
            expected: 'valid JSON',
            actual: 'parse error',
            message: 'Config file is malformed',
            suggestion: 'Fix JSON syntax in config file'
        };
    }
}

/**
 * Check for src/ directory
 */
function checkSrcDirectory(cwd: string): Check {
    const srcPath = join(cwd, 'src');
    const exists = existsSync(srcPath);

    return {
        name: 'Source Directory',
        status: exists ? STATUS_PASS : STATUS_FAIL,
        expected: 'src/',
        actual: exists ? 'src/' : 'not found',
        message: exists
            ? 'Source directory exists'
            : 'Source directory missing',
        suggestion: exists
            ? null
            : 'Create src/ directory for your project code'
    };
}

/**
 * Run all project checks
 */
export function runChecks(cwd: string = process.cwd()): CategoryResult {
    const checks: Check[] = [
        checkConfigFile(cwd),
        checkNetworkConfig(cwd),
        checkSrcDirectory(cwd)
    ];

    // Determine overall status
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_PROJECT,
        status: overallStatus,
        checks
    };
}
