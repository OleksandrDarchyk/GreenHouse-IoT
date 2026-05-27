import { useState, useEffect } from 'react'
import { BASE_URL } from '@config/api'

export interface DeviceStatus {
    deviceId: string
    lastSeen: string
    isOnline: boolean
}

export function useDeviceStatus() {
    const [devices,  setDevices]  = useState<DeviceStatus[]>([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                const res = await fetch(`${BASE_URL}/api/Device/status`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json() as DeviceStatus[]
                if (mounted) setDevices(data)
            } catch (err: unknown) {
                if (mounted) setError(err instanceof Error ? err.message : 'Failed to load')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [])

    return { devices, loading, error }
}
