import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { CategoryResult, Check } from '../../../shared/schema.js';
import {
    CATEGORY_NETWORK,
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    CONFIG_FILENAME,
    ENDLESS_NETWORKS,
    ENDLESS_RPC_ENDPOINTS,
    RPC_HEALTH_PATH
} from '../../../shared/constants.js';

/**
 * Read config file and return parsed JSON
 */
function readConfig(cwd: string): { network?: string; rpc?: string } | null {
    try {
        const configPath = join(cwd, CONFIG_FILENAME);
        const content = readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * Check if sentinel.config.json exists and has valid network
 */
function checkNetworkConfig(cwd: string): Check {
    const config = readConfig(cwd);

    if (!config) {
        return {
            name: 'Network Configuration',
            status: STATUS_FAIL,
            expected: `One of: ${ENDLESS_NETWORKS.join(', ')}`,
            actual: 'no config file',
            message: 'Network configuration missing',
            suggestion: `Create ${CONFIG_FILENAME} with {"network": "testnet"}`
        };
    }

    const network = config.network;
    const isValid = network ? ENDLESS_NETWORKS.includes(network as any) : false;

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
}

/**
 * LIVE RPC Health Probe - actually connects to the Endless network
 * This is the single most useful check for any Endless developer.
 */
async function checkRpcLive(cwd: string): Promise<Check> {
    const config = readConfig(cwd);

    if (!config || !config.network) {
        return {
            name: 'RPC Live Probe',
            status: STATUS_FAIL,
            expected: 'Valid network configuration',
            actual: 'no config',
            message: 'Cannot probe RPC — no network configured',
            suggestion: `Set "network" in ${CONFIG_FILENAME}`
        };
    }

    const network = config.network;

    // Use custom RPC or default
    const rpcBase = config.rpc || ENDLESS_RPC_ENDPOINTS[network];

    if (!rpcBase) {
        if (network === 'localnet') {
            return {
                name: 'RPC Live Probe',
                status: STATUS_WARN,
                expected: 'Reachable RPC endpoint',
                actual: 'localnet (http://localhost:8080)',
                message: 'Using local network — ensure your node is running',
                suggestion: 'Start your local Endless node on port 8080'
            };
        }
        return {
            name: 'RPC Live Probe',
            status: STATUS_FAIL,
            expected: 'Known RPC endpoint',
            actual: `Unknown network: ${network}`,
            message: 'Cannot determine RPC endpoint',
            suggestion: `Use a known network or set "rpc" in ${CONFIG_FILENAME}`
        };
    }

    const rpcUrl = `${rpcBase}${RPC_HEALTH_PATH}`;

    try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(rpcUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            return {
                name: 'RPC Live Probe',
                status: STATUS_FAIL,
                expected: 'HTTP 200 from RPC',
                actual: `HTTP ${response.status}`,
                message: `RPC returned error: ${response.status} ${response.statusText}`,
                suggestion: 'Check if the RPC endpoint is correct and the network is operational'
            };
        }

        // Parse ledger info from response
        const data = await response.json() as Record<string, any>;

        const chainId = data.chain_id;
        const epoch = data.epoch;
        const ledgerVersion = data.ledger_version;
        const blockHeight = data.block_height;

        // Build detailed status
        const details: string[] = [];
        if (chainId) details.push(`chain_id=${chainId}`);
        if (epoch) details.push(`epoch=${epoch}`);
        if (blockHeight) details.push(`block=${blockHeight}`);
        if (ledgerVersion) details.push(`ledger_v=${ledgerVersion}`);
        details.push(`${responseTime}ms`);

        // Check response time
        let status: typeof STATUS_PASS | typeof STATUS_WARN | typeof STATUS_FAIL = STATUS_PASS;
        let suggestion: string | null = null;

        if (responseTime > 5000) {
            status = STATUS_WARN;
            suggestion = 'RPC response time is very slow. Consider using a different endpoint.';
        } else if (responseTime > 2000) {
            status = STATUS_WARN;
            suggestion = 'RPC response time is slow. This may affect deployment speed.';
        }

        return {
            name: 'RPC Live Probe',
            status,
            expected: 'Responsive Endless RPC',
            actual: details.join(' | '),
            message: `✅ ${network} RPC is LIVE [${details.join(' | ')}]`,
            suggestion
        };

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return {
                name: 'RPC Live Probe',
                status: STATUS_FAIL,
                expected: 'Response within 8 seconds',
                actual: 'timeout',
                message: `RPC endpoint timed out: ${rpcUrl}`,
                suggestion: 'Network may be down. Check https://scan.endless.link for status.'
            };
        }

        return {
            name: 'RPC Live Probe',
            status: STATUS_FAIL,
            expected: 'Reachable RPC endpoint',
            actual: error.message || 'connection refused',
            message: `Cannot reach RPC: ${rpcUrl}`,
            suggestion: 'Check your internet connection and verify the RPC URL. Visit https://scan.endless.link for network status.'
        };
    }
}

