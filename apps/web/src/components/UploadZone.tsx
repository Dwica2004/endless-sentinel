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

    const handleDragLeave = () => {
        setIsDragging(false)
    }

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
        if (file) {
            setError(null)
            onFileUpload(file)
        }
    }

    return (
        <div className="upload-container">
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
                <p className="local-note">
                    🔒 Local-only viewer — no files are sent to any server.
                </p>

                <label className="file-label">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="file-input"
                    />
                    <span className="file-btn">Open Report File</span>
                </label>

                {onDemo && (
                    <button className="demo-btn" onClick={onDemo}>
                        ✨ Try Demo
                    </button>
                )}

                {error && <p className="upload-error">⚠ {error}</p>}
            </div>

            <div className="feature-highlights">
                <div className="feature-item">
                    <span className="feature-icon">🌐</span>
                    <div>
                        <strong>Live RPC Probe</strong>
                        <p>Actually pings the Endless network — returns chain_id, epoch, block height</p>
                    </div>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">📄</span>
                    <div>
                        <strong>Move.toml Validator</strong>
                        <p>Validates dependencies against endless-labs/endless-move-framework</p>
                    </div>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div>
                        <strong>Health Score</strong>
                        <p>Weighted 0–100 score + letter grade per project</p>
                    </div>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <div>
                        <strong>Security Scanner v2</strong>
                        <p>Comment-aware Move vulnerability detection</p>
                    </div>
                </div>
            </div>

            <div className="instructions">
                <h3>How to generate a report</h3>
                <ol>
                    <li>
                        Clone &amp; build: <code>git clone https://github.com/Dwica2004/endless-sentinel.git</code>
                    </li>
                    <li>
                        <code>cd endless-sentinel/apps/cli &amp;&amp; npm install &amp;&amp; npm run build</code>
                    </li>
                    <li>
                        Navigate to your project: <code>cd /path/to/your-endless-project</code>
                    </li>
                    <li>
                        Run: <code>node dist/apps/cli/bin/sentinel.js --json</code>
                    </li>
                    <li>
                        Upload the generated <code>sentinel-report.json</code> here
                    </li>
                </ol>
                <div className="local-emphasis">
                    <strong>⚡ 24 checks</strong> across environment, network (live), Move contracts, security analysis, and more.
                </div>
            </div>
        </div>
    )
}
