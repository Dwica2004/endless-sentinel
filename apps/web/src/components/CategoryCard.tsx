import { useState } from 'react'
import type { CategoryResult } from '../../../../shared/schema'
import { STATUS_PASS, STATUS_WARN, STATUS_FAIL } from '../../../../shared/constants'
import { CheckItem } from './CheckItem'
import './CategoryCard.css'

interface CategoryCardProps {
    category: CategoryResult
    categoryName: string
    isFirst?: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
    environment: '🖥️',
    project: '⚙️',
    hygiene: '🧹',
    network: '🌐',
    move: '📜',
    cli: '🔧',
    security: '🔒'
}

export function CategoryCard({ category, categoryName, isFirst = false }: CategoryCardProps) {
    // Auto-expand: first category, or any failing category
    const [isExpanded, setIsExpanded] = useState(isFirst || category.status === STATUS_FAIL)

    const statusIcon = {
        [STATUS_PASS]: '✓',
        [STATUS_WARN]: '⚠',
        [STATUS_FAIL]: '✗'
    }[category.status] ?? '?'

    const passCount = category.checks.filter(c => c.status === STATUS_PASS).length
    const warnCount = category.checks.filter(c => c.status === STATUS_WARN).length
    const failCount = category.checks.filter(c => c.status === STATUS_FAIL).length
    const icon = CATEGORY_ICONS[category.category] ?? '📋'

    return (
        <div className={`category-card status-${category.status}`}>
            <div
                className="category-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="category-title">
                    <span className="category-icon">{icon}</span>
                    <span className={`status-icon status-${category.status}`}>{statusIcon}</span>
                    <h3>{categoryName}</h3>
                </div>
                <div className="category-meta">
                    {passCount > 0 && <span className="pill pass">✓ {passCount}</span>}
                    {warnCount > 0 && <span className="pill warn">⚠ {warnCount}</span>}
                    {failCount > 0 && <span className="pill fail">✗ {failCount}</span>}
                    <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="category-content">
                    {category.checks.map((check, index) => (
                        <CheckItem key={index} check={check} />
                    ))}
                </div>
            )}
        </div>
    )
}