/**
 * Check Endless account configuration (.endless/ directory)
 */
function checkAccountSetup(cwd: string): Check {
    const endlessDir = join(homedir(), '.endless');
    const configYaml = join(endlessDir, 'config.yaml');
    const hasEndlessDir = existsSync(endlessDir);
    const hasConfig = existsSync(configYaml);

    if (hasConfig) {
        return {
            name: 'Account Setup',
            status: STATUS_PASS,
            expected: 'Endless account configured',
            actual: '.endless/config.yaml found',
            message: 'Endless account is configured',
            suggestion: null
        };
    }

    if (hasEndlessDir) {
        return {
            name: 'Account Setup',
            status: STATUS_WARN,
            expected: 'Endless account configured',
            actual: '.endless/ exists, no config.yaml',
            message: 'Endless directory found but no account configured',
            suggestion: 'Run: endless init (to create an account)'
        };
    }

    return {
        name: 'Account Setup',
        status: STATUS_WARN,
        expected: 'Endless account configured',
        actual: 'no .endless/ directory',
        message: 'No Endless account found',
        suggestion: 'Run: endless init (to initialize and create your first account)'
    };
}

/**
 * Check if using production network safely
 */
function checkNetworkSafety(cwd: string): Check {
    const config = readConfig(cwd);

    if (!config || !config.network) {
        return {
            name: 'Network Safety',
            status: STATUS_FAIL,
            expected: 'Network configuration',
            actual: 'not configured',
            message: 'Cannot determine network safety',
            suggestion: `Create ${CONFIG_FILENAME} with network configuration`
        };
    }

    const network = config.network;
    const isProduction = network === 'mainnet';

    return {
        name: 'Network Safety',
        status: isProduction ? STATUS_WARN : STATUS_PASS,
        expected: 'Appropriate network for development',
        actual: network,
        message: isProduction
            ? '⚠️ MAINNET detected — use caution with real assets'
            : `Using ${network} (safe for development)`,
        suggestion: isProduction
            ? 'Switch to testnet for development: {"network": "testnet"}'
            : null
    };
}

/**
 * Run all network checks (includes async RPC probe)
 */
export async function runChecks(cwd: string): Promise<CategoryResult> {
    const syncChecks: Check[] = [
        checkNetworkConfig(cwd),
        checkAccountSetup(cwd),
        checkNetworkSafety(cwd)
    ];

    // Run live RPC probe
    const rpcCheck = await checkRpcLive(cwd);
    const checks = [...syncChecks, rpcCheck];

    const hasFailed = checks.some(c => c.status === STATUS_FAIL);
    const hasWarned = checks.some(c => c.status === STATUS_WARN);
    const overallStatus = hasFailed ? STATUS_FAIL : (hasWarned ? STATUS_WARN : STATUS_PASS);

    return {
        category: CATEGORY_NETWORK,
        status: overallStatus,
        checks
    };
}
