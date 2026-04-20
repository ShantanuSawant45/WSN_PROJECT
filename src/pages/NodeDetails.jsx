import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  Cpu,
  MapPin,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
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

function StatCard({ icon: Icon, label, value, unit, color, bgColor }) {
  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="stat-label">{label}</p>
      </div>
      <p className="text-4xl font-bold text-text-primary">{value}<span className="text-lg text-text-secondary ml-1">{unit}</span></p>
    </div>
  )
}

function SensorChart({ data, dataKey, color, title, unit }) {
  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1b243b" />
          <XAxis dataKey="time" tick={{ fill: '#5a6380', fontSize: 10 }} axisLine={{ stroke: '#1b243b' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#5a6380', fontSize: 10 }} axisLine={{ stroke: '#1b243b' }} tickLine={false} unit={unit} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatusTimeline({ history }) {
  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Status Timeline</h3>
      <div className="flex items-center gap-1 flex-wrap">
        {history.map((reading, i) => (
          <div
            key={i}
            className="group relative"
          >
            <div
              className={`w-5 h-5 rounded-md transition-transform hover:scale-125 cursor-pointer ${
                reading.status === 'anomaly'
                  ? 'bg-accent-red shadow-sm shadow-accent-red/30'
                  : 'bg-accent-green/60'
              }`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="glass-card px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                <p className="text-text-muted">{formatTime(reading.timestamp)}</p>
                <p className={reading.status === 'anomaly' ? 'text-accent-red font-semibold' : 'text-accent-green'}>
                  {reading.status === 'anomaly' ? 'Anomaly' : 'Normal'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent-green/60" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent-red" />
          <span>Anomaly</span>
        </div>
        <span className="ml-auto">← Oldest | Newest →</span>
      </div>
    </div>
  )
}

export default function NodeDetails({ nodes }) {
  const { id } = useParams()
  const nodeId = parseInt(id)
  const node = nodes.find((n) => n.node_id === nodeId || n.id === nodeId)

  if (!node) {
    return (
      <div className="page-enter text-center py-20">
        <Cpu className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Node not found</h2>
        <Link to="/" className="text-accent-cyan hover:underline text-sm">← Back to Dashboard</Link>
      </div>
    )
  }

  const isAnomaly = node.status === 'anomaly'
  const history = node.history || []
  const chartData = history.map((r) => ({
    time: formatTime(r.timestamp),
    temperature: r.temperature,
    humidity: r.humidity,
    gas: r.gas,
  }))

  return (
    <div className="page-enter space-y-6">
      {}
      <div className="flex items-center gap-4">
        <Link to="/" className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center hover:bg-surface-600 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{node.name}</h1>
            <span className={isAnomaly ? 'status-faulty' : 'status-normal'}>
              {isAnomaly ? 'Faulty' : 'Normal'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{node.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDateTime(node.timestamp)}</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Thermometer} label="Temperature" value={node.temperature} unit="°C" color="#ffab00" bgColor="bg-accent-amber/10" />
        <StatCard icon={Droplets} label="Humidity" value={node.humidity} unit="%" color="#00d4ff" bgColor="bg-accent-cyan/10" />
        <StatCard icon={Wind} label="Gas Level" value={node.gas} unit="ppm" color="#b388ff" bgColor="bg-accent-purple/10" />
      </div>

      {}
      <div>
        <h2 className="section-title mb-4">Historical Data</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <SensorChart data={chartData} dataKey="temperature" color="#ffab00" title="Temperature" unit="°" />
          <SensorChart data={chartData} dataKey="humidity" color="#00d4ff" title="Humidity" unit="%" />
          <SensorChart data={chartData} dataKey="gas" color="#b388ff" title="Gas Level" unit="" />
        </div>
      </div>

      {}
      {history.length > 0 && <StatusTimeline history={history} />}
    </div>
  )
}
