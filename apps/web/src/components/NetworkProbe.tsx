import { useState } from 'react'
import './NetworkProbe.css'

const NETWORKS: Array<{ id: string; label: string; url: string }> = [
    { id: 'testnet', label: 'Testnet', url: 'https://rpc-testnet.endless.link/v1' },
    { id: 'mainnet', label: 'Mainnet', url: 'https://rpc.endless.link/v1' },
    { id: 'devnet', label: 'Devnet', url: 'https://rpc-devnet.endless.link/v1' }
]

interface ProbeResult {
    network: string
    url: string
    status: 'pass' | 'warn' | 'fail'
    responseTime: number
    chainId?: string | number
    epoch?: string | number
    blockHeight?: string | number
    ledgerVersion?: string | number
    error?: string
}

export function NetworkProbe() {
    const [selected, setSelected] = useState('testnet')
    const [result, setResult] = useState<ProbeResult | null>(null)
    const [loading, setLoading] = useState(false)

    async function probe() {
        const net = NETWORKS.find(n => n.id === selected)!
        setLoading(true)
        setResult(null)

        const start = Date.now()
        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 8000)

            const res = await fetch(net.url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal
            })
            clearTimeout(timeout)
            const elapsed = Date.now() - start

            if (!res.ok) {
                setResult({
                    network: net.id, url: net.url,
                    status: 'fail', responseTime: elapsed,
                    error: `HTTP ${res.status} ${res.statusText}`
                })
                return
            }

            const data = await res.json() as Record<string, any>
            const elapsed2 = Date.now() - start

            setResult({
                network: net.id, url: net.url,
                status: elapsed2 > 3000 ? 'warn' : 'pass',
                responseTime: elapsed2,
                chainId: data.chain_id,
                epoch: data.epoch,
                blockHeight: data.block_height,
                ledgerVersion: data.ledger_version
            })
        } catch (err: any) {
            setResult({
                network: net.id, url: net.url,
                status: 'fail', responseTime: Date.now() - start,
                error: err.name === 'AbortError' ? 'Request timed out (8s)' : err.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="probe-card">
            <div className="probe-header">
                <span className="probe-icon">🌐</span>
                <div>
                    <h3>Live RPC Probe</h3>
                    <p>Test Endless network connectivity directly from your browser</p>
                </div>
            </div>

            <div className="probe-controls">
                <div className="network-tabs">
                    {NETWORKS.map(n => (
                        <button
                            key={n.id}
                            className={`net-tab ${selected === n.id ? 'active' : ''}`}
                            onClick={() => { setSelected(n.id); setResult(null) }}
                        >
                            {n.label}
                        </button>
                    ))}
                </div>
                <button
                    className={`probe-btn ${loading ? 'loading' : ''}`}
                    onClick={probe}
                    disabled={loading}
                >
                    {loading ? '⏳ Probing...' : '▶ Run Probe'}
                </button>
            </div>

            {result && (
                <div className={`probe-result status-${result.status}`}>
                    <div className="result-status">
                        <span className="result-icon">
                            {result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'}
                        </span>
                        <span className="result-label">
                            {result.status === 'fail'
                                ? `Cannot reach ${result.network}`
                                : `${result.network} is LIVE`}
                        </span>
                        <span className="result-time">{result.responseTime}ms</span>
                    </div>

                    {result.error ? (
                        <div className="result-error">{result.error}</div>
                    ) : (
                        <div className="result-grid">
                            {result.chainId && <div className="result-stat"><span>chain_id</span><strong>{result.chainId}</strong></div>}
                            {result.epoch && <div className="result-stat"><span>epoch</span><strong>{result.epoch}</strong></div>}
                            {result.blockHeight && <div className="result-stat"><span>block</span><strong>{Number(result.blockHeight).toLocaleString()}</strong></div>}
                            {result.ledgerVersion && <div className="result-stat"><span>ledger_v</span><strong>{Number(result.ledgerVersion).toLocaleString()}</strong></div>}
                        </div>
                    )}

                    <div className="result-url">{result.url}</div>
                </div>
            )}

            {!result && !loading && (
                <div className="probe-hint">
                    Select a network and click <strong>Run Probe</strong> to test connectivity
                </div>
            )}
        </div>
    )
}
