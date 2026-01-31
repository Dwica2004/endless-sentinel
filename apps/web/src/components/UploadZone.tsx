import { useState } from 'react'
import './UploadZone.css'

interface UploadZoneProps {
    onFileUpload: (file: File) => void
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false)

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
            onFileUpload(file)
        } else {
            alert('Please select a .json report file')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
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
                <div className="upload-icon">📊</div>
                <h2>View Your Local Sentinel Report</h2>
                <p className="subtitle">
                    Open the <code>sentinel-report.json</code> generated from your project
                </p>
                <p className="local-note">
                    Sentinel runs locally in your project directory. This viewer never scans files remotely.
                </p>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="file-input"
                />
            </div>

            <div className="instructions">
                <h3>Generate a Local Sentinel Report</h3>
                <p className="instructions-intro">
                    Run Sentinel inside your project directory to inspect your development environment:
                </p>
                <ol>
                    <li>
                        Navigate to your project: <code>cd /path/to/your/project</code>
                    </li>
                    <li>
                        Run Sentinel locally: <code>node path/to/sentinel.js --json</code>
                    </li>
                    <li>
                        A report file (<code>sentinel-report.json</code>) will be created in your project
                    </li>
                    <li>
                        Open the report file here to view the inspection results
                    </li>
                </ol>
                <div className="local-emphasis">
                    <strong>⚡ Local-first design:</strong> All checks run on your machine.
                    No data is sent to external servers.
                </div>
            </div>
        </div>
    )
}
