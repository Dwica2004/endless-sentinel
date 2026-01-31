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

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<string, string> = {
    [CATEGORY_ENV]: 'Environment',
    [CATEGORY_PROJECT]: 'Project Configuration',
    [CATEGORY_HYGIENE]: 'Code Hygiene'
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
