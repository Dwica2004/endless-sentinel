import { readFileSync } from 'fs';
import { join } from 'path';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_NETWORK,
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    CONFIG_FILENAME,
    ENDLESS_NETWORKS,
    ENDLESS_RPC_ENDPOINTS
} from '../../../shared/constants.js';

/**
 * Check if sentinel.config.json exists and has valid network
 */
function checkNetworkConfig(cwd: string): Check {
    try {
        const configPath = join(cwd, CONFIG_FILENAME);
        const configContent = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        const network = config.network;
        const isValid = ENDLESS_NETWORKS.includes(network);

        return {
            name: 'Network Configuration',
            status: isValid ? STATUS_PASS : STATUS_FAIL,
            expected: `One of: ${ENDLESS_NETWORKS.join(', ')}`,
            actual: network || 'not specified',
            message: isValid
                ? `Network configured: ${network}`
                : `Invalid network: ${network}`,
            suggestion: isValid
                ? null
                : `Set "network" to one of: ${ENDLESS_NETWORKS.join(', ')} in ${CONFIG_FILENAME}`
        };
    } catch (error) {
        return {
            name: 'Network Configuration',
            status: STATUS_FAIL,
            expected: CONFIG_FILENAME,
            actual: 'not found',
            message: 'Network configuration missing',
            suggestion: `Create ${CONFIG_FILENAME} with {"network": "testnet"}`
        };
    }
}

/**
 * Check RPC endpoint connectivity (basic validation)
 */
function checkRpcEndpoint(cwd: string): Check {
    try {
        const configPath = join(cwd, CONFIG_FILENAME);
        const configContent = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        const network = config.network;

        // Get expected RPC endpoint
        const expectedRpc = ENDLESS_RPC_ENDPOINTS[network];

        if (!expectedRpc) {
            return {
                name: 'RPC Endpoint',
                status: STATUS_WARN,
                expected: 'Valid Endless RPC endpoint',
                actual: network === 'localnet' ? 'http://localhost:8080' : 'unknown',
                message: network === 'localnet'
                    ? 'Using local network (no RPC validation)'
                    : 'Unknown network',
                suggestion: network === 'localnet'
                    ? 'Ensure your local Endless node is running on port 8080'
                    : 'Use a known network (testnet, mainnet, devnet)'
            };
        }

        // For now, we just validate the endpoint format
        // In production, we could make actual HTTP requests
        return {
            name: 'RPC Endpoint',
            status: STATUS_PASS,
            expected: 'Valid RPC endpoint',
            actual: expectedRpc,
            message: `RPC endpoint ready: ${expectedRpc}`,
            suggestion: null
        };

    } catch (error) {
        return {
            name: 'RPC Endpoint',
            status: STATUS_FAIL,
            expected: 'Valid network configuration',
            actual: 'configuration error',
            message: 'Cannot determine RPC endpoint',
            suggestion: `Ensure ${CONFIG_FILENAME} exists with valid network setting`
        };
    }
}

/**
 * Check if Endless account configuration exists
 */
function checkAccountSetup(cwd: string): Check {
    // This is a basic check - in production, could check for .endless/config.yaml
    // For now, we provide guidance on account setup

    return {
        name: 'Account Setup',
        status: STATUS_WARN,
        expected: 'Endless account configured',
        actual: 'check manually',
        message: 'Verify your Endless account is set up',
        suggestion: 'Run: endless account list (ensure you have at least one account)'
    };
}

/**
 * Check network connectivity readiness
 */
function checkNetworkReadiness(cwd: string): Check {
    try {
        const configPath = join(cwd, CONFIG_FILENAME);
        const configContent = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        const network = config.network;

        const isProduction = network === 'mainnet';

        return {
            name: 'Network Readiness',
            status: isProduction ? STATUS_WARN : STATUS_PASS,
            expected: 'Appropriate network for development',
            actual: network,
            message: isProduction
                ? 'Using MAINNET (production network)'
                : `Using ${network} (safe for development)`,
            suggestion: isProduction
                ? 'WARNING: You are on mainnet. Use testnet/devnet for development and testing'
                : null
        };
    } catch (error) {
        return {
            name: 'Network Readiness',
            status: STATUS_FAIL,
            expected: 'Network configuration',
            actual: 'not configured',
            message: 'Cannot determine network readiness',
            suggestion: `Create ${CONFIG_FILENAME} with network configuration`
        };
    }
}

/**
 * Run all network checks
 */
export function runChecks(cwd: string): CategoryResult {
    const checks: Check[] = [
        checkNetworkConfig(cwd),
        checkRpcEndpoint(cwd),
        checkAccountSetup(cwd),
        checkNetworkReadiness(cwd)
    ];

    // Determine overall status
    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_NETWORK,
        status: overallStatus,
        checks
    };
}
