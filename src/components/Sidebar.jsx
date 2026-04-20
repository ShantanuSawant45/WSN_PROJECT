import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  ScrollText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Radio,
  AlertTriangle,
  Wifi,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: ScrollText, label: 'Logs & History' },
  { to: '/system', icon: Activity, label: 'System Status' },
]

export default function Sidebar({ isOpen, onToggle, nodes }) {
  const location = useLocation()

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-surface-800 border-r border-surface-500/30 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-500/20">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-surface-800 animate-pulse" />
        </div>
        {isOpen && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-text-primary tracking-wide">WSN Monitor</h1>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">IoT Dashboard</p>
          </div>
        )}
      </div>

      {}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className={`mb-4 ${isOpen ? 'px-2' : 'px-0'}`}>
          {isOpen && (
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-widest mb-3">Navigation</p>
          )}
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-600/50'
                } ${!isOpen ? 'justify-center' : ''}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </div>

        {}
        <div className={`border-t border-surface-500/20 pt-4 ${isOpen ? 'px-2' : 'px-0'}`}>
          {isOpen && (
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-widest mb-3">Sensor Nodes</p>
          )}
          {nodes.map((node) => (
            <NavLink
              key={node.node_id || node.id}
              to={`/node/${node.node_id || node.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-600/80 text-text-primary border border-surface-500/40'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-600/50'
                } ${!isOpen ? 'justify-center' : ''}`
              }
            >
              <div className="relative flex-shrink-0">
                <Cpu className="w-5 h-5" />
                <div
                  className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-800 ${
                    node.status === 'anomaly' ? 'bg-accent-red animate-pulse' : 'bg-accent-green'
                  }`}
                />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{node.name}</p>
                  <p className="text-[10px] text-text-muted truncate">{node.location}</p>
                </div>
              )}
              {isOpen && node.status === 'anomaly' && (
                <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0 animate-pulse" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-4 border-t border-surface-500/20 text-text-muted hover:text-text-primary transition-colors"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </aside>
  )
}
