import { useState, useEffect } from 'react'
import { BASE_URL } from '@config/api'

export interface ActuatorStatus {
    name:         string
    type:         string
    state:        string
    on:           boolean
    mode:         string
    controllable: boolean
}

export interface DeviceOverview {
    deviceId:  string
    online:    boolean
    lastSeen:  string
    actuators: ActuatorStatus[]
}

export function useDeviceOverview() {
    const [overview, setOverview] = useState<DeviceOverview[]>([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                const res = await fetch(`${BASE_URL}/api/Device/overview`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json() as DeviceOverview[]
                if (mounted) {
                    setOverview(data)
                    setError(null)
                }
            } catch (err: unknown) {
                if (mounted) setError(err instanceof Error ? err.message : 'Failed to load')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        const interval = setInterval(load, 5000)

        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [])

    return { overview, loading, error }
}
