import { useState, useEffect } from 'react'
import { fetchSystemStatus, triggerTraining } from '../utils/dataSimulator'
import {
  Wifi,
  WifiOff,
  BrainCircuit,
  Clock,
  Server,
  Activity,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Database,
  Shield,
  Zap,
  RefreshCw,
} from 'lucide-react'

function formatDateTime(iso) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function StatusIndicator({ connected, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
      <span className={`text-sm font-medium ${connected ? 'text-accent-green' : 'text-accent-red'}`}>{label}</span>
    </div>
  )
}

export default function SystemStatus({ nodes, stats }) {
  const [sysStatus, setSysStatus] = useState(null)
  const [training, setTraining] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await fetchSystemStatus()
      if (data) setSysStatus(data)
    }
    fetchStatus()
    const timer = setInterval(fetchStatus, 5000)
    return () => clearInterval(timer)
  }, [])

  const mqttConnected = sysStatus?.mqtt?.connected ?? false
  const modelTrained = sysStatus?.ml_model?.is_trained ?? false
  const lastUpdate = sysStatus?.last_update ?? null
  const totalReadings = sysStatus?.total_readings ?? 0
  const brokerHost = sysStatus?.mqtt?.broker_host ?? 'localhost'
  const brokerPort = sysStatus?.mqtt?.broker_port ?? 1883
  const mqttTopic = sysStatus?.mqtt?.topic ?? 'wsn/sensor/data'

  const handleTrain = async () => {
    setTraining(true)
    const result = await triggerTraining()
    if (result.model_info) {
      setSysStatus((prev) => prev ? { ...prev, ml_model: result.model_info } : prev)
    }
    setTraining(false)
  }

  return (
    <div className="page-enter space-y-6">
      {}
      <div>
        <h1 className="page-title">System Status</h1>
        <p className="text-sm text-text-secondary mt-1">Infrastructure health and connection monitoring</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mqttConnected ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
                {mqttConnected ? <Wifi className="w-6 h-6 text-accent-green" /> : <WifiOff className="w-6 h-6 text-accent-red" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">MQTT Broker</h3>
                <p className="text-[11px] text-text-muted">Message Queue Protocol</p>
              </div>
            </div>
            <StatusIndicator connected={mqttConnected} label={mqttConnected ? 'Connected' : 'Disconnected'} />
          </div>
          <div className="space-y-3 bg-surface-800/50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Protocol</span>
              <span className="text-text-primary font-mono">MQTT v3.1.1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Broker</span>
              <span className="text-text-primary font-mono">{brokerHost}:{brokerPort}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Topic</span>
              <span className="text-text-primary font-mono">{mqttTopic}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">QoS Level</span>
              <span className="text-text-primary font-mono">1</span>
            </div>
          </div>
        </div>

        {}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modelTrained ? 'bg-accent-purple/10' : 'bg-accent-amber/10'}`}>
                <BrainCircuit className={`w-6 h-6 ${modelTrained ? 'text-accent-purple' : 'text-accent-amber'}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">ML Model</h3>
                <p className="text-[11px] text-text-muted">Anomaly Detection Engine</p>
              </div>
            </div>
            <StatusIndicator connected={modelTrained} label={modelTrained ? 'Trained' : 'Not Trained'} />
          </div>
          <div className="space-y-3 bg-surface-800/50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Algorithm</span>
              <span className="text-text-primary font-mono">Isolation Forest</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Contamination</span>
              <span className="text-text-primary font-mono">0.08</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Features</span>
              <span className="text-text-primary font-mono">3 (T, H, G)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total Readings</span>
              <span className="text-text-primary font-mono">{totalReadings}</span>
            </div>
          </div>
          <button
            onClick={handleTrain}
            disabled={training}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-sm font-medium hover:bg-accent-purple/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
            {training ? 'Training...' : 'Train Model Now'}
          </button>
        </div>

        {}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Last Update</h3>
                <p className="text-[11px] text-text-muted">Most recent data ingestion</p>
              </div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${lastUpdate ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
          </div>
          <div className="space-y-3 bg-surface-800/50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Timestamp</span>
              <span className="text-text-primary font-mono text-xs">{formatDateTime(lastUpdate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Poll Interval</span>
              <span className="text-text-primary font-mono">2000ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total Readings</span>
              <span className="text-text-primary font-mono">{totalReadings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Active Nodes</span>
              <span className="text-text-primary font-mono">{nodes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div>
        <h2 className="section-title mb-4">Node Health Summary</h2>
        {nodes.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Cpu className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No sensor nodes registered yet. Start your ESP8266 nodes to see data here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map((node) => {
              const isAnomaly = node.status === 'anomaly'
              const anomaliesInHistory = node.history ? node.history.filter((r) => r.status === 'anomaly').length : 0
              const totalHistory = node.history ? node.history.length : 1
              const healthPct = Math.round(((totalHistory - anomaliesInHistory) / totalHistory) * 100)

              return (
                <div key={node.id || node.node_id} className="glass-card p-5 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAnomaly ? 'bg-accent-red/10' : 'bg-accent-green/10'}`}>
                        <Cpu className={`w-5 h-5 ${isAnomaly ? 'text-accent-red' : 'text-accent-green'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{node.name}</h3>
                        <p className="text-[10px] text-text-muted">{node.location}</p>
                      </div>
                    </div>
                    {isAnomaly ? (
                      <AlertTriangle className="w-5 h-5 text-accent-red animate-pulse" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-accent-green" />
                    )}
                  </div>

                  {}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-muted">Health Score</span>
                      <span className={`font-bold ${healthPct >= 80 ? 'text-accent-green' : healthPct >= 50 ? 'text-accent-amber' : 'text-accent-red'}`}>
                        {healthPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          healthPct >= 80 ? 'bg-accent-green' : healthPct >= 50 ? 'bg-accent-amber' : 'bg-accent-red'
                        }`}
                        style={{ width: `${healthPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-800/50 rounded-lg p-2 text-center">
                      <p className="text-text-muted">Normal</p>
                      <p className="text-text-primary font-bold">{totalHistory - anomaliesInHistory}</p>
                    </div>
                    <div className="bg-surface-800/50 rounded-lg p-2 text-center">
                      <p className="text-text-muted">Anomalies</p>
                      <p className="text-accent-red font-bold">{anomaliesInHistory}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-surface-800/50 rounded-xl p-4">
            <Server className="w-5 h-5 text-accent-cyan" />
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Platform</p>
              <p className="text-sm font-medium text-text-primary">NodeMCU / ESP8266</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-800/50 rounded-xl p-4">
            <Database className="w-5 h-5 text-accent-purple" />
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Backend</p>
              <p className="text-sm font-medium text-text-primary">Django + SQLite</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-800/50 rounded-xl p-4">
            <Shield className="w-5 h-5 text-accent-green" />
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Protocol</p>
              <p className="text-sm font-medium text-text-primary">MQTT + REST API</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-800/50 rounded-xl p-4">
            <Zap className="w-5 h-5 text-accent-amber" />
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Sensors</p>
              <p className="text-sm font-medium text-text-primary">DHT22 / MQ-2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
