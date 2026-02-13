import { Report } from '../../../shared/schema';
import { STATUS_PASS, STATUS_WARN, STATUS_FAIL } from '../../../shared/constants';

/**
 * Generate shields.io badge URLs for README
 */

export interface Badge {
    label: string;
    message: string;
    color: string;
    url: string;
}

export function generateBadges(report: Report): Badge[] {
    const badges: Badge[] = [];

    // Calculate overall status
    const hasFailed = report.summary.failed > 0;
    const hasWarned = report.summary.warnings > 0;

    let overallStatus: string;
    let statusColor = 'gray';
    let statusMessage = 'unknown';

    if (hasFailed) {
        overallStatus = STATUS_FAIL;
        statusColor = 'red';
        statusMessage = 'failing';
    } else if (hasWarned) {
        overallStatus = STATUS_WARN;
        statusColor = 'yellow';
        statusMessage = 'warnings';
    } else {
        overallStatus = STATUS_PASS;
        statusColor = 'brightgreen';
        statusMessage = 'passing';
    }

    badges.push({
        label: 'Sentinel',
        message: statusMessage,
        color: statusColor,
        url: `https://img.shields.io/badge/Sentinel-${statusMessage}-${statusColor}`
    });

    // Pass rate badge
    const passRate = Math.round((report.summary.passed / report.summary.total) * 100);
    let passColor = 'red';
    if (passRate >= 80) passColor = 'brightgreen';
    else if (passRate >= 60) passColor = 'yellow';
    else if (passRate >= 40) passColor = 'orange';

    badges.push({
        label: 'Pass Rate',
        message: `${passRate}%`,
        color: passColor,
        url: `https://img.shields.io/badge/Pass_Rate-${passRate}%25-${passColor}`
    });

    // Security badge (if security category exists)
    const securityCat = report.categories.find(c => c.category === 'security');
    if (securityCat) {
        const secColor = securityCat.status === STATUS_PASS ? 'brightgreen' :
            securityCat.status === STATUS_WARN ? 'yellow' : 'red';
        const secMessage = securityCat.status === STATUS_PASS ? 'secure' :
            securityCat.status === STATUS_WARN ? 'warnings' : 'issues';

        badges.push({
            label: 'Security',
            message: secMessage,
            color: secColor,
            url: `https://img.shields.io/badge/Security-${secMessage}-${secColor}`
        });
    }

    // Endless badge
    badges.push({
        label: 'Built for',
        message: 'Endless',
        color: '8B5CF6',
        url: 'https://img.shields.io/badge/Built_for-Endless-8B5CF6'
    });

    return badges;
}

export function generateMarkdownBadges(report: Report): string {
    const badges = generateBadges(report);
    return badges.map(b => `![${b.label}](${b.url})`).join(' ');
}

export function generateHTMLBadges(report: Report): string {
    const badges = generateBadges(report);
    return badges.map(b =>
        `<img src="${b.url}" alt="${b.label}: ${b.message}" />`
    ).join('\n');
}
