import { useNavigate } from 'react-router-dom'
import {
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Activity,
  Cpu,
  Server,
  ShieldAlert,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null
  return (
    <div className="glass-card px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value mt-1" style={{ color }}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

function NodeCard({ node, onClick }) {
  const isAnomaly = node.status === 'anomaly'
  return (
    <button
      onClick={onClick}
      className={`glass-card-hover p-5 text-left w-full animate-slide-up ${
        isAnomaly ? 'border-accent-red/30 shadow-accent-red/5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAnomaly ? 'bg-accent-red/10' : 'bg-accent-cyan/10'
            }`}
          >
            <Cpu className={`w-5 h-5 ${isAnomaly ? 'text-accent-red' : 'text-accent-cyan'}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{node.name}</h3>
            <p className="text-[11px] text-text-muted">{node.location}</p>
          </div>
        </div>
        <span className={isAnomaly ? 'status-faulty' : 'status-normal'}>
          {isAnomaly ? 'Faulty' : 'Normal'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-800/60 rounded-xl p-3 text-center">
          <Thermometer className="w-4 h-4 text-accent-amber mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">{node.temperature}</p>
          <p className="text-[10px] text-text-muted">°C</p>
        </div>
        <div className="bg-surface-800/60 rounded-xl p-3 text-center">
          <Droplets className="w-4 h-4 text-accent-cyan mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">{node.humidity}</p>
          <p className="text-[10px] text-text-muted">%</p>
        </div>
        <div className="bg-surface-800/60 rounded-xl p-3 text-center">
          <Wind className="w-4 h-4 text-accent-purple mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">{node.gas}</p>
          <p className="text-[10px] text-text-muted">ppm</p>
        </div>
      </div>
    </button>
  )
}

function AnomalyCard({ anomaly }) {
  return (
    <div className="flex items-start gap-3 bg-accent-red/5 border border-accent-red/20 rounded-xl p-4 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShieldAlert className="w-4 h-4 text-accent-red" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-accent-red">{anomaly.nodeName}</p>
          <p className="text-[10px] text-text-muted font-mono">{formatTime(anomaly.timestamp)}</p>
        </div>
        <div className="flex gap-4 text-xs text-text-secondary">
          <span>Temp: <span className="text-text-primary font-medium">{anomaly.temperature}°C</span></span>
          <span>Hum: <span className="text-text-primary font-medium">{anomaly.humidity}%</span></span>
          <span>Gas: <span className="text-text-primary font-medium">{anomaly.gas} ppm</span></span>
        </div>
      </div>
    </div>
  )
}

const NODE_COLORS = ['#00d4ff', '#00e676', '#b388ff']

function ChartSection({ nodes, title, dataKey, unit }) {
  const firstNodeWithHistory = nodes.find(n => n.history && n.history.length > 0)
  if (!firstNodeWithHistory) return <div className="glass-card p-5 text-center text-text-secondary text-sm">No data available yet</div>

  const chartData = firstNodeWithHistory.history.map((_, i) => {
    const point = { time: formatTime(firstNodeWithHistory.history[i].timestamp) }
    nodes.forEach((node) => {
      point[node.name] = node.history?.[i]?.[dataKey] ?? 0
    })
    return point
  })

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1b243b" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#5a6380', fontSize: 10 }}
            axisLine={{ stroke: '#1b243b' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#5a6380', fontSize: 10 }}
            axisLine={{ stroke: '#1b243b' }}
            tickLine={false}
            unit={unit}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          {nodes.map((node, i) => (
            <Line
              key={node.node_id || node.id}
              type="monotone"
              dataKey={node.name}
              stroke={NODE_COLORS[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Dashboard({ nodes, anomalies, stats }) {
  const navigate = useNavigate()

  return (
    <div className="page-enter space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time sensor monitoring & anomaly detection</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span>Live — updating every 2s</span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Nodes" value={stats.total} icon={Server} color="#00d4ff" bgColor="bg-accent-cyan/10" />
        <SummaryCard title="Active Nodes" value={stats.active} icon={Activity} color="#00e676" bgColor="bg-accent-green/10" />
        <SummaryCard title="Faulty Nodes" value={stats.faulty} icon={AlertTriangle} color="#ff1744" bgColor="bg-accent-red/10" />
        <SummaryCard title="Healthy Nodes" value={stats.healthy} icon={ShieldAlert} color="#b388ff" bgColor="bg-accent-purple/10" />
      </div>

      {}
      <div>
        <h2 className="section-title mb-4">Sensor Nodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <NodeCard key={node.node_id || node.id} node={node} onClick={() => navigate(`/node/${node.node_id || node.id}`)} />
          ))}
        </div>
      </div>

      {}
      <div>
        <h2 className="section-title mb-4">Sensor Trends</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChartSection nodes={nodes} title="Temperature (°C)" dataKey="temperature" unit="°" />
          <ChartSection nodes={nodes} title="Humidity (%)" dataKey="humidity" unit="%" />
          <ChartSection nodes={nodes} title="Gas Level (ppm)" dataKey="gas" unit="" />
        </div>
      </div>

      {}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-accent-red" />
          <h2 className="section-title">Anomaly Detection Panel</h2>
          {anomalies.length > 0 && (
            <span className="bg-accent-red/10 text-accent-red text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
              {anomalies.length}
            </span>
          )}
        </div>
        {anomalies.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Activity className="w-10 h-10 text-accent-green mx-auto mb-3" />
            <p className="text-sm text-text-secondary">All systems normal — no anomalies detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.slice(0, 6).map((a, i) => (
              <AnomalyCard key={i} anomaly={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
