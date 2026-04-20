import { useState, useEffect, useCallback } from 'react'
import { fetchNodes, fetchLogs, getAnomalies, getSummaryStats } from '../utils/dataSimulator'

export function useSimulatedData(intervalMs = 2000) {
  const [nodes, setNodes] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [nodesData, logsData] = await Promise.all([
        fetchNodes(),
        fetchLogs(),
      ])

      if (nodesData.length > 0) {
        setNodes(nodesData)
        setConnected(true)
      } else {
        setConnected(false)
      }

      setLogs(logsData)
    } catch (err) {
      console.warn('[useLiveData] Fetch error:', err)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    
    refresh()

    
    const timer = setInterval(refresh, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs, refresh])

  const anomalies = getAnomalies(nodes)
  const stats = getSummaryStats(nodes)

  return { nodes, anomalies, logs, stats, loading, connected }
}
