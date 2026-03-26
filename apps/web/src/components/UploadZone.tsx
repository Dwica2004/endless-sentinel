import { useState } from 'react'
import './UploadZone.css'

interface UploadZoneProps {
    onFileUpload: (file: File) => void
    onDemo?: () => void
}

export function UploadZone({ onFileUpload, onDemo }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.name.endsWith('.json')) {
            setError(null)
            onFileUpload(file)
        } else {
            setError('Please drop a valid .json report file')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { setError(null); onFileUpload(file) }
    }

    return (
        <div className="upload-container">

            {/* ── LEFT: Drop Zone ── */}
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="upload-icon">
                    <img src="/logo.png" alt="Endless Sentinel" className="upload-logo" />
                </div>

                <h2>Endless Sentinel <span className="version-tag">v2.0.0</span></h2>

                <p className="subtitle">
                    Drop your <code>sentinel-report.json</code> here to view results
                </p>
                <p className="local-note">🔒 Local-only viewer — no files are sent to any server.</p>

                <div className="upload-actions">
                    <label className="file-label">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="file-input"
                        />
                        <span className="file-btn">📂 Open Report File</span>
                    </label>

                    {onDemo && (
                        <button className="demo-btn" onClick={onDemo}>
                            ✨ Try Demo
                        </button>
                    )}
                </div>

                {error && <p className="upload-error">⚠ {error}</p>}
            </div>

            {/* ── RIGHT: Info Panel ── */}
            <div className="upload-right-panel">
                {/* Feature cards */}
                <div className="feature-highlights">
                    {[
                        { icon: '🌐', title: 'Live RPC Probe', desc: 'Pings the Endless network — returns chain_id, epoch, block height, response time' },
                        { icon: '📄', title: 'Move.toml Validator', desc: 'Deep-validates deps against endless-labs/endless-move-framework' },
                        { icon: '📊', title: 'Health Score', desc: 'Weighted 0–100 score + letter grade A–F across 7 categories' },
                        { icon: '🔒', title: 'Security Scanner v2', desc: 'Comment-aware Move vulnerability detection — 8 pattern types' },
                    ].map(f => (
                        <div key={f.title} className="feature-item">
                            <span className="feature-icon">{f.icon}</span>
                            <div>
                                <strong>{f.title}</strong>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instructions */}
                <div className="instructions">
                    <h3>📋 How to generate a report</h3>
                    <ol>
                        <li>Clone: <code>git clone https://github.com/Dwica2004/endless-sentinel.git</code></li>
                        <li>Build: <code>cd endless-sentinel/apps/cli && npm install && npm run build</code></li>
                        <li>Go to your project: <code>cd /your-endless-project</code></li>
                        <li>Run: <code>node .../sentinel.js --json</code></li>
                        <li>Upload the generated <code>sentinel-report.json</code> here ↑</li>
                    </ol>
                    <div className="local-emphasis">
                        <strong>⚡ 24 automated checks</strong> — environment, live RPC, Move contracts, security, CLI readiness, and more.
                    </div>
                </div>
            </div>

        </div>
    )
}
