import { useState, useEffect } from 'react'
import { BASE_URL } from '@config/api'

export type Range = '10m' | '1h' | '24h'

export type MetricKey = 'temperature' | 'humidity' | 'soilMoisture' | 'airQuality' | 'lightLevel'

export interface SensorPoint {
    timestamp:   string
    temperature:  number
    humidity:     number
    soilMoisture: number
    airQuality:   number
    lightLevel:   number
}

const RANGE_MS: Record<Range, number> = {
    '10m': 10   * 60 * 1000,
    '1h':  60   * 60 * 1000,
    '24h': 1440 * 60 * 1000,
}

const RANGE_LIMIT: Record<Range, number> = {
    '10m': 200,
    '1h':  600,
    '24h': 2000,
}

export function useSensorHistory(range: Range, deviceId?: string) {
    const [points, setPoints]   = useState<SensorPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        const from = new Date(Date.now() - RANGE_MS[range]).toISOString()
        const params = new URLSearchParams({ take: String(RANGE_LIMIT[range]), from })
        if (deviceId) params.set('deviceId', deviceId)

        fetch(`${BASE_URL}/api/SensorReading/GetSensorReadings?${params}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json() as Promise<SensorPoint[]>
            })
            .then(data => { if (!cancelled) setPoints(data) })
            .catch((err: unknown) => {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : 'Failed to load data')
            })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [range, deviceId])

    return { points, loading, error }
}
