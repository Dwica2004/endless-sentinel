import { useState } from 'react'
import type { Report } from '../../../shared/schema'
import { ReportView } from './components/ReportView'
import { UploadZone } from './components/UploadZone'
import { NetworkProbe } from './components/NetworkProbe'
import { MoveTomlValidator } from './components/MoveTomlValidator'
import './App.css'

type Tab = 'report' | 'probe' | 'validator'

function App() {
    const [report, setReport] = useState<Report | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>('report')

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                setReport(json)
                setActiveTab('report')
            } catch {
                alert('Invalid JSON file. Please select a valid sentinel-report.json')
            }
        }
        reader.readAsText(file)
    }

    const handleDemo = async () => {
        try {
            const res = await fetch('/demo-report.json')
            const json = await res.json()
            setReport(json)
            setActiveTab('report')
        } catch {
            alert('Could not load demo report')
        }
    }

    const handleReset = () => setReport(null)

    const TABS: Array<{ id: Tab; label: string; icon: string }> = [
        { id: 'report', label: 'Report Viewer', icon: '📊' },
        { id: 'probe', label: 'RPC Probe', icon: '🌐' },
        { id: 'validator', label: 'Move.toml', icon: '📄' }
    ]

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <img src="/logo.png" alt="Endless Sentinel" className="logo-icon" />
                        <h1>Endless Sentinel</h1>
                    </div>
                    <p className="tagline">Local Project Health Inspector • Developer Tools</p>
                </div>

                {/* Tab navigation */}
                <nav className="tab-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="app-main">
                {activeTab === 'report' && (
                    !report ? (
                        <UploadZone
                            onFileUpload={handleFileUpload}
                            onDemo={handleDemo}
                        />
                    ) : (
                        <ReportView report={report} onReset={handleReset} />
                    )
                )}

                {activeTab === 'probe' && (
                    <div className="tools-page">
                        <div className="tools-header">
                            <h2>Live RPC Probe</h2>
                            <p>Test Endless network connectivity directly from your browser — no CLI needed.</p>
                        </div>
                        <NetworkProbe />
                    </div>
                )}

                {activeTab === 'validator' && (
                    <div className="tools-page">
                        <div className="tools-header">
                            <h2>Move.toml Validator</h2>
                            <p>Paste your Move.toml to validate dependencies against the Endless framework — no CLI needed.</p>
                        </div>
                        <MoveTomlValidator />
                    </div>
                )}
            </main>

            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="Endless Sentinel" className="footer-logo" />
                            <div>
                                <h3>Endless Sentinel</h3>
                                <p>Developer Health Inspector</p>
                            </div>
                        </div>
                        <p className="footer-tagline">
                            Built for developers, by developers. 🛡️
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Resources</h4>
                        <div className="footer-links">
                            <a href="https://github.com/Dwica2004/endless-sentinel" target="_blank" rel="noopener noreferrer">
                                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub Repository
                            </a>
                            <a href="https://docs.endless.link" target="_blank" rel="noopener noreferrer">
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Documentation
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Creator</h4>
                        <div className="creator-info">
                            <a href="https://github.com/Dwica2004" target="_blank" rel="noopener noreferrer" className="creator-link">
                                <div className="creator-avatar">D</div>
                                <div className="creator-details">
                                    <span className="creator-name">Dwica2004</span>
                                    <span className="creator-role">Endless Developer</span>
                                </div>
                            </a>
                        </div>
                        <p className="footer-license">
                            MIT License • Open Source
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Endless Sentinel <strong>v2.0.0</strong> · Live RPC Probe · Health Score · Move.toml Validator · Built for the <a href="https://endless.link" target="_blank" rel="noopener noreferrer">Endless</a> community.</p>
                </div>
            </footer>
        </div>
    )
}

export default App
