import type { Check } from '../../../../shared/schema'
import './CheckItem.css'

interface CheckItemProps {
    check: Check
}

export function CheckItem({ check }: CheckItemProps) {
    const isFail = check.status === 'fail'
    const isWarn = check.status === 'warn'

    const statusIcon = {
        pass: '✓',
        warn: '⚠',
        fail: '✗'
    }[check.status]

    return (
        <div className={`check-item status-${check.status}`}>
            {/* Header: icon + name + message */}
            <div className="check-header">
                <span className="check-status-icon">{statusIcon}</span>
                <div className="check-info">
                    <span className="check-name">{check.name}</span>
                    <span className="check-message">{check.message}</span>
                </div>
            </div>

            {/* Detail row: always show expected/actual */}
            <div className="check-details">
                <div className="detail-row">
                    <span className="label">Expected</span>
                    <span className="value">{check.expected}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Actual</span>
                    <span className={`value ${isFail || isWarn ? 'highlight' : ''} ${isFail ? 'error' : ''}`}>
                        {check.actual}
                    </span>
                </div>
            </div>

            {/* Suggestion — only when present */}
            {check.suggestion && (
                <div className="check-suggestion">
                    <span className="suggestion-icon">💡</span>
                    <div className="suggestion-text">
                        <strong>Fix:</strong> {check.suggestion}
                    </div>
                </div>
            )}
        </div>
    )
}
