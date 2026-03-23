/**
 * Shared Type Definitions for Endless Sentinel
 * 
 * This file defines the data contract between CLI and web UI.
 * Both apps import from here to ensure type consistency.
 */

/**
 * Status of a single check or category
 */
export type CheckStatus = 'pass' | 'warn' | 'fail';

/**
 * Individual check result
 */
export interface Check {
  /** Name of the check (e.g., "Node.js Version") */
  name: string;
  
  /** Status of this check */
  status: CheckStatus;
  
  /** What was expected (e.g., ">=18.0.0") */
  expected: string;
  
  /** What was actually found (e.g., "20.10.0") */
  actual: string;
  
  /** Human-readable message about the result */
  message: string;
  
  /** Actionable suggestion if check failed (null if passed) */
  suggestion: string | null;
}

/**
 * Result for a category of checks
 */
export interface CategoryResult {
  /** Category identifier (e.g., "environment", "project") */
  category: string;
  
  /** Overall status for this category (worst status among its checks) */
  status: CheckStatus;
  
  /** Individual checks in this category */
  checks: Check[];
}

/**
 * Summary statistics for the entire report
 */
export interface ReportSummary {
  /** Total number of checks run */
  total: number;
  
  /** Number of checks that passed */
  passed: number;
  
  /** Number of checks with warnings */
  warnings: number;
  
  /** Number of checks that failed */
  failed: number;
}

/**
 * Complete sentinel report structure
 */
export interface Report {
  /** ISO 8601 timestamp of when the report was generated */
  timestamp: string;
  
  /** Summary statistics */
  summary: ReportSummary;
  
  /** Results grouped by category */
  categories: CategoryResult[];
  
  /** Schema version (for future compatibility) */
  version?: string;

  /** Overall health score (0-100) */
  healthScore?: number;

  /** Letter grade derived from health score */
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Metadata about the environment where checks were run
 */
export interface EnvironmentMetadata {
  /** Node.js version */
  nodeVersion: string;
  
  /** npm version */
  npmVersion: string;
  
  /** Operating system */
  platform: string;
  
  /** OS architecture (x64, arm64, etc.) */
  arch: string;
  
  /** Working directory where CLI was run */
  cwd: string;
}

/**
 * Extended report with metadata (optional)
 */
export interface ExtendedReport extends Report {
  /** Environment metadata */
  environment?: EnvironmentMetadata;
}
