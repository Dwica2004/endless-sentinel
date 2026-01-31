import { useState } from 'react'
import type { Report } from '../../../shared/schema'
import { ReportView } from './components/ReportView'
import { UploadZone } from './components/UploadZone'
import './App.css'

function App() {
    const [report, setReport] = useState<Report | null>(null)

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                setReport(json)
            } catch (error) {
                alert('Invalid JSON file')
            }
        }
        reader.readAsText(file)
    }

    const handleReset = () => {
        setReport(null)
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <img src="/logo.svg" alt="Endless Sentinel" className="logo-icon" />
                        <h1>Endless Sentinel</h1>
                    </div>
                    <p className="tagline">Local Project Health Inspector • Report Viewer</p>
                </div>
            </header>

            <main className="app-main">
                {!report ? (
                    <UploadZone onFileUpload={handleFileUpload} />
                ) : (
                    <ReportView report={report} onReset={handleReset} />
                )}
            </main>

            <footer className="app-footer">
                <p>Built for developers, by developers.</p>
            </footer>
        </div>
    )
}

export default App
