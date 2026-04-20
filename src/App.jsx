import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NodeDetails from './pages/NodeDetails'
import Logs from './pages/Logs'
import SystemStatus from './pages/SystemStatus'
import { useSimulatedData } from './hooks/useSimulatedData'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { nodes, anomalies, logs, stats, loading, connected } = useSimulatedData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-900">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-1">Connecting to WSN Backend</h2>
          <p className="text-sm text-text-secondary">Fetching sensor data from Django API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} nodes={nodes} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {}
        {!connected && nodes.length === 0 && (
          <div className="bg-accent-amber/10 border-b border-accent-amber/20 px-6 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
            <p className="text-sm text-accent-amber">
              Backend not connected — no sensor data available. Start Django server and MQTT subscriber.
            </p>
          </div>
        )}
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard nodes={nodes} anomalies={anomalies} stats={stats} />} />
            <Route path="/node/:id" element={<NodeDetails nodes={nodes} />} />
            <Route path="/logs" element={<Logs logs={logs} />} />
            <Route path="/system" element={<SystemStatus nodes={nodes} stats={stats} />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
