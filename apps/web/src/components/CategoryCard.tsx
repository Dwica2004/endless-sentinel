import { useState } from 'react'
import type { CategoryResult } from '../../../../shared/schema'
import { CheckItem } from './CheckItem'
import './CategoryCard.css'

interface CategoryCardProps {
    category: CategoryResult
    categoryName: string
    isFirst?: boolean
}

export function CategoryCard({ category, categoryName, isFirst = false }: CategoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(isFirst)

    const statusIcon = {
        pass: '✓',
        warn: '⚠',
        fail: '✗'
    }[category.status]

    return (
        <div className={`category-card status-${category.status}`}>
            <div
                className="category-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="category-title">
                    <span className="status-icon">{statusIcon}</span>
                    <h3>{categoryName}</h3>
                    <span className="check-count">
                        {category.checks.length} checks
                    </span>
                </div>
                <button className="expand-btn">
                    {isExpanded ? '▼' : '▶'}
                </button>
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
