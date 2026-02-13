import { Report } from '../../../shared/schema';
import { STATUS_PASS, STATUS_WARN, STATUS_FAIL } from '../../../shared/constants';

/**
 * Compare two reports and show improvements/regressions
 */
export interface ComparisonResult {
    improved: number;
    regressed: number;
    unchanged: number;
    newChecks: number;
    removedChecks: number;
    details: ComparisonDetail[];
}

export interface ComparisonDetail {
    checkName: string;
    category: string;
    oldStatus: string;
    newStatus: string;
    change: 'improved' | 'regressed' | 'unchanged' | 'new' | 'removed';
}

const STATUS_SCORE = {
    [STATUS_PASS]: 2,
    [STATUS_WARN]: 1,
    [STATUS_FAIL]: 0
};

export function compareReports(oldReport: Report, newReport: Report): ComparisonResult {
    const details: ComparisonDetail[] = [];
    let improved = 0;
    let regressed = 0;
    let unchanged = 0;
    let newChecksCount = 0;
    let removedChecks = 0;

    // Create maps for easier lookup
    const oldChecksMap = new Map<string, { status: string; category: string }>();
    const newChecksMap = new Map<string, { status: string; category: string }>();

    oldReport.categories.forEach(cat => {
        cat.checks.forEach(check => {
            oldChecksMap.set(check.name, { status: check.status, category: cat.category });
        });
    });

    newReport.categories.forEach(cat => {
        cat.checks.forEach(check => {
            newChecksMap.set(check.name, { status: check.status, category: cat.category });
        });
    });

    // Compare checks
    newChecksMap.forEach((newCheck, checkName) => {
        const oldCheck = oldChecksMap.get(checkName);

        if (!oldCheck) {
            // New check added
            details.push({
                checkName,
                category: newCheck.category,
                oldStatus: 'N/A',
                newStatus: newCheck.status,
                change: 'new'
            });
            newChecksCount++;
        } else {
            const oldScore = STATUS_SCORE[oldCheck.status as keyof typeof STATUS_SCORE] || 0;
            const newScore = STATUS_SCORE[newCheck.status as keyof typeof STATUS_SCORE] || 0;

            if (newScore > oldScore) {
                details.push({
                    checkName,
                    category: newCheck.category,
                    oldStatus: oldCheck.status,
                    newStatus: newCheck.status,
                    change: 'improved'
                });
                improved++;
            } else if (newScore < oldScore) {
                details.push({
                    checkName,
                    category: newCheck.category,
                    oldStatus: oldCheck.status,
                    newStatus: newCheck.status,
                    change: 'regressed'
                });
                regressed++;
            } else {
                details.push({
                    checkName,
                    category: newCheck.category,
                    oldStatus: oldCheck.status,
                    newStatus: newCheck.status,
                    change: 'unchanged'
                });
                unchanged++;
            }
        }
    });

    // Find removed checks
    oldChecksMap.forEach((oldCheck, checkName) => {
        if (!newChecksMap.has(checkName)) {
            details.push({
                checkName,
                category: oldCheck.category,
                oldStatus: oldCheck.status,
                newStatus: 'N/A',
                change: 'removed'
            });
            removedChecks++;
        }
    });

    return {
        improved,
        regressed,
        unchanged,
        newChecks: newChecksCount,
        removedChecks,
        details
    };
}
