import type { Report } from '../../../../shared/schema'
import { CATEGORY_NAMES } from '../../../../shared/constants'
import { CategoryCard } from './CategoryCard'
import './ReportView.css'

interface ReportViewProps {
    report: Report
    onReset: () => void
}

export function ReportView({ report, onReset }: ReportViewProps) {
    const { summary } = report
    const hasFailed = summary.failed > 0
    const hasWarned = summary.warnings > 0

    let overallStatus = '✅ READY'
    let statusClass = 'status-pass'

    if (hasFailed) {
        overallStatus = '❌ NOT READY'
        statusClass = 'status-fail'
    } else if (hasWarned) {
        overallStatus = '⚠️ READY (with warnings)'
        statusClass = 'status-warn'
    }

    const timestamp = new Date(report.timestamp).toLocaleString()

    return (
        <div className="report-view">
            <div className="report-header">
                <div className="report-title">
                    <h2>Inspection Report</h2>
                    <button className="reset-btn" onClick={onReset}>
                        View Another Report
                    </button>
                </div>
                <div className="report-meta">
                    <span className="timestamp">Generated: {timestamp}</span>
                    {report.version && <span className="version">v{report.version}</span>}
                </div>
            </div>

            <div className={`overall-status ${statusClass}`}>
                <div className="status-badge">{overallStatus}</div>
                <div className="status-summary">
                    <span className="stat">
                        <strong>{summary.total}</strong> total checks
                    </span>
                    <span className="stat pass">
                        ✓ <strong>{summary.passed}</strong> passed
                    </span>
                    <span className="stat warn">
                        ⚠ <strong>{summary.warnings}</strong> warnings
                    </span>
                    <span className="stat fail">
                        ✗ <strong>{summary.failed}</strong> failed
                    </span>
                </div>
            </div>

            <div className="categories">
                {report.categories.map((category) => (
                    <CategoryCard
                        key={category.category}
                        category={category}
                        categoryName={CATEGORY_NAMES[category.category] || category.category}
                    />
                ))}
            </div>
        </div>
    )
}
