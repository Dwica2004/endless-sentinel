import { useState } from 'react'
import './MoveTomlValidator.css'

interface DepIssue { dep: string; issue: string; severity: 'error' | 'warning' }
interface ValidationResult {
    hasPackage: boolean
    hasName: string | null
    dependencies: Array<{ name: string; valid: boolean; subdir?: string }>
    issues: DepIssue[]
    score: number
}

const VALID_SUBDIRS = ['endless-framework', 'endless-stdlib', 'endless-token', 'move-stdlib']
const ENDLESS_REPO = 'endless-labs/endless-move-framework'

const SAMPLE_TOML = `[package]
name = "my_endless_project"
version = "1.0.0"

[addresses]
my_project = "0xcafe"

[dependencies]
EndlessFramework = { git = "https://github.com/endless-labs/endless-move-framework.git", subdir = "endless-framework", rev = "main" }
EndlessStdlib = { git = "https://github.com/endless-labs/endless-move-framework.git", subdir = "endless-stdlib", rev = "main" }
`

function validateToml(content: string): ValidationResult {
    const issues: DepIssue[] = []
    const dependencies: Array<{ name: string; valid: boolean; subdir?: string }> = []

    const hasPackage = content.includes('[package]')
    const nameMatch = content.match(/name\s*=\s*"([^"]+)"/)
    const hasName = nameMatch ? nameMatch[1] : null

    if (!hasPackage) issues.push({ dep: 'package', issue: 'Missing [package] section', severity: 'error' })
    if (!hasName) issues.push({ dep: 'package', issue: 'Missing name field in [package]', severity: 'error' })

    // Parse dependencies
    const lines = content.split('\n')
    let inDeps = false
    for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === '[dependencies]') { inDeps = true; continue }
        if (trimmed.startsWith('[') && trimmed !== '[dependencies]') { inDeps = false; continue }

        if (inDeps && trimmed.includes('=') && !trimmed.startsWith('#') && trimmed.length > 0) {
            const depName = trimmed.split('=')[0].trim()
            let valid = true
            let subdir: string | undefined

            if (trimmed.includes('git =')) {
                const gitMatch = trimmed.match(/git\s*=\s*"([^"]+)"/)
                if (gitMatch && !gitMatch[1].includes(ENDLESS_REPO)) {
                    issues.push({ dep: depName, issue: `Git URL doesn't match official repo (${ENDLESS_REPO})`, severity: 'error' })
                    valid = false
                }

                const subdirMatch = trimmed.match(/subdir\s*=\s*"([^"]+)"/)
                if (subdirMatch) {
                    subdir = subdirMatch[1]
                    if (!VALID_SUBDIRS.includes(subdir)) {
                        issues.push({ dep: depName, issue: `Invalid subdir "${subdir}". Valid: ${VALID_SUBDIRS.join(', ')}`, severity: 'error' })
                        valid = false
                    }
                } else {
                    issues.push({ dep: depName, issue: 'Missing subdir field', severity: 'warning' })
                    valid = false
                }

                if (!trimmed.includes('rev =')) {
                    issues.push({ dep: depName, issue: 'Missing rev field — pin to a version', severity: 'warning' })
                }
            }

            if (trimmed.includes('local =')) {
                issues.push({ dep: depName, issue: 'Local path dependency — won\'t work in CI', severity: 'warning' })
                valid = false
            }

            dependencies.push({ name: depName, valid, subdir })
        }
    }

    const errorCount = issues.filter(i => i.severity === 'error').length
    const warnCount = issues.filter(i => i.severity === 'warning').length
    const score = Math.max(0, 100 - errorCount * 25 - warnCount * 10)

    return { hasPackage, hasName, dependencies, issues, score }
}

export function MoveTomlValidator() {
    const [content, setContent] = useState('')
    const [result, setResult] = useState<ValidationResult | null>(null)

    function validate() {
        if (!content.trim()) return
        setResult(validateToml(content))
    }

    function loadSample() {
        setContent(SAMPLE_TOML)
        setResult(validateToml(SAMPLE_TOML))
    }

    function clear() {
        setContent('')
        setResult(null)
    }

    return (
        <div className="validator-card">
            <div className="validator-header">
                <span className="validator-icon">📄</span>
                <div>
                    <h3>Move.toml Validator</h3>
                    <p>Paste your Move.toml to validate Endless framework dependencies</p>
                </div>
            </div>

            <div className="validator-body">
                <div className="editor-area">
                    <div className="editor-toolbar">
                        <span className="editor-label">Move.toml</span>
                        <div className="editor-actions">
                            <button className="btn-ghost" onClick={loadSample}>Load Example</button>
                            <button className="btn-ghost" onClick={clear}>Clear</button>
                        </div>
                    </div>
                    <textarea
                        className="toml-editor"
                        value={content}
                        onChange={e => { setContent(e.target.value); setResult(null) }}
                        placeholder="[package]&#10;name = &quot;my_project&quot;&#10;&#10;[dependencies]&#10;EndlessFramework = { git = &quot;...&quot;, subdir = &quot;endless-framework&quot;, rev = &quot;main&quot; }"
                        spellCheck={false}
                        rows={10}
                    />
                    <button
                        className={`validate-btn ${!content.trim() ? 'disabled' : ''}`}
                        onClick={validate}
                        disabled={!content.trim()}
                    >
                        ▶ Validate
                    </button>
                </div>

                {result && (
                    <div className="validation-result">
                        {/* Score */}
                        <div className={`val-score ${result.score >= 90 ? 'green' : result.score >= 60 ? 'yellow' : 'red'}`}>
                            <span className="val-score-num">{result.score}</span>
                            <span className="val-score-label">/ 100</span>
                        </div>

                        {/* Package info */}
                        <div className="val-section">
                            <div className={`val-row ${result.hasPackage ? 'pass' : 'fail'}`}>
                                {result.hasPackage ? '✓' : '✗'} [package] section
                            </div>
                            <div className={`val-row ${result.hasName ? 'pass' : 'fail'}`}>
                                {result.hasName ? `✓ name = "${result.hasName}"` : '✗ name missing'}
                            </div>
                        </div>

                        {/* Dependencies */}
                        {result.dependencies.length > 0 && (
                            <div className="val-section">
                                <div className="val-section-title">Dependencies ({result.dependencies.length})</div>
                                {result.dependencies.map((dep, i) => (
                                    <div key={i} className={`val-row ${dep.valid ? 'pass' : 'fail'}`}>
                                        {dep.valid ? '✓' : '✗'} {dep.name}
                                        {dep.subdir && <span className="dep-subdir"> → {dep.subdir}</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Issues */}
                        {result.issues.length > 0 && (
                            <div className="val-section">
                                <div className="val-section-title">Issues ({result.issues.length})</div>
                                {result.issues.map((issue, i) => (
                                    <div key={i} className={`val-issue ${issue.severity}`}>
                                        <span>{issue.severity === 'error' ? '✗' : '⚠'}</span>
                                        <div>
                                            <strong>{issue.dep}</strong>: {issue.issue}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {result.issues.length === 0 && (
                            <div className="val-clean">✅ No issues found — Move.toml looks good!</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
