import { useState, useEffect } from 'react'
import { BASE_URL } from '@config/api'

export interface AlertRecord {
    id:         string
    deviceId:   string
    severity:   string
    message:    string
    isResolved: boolean
    createdAt:  string
    resolvedAt: string | null
}

export function useAlerts(take = 50) {
    const [alerts,  setAlerts]  = useState<AlertRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                // trigger device check first so alerts are up to date
                await fetch(`${BASE_URL}/api/Device/check`)

                const res = await fetch(`${BASE_URL}/api/Alert?take=${take}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json() as AlertRecord[]
                if (mounted) setAlerts(data)
            } catch (err: unknown) {
                if (mounted) setError(err instanceof Error ? err.message : 'Failed to load alerts')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [take])

    return { alerts, loading, error }
}
