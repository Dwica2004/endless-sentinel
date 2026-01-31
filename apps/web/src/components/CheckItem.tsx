import type { Check } from '../../../../shared/schema'
import './CheckItem.css'

interface CheckItemProps {
    check: Check
}

export function CheckItem({ check }: CheckItemProps) {
    const statusIcon = {
        pass: '✓',
        warn: '⚠',
        fail: '✗'
    }[check.status]

    return (
        <div className={`check-item status-${check.status}`}>
            <div className="check-header">
                <span className="check-status-icon">{statusIcon}</span>
                <div className="check-info">
                    <h4 className="check-name">{check.name}</h4>
                    <p className="check-message">{check.message}</p>
                </div>
            </div>

            <div className="check-details">
                <div className="detail-row">
                    <span className="label">Expected:</span>
                    <code className="value">{check.expected}</code>
                </div>
                <div className="detail-row">
                    <span className="label">Actual:</span>
                    <code className={`value ${check.status === 'fail' ? 'error' : ''}`}>
                        {check.actual}
                    </code>
                </div>
            </div>

            {check.suggestion && (
                <div className="check-suggestion">
                    <span className="suggestion-icon">💡</span>
                    <div className="suggestion-text">
                        <strong>Suggestion:</strong> {check.suggestion}
                    </div>
                </div>
            )}
        </div>
    )
}
