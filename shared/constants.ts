/**
 * Shared Constants for Endless Sentinel
 * 
 * Single source of truth for constants used across CLI and web UI.
 * Import from here to avoid magic strings and ensure consistency.
 */

/**
 * Check status values
 */
export const STATUS_PASS = 'pass' as const;
export const STATUS_WARN = 'warn' as const;
export const STATUS_FAIL = 'fail' as const;

/**
 * Check category identifiers
 */
export const CATEGORY_ENV = 'environment' as const;
export const CATEGORY_PROJECT = 'project' as const;
export const CATEGORY_HYGIENE = 'hygiene' as const;
export const CATEGORY_NETWORK = 'network' as const;
export const CATEGORY_MOVE = 'move' as const;
export const CATEGORY_CLI = 'cli' as const;
export const CATEGORY_SECURITY = 'security' as const;

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<string, string> = {
    [CATEGORY_ENV]: 'Environment',
    [CATEGORY_PROJECT]: 'Project Configuration',
    [CATEGORY_HYGIENE]: 'Code Hygiene',
    [CATEGORY_NETWORK]: 'Endless Network',
    [CATEGORY_MOVE]: 'Move Smart Contracts',
    [CATEGORY_CLI]: 'Endless CLI',
    [CATEGORY_SECURITY]: 'Security Analysis'
};

/**
 * File and path constants
 */
export const REPORT_FILENAME = 'sentinel-report.json' as const;
export const CONFIG_FILENAME = 'sentinel.config.json' as const;

/**
 * Version requirements
 */
export const MIN_NODE_VERSION = '18.0.0';
export const MIN_NPM_VERSION = '9.0.0';

/**
 * Endless Network Constants
 */
export const ENDLESS_NETWORKS = ['testnet', 'mainnet', 'devnet', 'localnet'] as const;
export const ENDLESS_RPC_ENDPOINTS: Record<string, string> = {
    testnet: 'https://testnet.endless.link',
    mainnet: 'https://mainnet.endless.link',
    devnet: 'https://devnet.endless.link'
};

/**
 * Move Language Constants
 */
export const MOVE_FILE_EXTENSION = '.move';
export const MOVE_TOML_FILE = 'Move.toml';
export const MOVE_SOURCE_DIR = 'sources';

/**
 * Endless CLI Constants
 */
export const ENDLESS_CLI_COMMAND = 'endless';
export const MIN_ENDLESS_CLI_VERSION = '1.0.0';

/**
 * Web UI constants
 */
export const DEFAULT_PORT = 3000;
export const APP_NAME = 'Endless Sentinel';
export const APP_DESCRIPTION = 'Developer readiness and project health inspector';

/**
 * CLI constants
 */
export const CLI_NAME = 'sentinel';
export const CLI_VERSION = '1.0.0';

/**
 * Exit codes (for CLI)
 */
export const EXIT_SUCCESS = 0;
export const EXIT_WARNINGS = 1;
export const EXIT_FAILURES = 2;
export const EXIT_ERROR = 3;

/**
 * Schema version
 */
export const SCHEMA_VERSION = '1.0.0';
