import type { Report } from '../../../shared/schema.js';
import {
    STATUS_PASS,
    STATUS_WARN,
    STATUS_FAIL,
    HEALTH_WEIGHTS
} from '../../../shared/constants.js';

/**
 * Health Score Engine
 * Calculates a weighted 0-100 score based on check results per category.
 * This makes Sentinel measurable and comparable across projects.
 */

export interface HealthResult {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: CategoryScore[];
}

export interface CategoryScore {
    category: string;
    weight: number;
    passed: number;
    total: number;
    score: number;
    weightedScore: number;
}

const GRADE_THRESHOLDS: Array<{ min: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' }> = [
    { min: 90, grade: 'A' },
    { min: 75, grade: 'B' },
    { min: 60, grade: 'C' },
    { min: 40, grade: 'D' },
    { min: 0, grade: 'F' }
];

/**
 * Calculate score for each check
 * pass = 1.0, warn = 0.5, fail = 0.0
 */
function checkScore(status: string): number {
    if (status === STATUS_PASS) return 1.0;
    if (status === STATUS_WARN) return 0.5;
    return 0.0;
}

/**
 * Calculate overall health score from a report
 */
export function calculateHealthScore(report: Report): HealthResult {
    const breakdown: CategoryScore[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of report.categories) {
        const catKey = category.category;
        const weight = HEALTH_WEIGHTS[catKey] || 10;

        const checks = category.checks;
        if (checks.length === 0) continue;

        const scoreSum = checks.reduce((sum, check) => sum + checkScore(check.status), 0);
        const catScore = Math.round((scoreSum / checks.length) * 100);
        const weightedScore = (catScore / 100) * weight;

        breakdown.push({
            category: catKey,
            weight,
            passed: checks.filter(c => c.status === STATUS_PASS).length,
            total: checks.length,
            score: catScore,
            weightedScore: Math.round(weightedScore * 10) / 10
        });

        totalWeightedScore += weightedScore;
        totalWeight += weight;
    }

    // Normalize to 0-100
    const finalScore = totalWeight > 0
        ? Math.round((totalWeightedScore / totalWeight) * 100)
        : 0;

    // Determine grade
    const grade = GRADE_THRESHOLDS.find(t => finalScore >= t.min)?.grade || 'F';

    return { score: finalScore, grade, breakdown };
}

/**
 * Print health score to console
 */
export function printHealthScore(result: HealthResult): void {
    const { score, grade, breakdown } = result;

    // Grade display with color hint
    const gradeDisplay = grade === 'A' ? '🟢 A' :
                         grade === 'B' ? '🟢 B' :
                         grade === 'C' ? '🟡 C' :
                         grade === 'D' ? '🟠 D' : '🔴 F';

    console.log(`\n${'━'.repeat(50)}`);
    console.log(`  HEALTH SCORE: ${score}/100  │  Grade: ${gradeDisplay}`);
    console.log(`${'━'.repeat(50)}`);

    // Category breakdown
    console.log('\n  Category Breakdown:');
    for (const cat of breakdown) {
        const bar = generateBar(cat.score);
        const label = cat.category.padEnd(14);
        console.log(`  ${label} ${bar} ${cat.score}% (${cat.passed}/${cat.total}) [w:${cat.weight}]`);
    }

    console.log('');
}

/**
 * Generate a simple text progress bar
 */
function generateBar(percent: number): string {
    const width = 20;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}
