import { useState, useMemo } from 'react'
import { ScrollText, Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react'

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function Logs({ logs }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') 

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const nodeName = log.node_name || log.nodeName || ''
      const nodeId = log.node_id || log.nodeId || ''
      const matchesSearch =
        search === '' ||
        nodeName.toLowerCase().includes(search.toLowerCase()) ||
        nodeId.toString().includes(search)
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [logs, search, statusFilter])

  const anomalyCount = logs.filter((l) => l.status === 'anomaly').length

  return (
    <div className="page-enter space-y-6">
      {}
      <div>
        <h1 className="page-title">Logs & History</h1>
        <p className="text-sm text-text-secondary mt-1">Complete sensor reading history with anomaly tracking</p>
      </div>

      {}
      <div className="flex flex-wrap items-center gap-4">
        <div className="glass-card px-4 py-2.5 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-accent-cyan" />
          <span className="text-sm text-text-secondary">Total Readings:</span>
          <span className="text-sm font-bold text-text-primary">{logs.length}</span>
        </div>
        <div className="glass-card px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-red" />
          <span className="text-sm text-text-secondary">Anomalies:</span>
          <span className="text-sm font-bold text-accent-red">{anomalyCount}</span>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by node name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-700 border border-surface-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'normal', 'anomaly'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                statusFilter === filter
                  ? filter === 'anomaly'
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                    : filter === 'normal'
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                    : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-surface-700 text-text-secondary border border-surface-500/30 hover:border-surface-500/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-500/20">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Node</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Temp (°C)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Humidity (%)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Gas (ppm)</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((log, i) => {
                const isAnomaly = log.status === 'anomaly'
                return (
                  <tr
                    key={i}
                    className={`border-b border-surface-500/10 transition-colors ${
                      isAnomaly
                        ? 'bg-accent-red/[0.03] hover:bg-accent-red/[0.06]'
                        : 'hover:bg-surface-600/30'
                    }`}
                  >
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{log.node_name || log.nodeName}</p>
                        <p className="text-[10px] text-text-muted">{log.location}</p>
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-sm font-mono text-right ${isAnomaly ? 'text-accent-red font-bold' : 'text-text-primary'}`}>
                      {log.temperature}
                    </td>
                    <td className={`px-5 py-3 text-sm font-mono text-right ${isAnomaly ? 'text-accent-red font-bold' : 'text-text-primary'}`}>
                      {log.humidity}
                    </td>
                    <td className={`px-5 py-3 text-sm font-mono text-right ${isAnomaly ? 'text-accent-red font-bold' : 'text-text-primary'}`}>
                      {log.gas}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {isAnomaly ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-red">
                          <AlertTriangle className="w-3.5 h-3.5" /> Anomaly
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-green">
                          <CheckCircle className="w-3.5 h-3.5" /> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No logs match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
