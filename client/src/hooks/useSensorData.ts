import { useState, useEffect } from 'react'
import { BASE_URL, SSE_URL } from '../config/api'

export type SensorStatus = 'normal' | 'good' | 'warning' | 'poor' | 'critical'

export interface SensorReading {
    value: number
    unit: string
    status: SensorStatus
    label: string
    icon: string
    color: string
    barPct: number
}

export interface SensorData {
    temperature: SensorReading
    humidity: SensorReading
    soilMoisture: SensorReading
    lightLevel: SensorReading
}

interface BackendReading {
    temperature: number
    humidity: number
    soilMoisture: number
    lightLevel: number
}

function tempStatus(v: number): SensorStatus {
    return v > 40 ? 'critical' : v > 35 ? 'warning' : 'normal'
}
function humStatus(v: number): SensorStatus {
    return v < 30 || v > 90 ? 'critical' : v < 40 || v > 80 ? 'warning' : 'normal'
}
function soilStatus(v: number): SensorStatus {
    return v < 20 ? 'critical' : v < 30 ? 'warning' : 'good'
}
function lightStatus(v: number): SensorStatus {
    return v < 100 || v > 800 ? 'warning' : 'normal'
}

function buildReading(key: keyof SensorData, value: number): SensorReading {
    const configs = {
        temperature:  { unit: '°C',  label: 'Temperature',  icon: '🌡', color: '#f87171', status: tempStatus(value),  barPct: Math.min((value / 50) * 100, 100) },
        humidity:     { unit: '%',   label: 'Humidity',     icon: '💧', color: '#60a5fa', status: humStatus(value),   barPct: Math.min(value, 100) },
        soilMoisture: { unit: '%',   label: 'Soil Moisture',icon: '🌱', color: '#fbbf24', status: soilStatus(value),  barPct: Math.min(value, 100) },
        lightLevel:   { unit: 'lux', label: 'Light Level',  icon: '☀️', color: '#facc15', status: lightStatus(value), barPct: Math.min((value / 900) * 100, 100) },
    }
    return { value, ...configs[key] }
}

function mapToSensorData(raw: BackendReading): SensorData {
    return {
        temperature:  buildReading('temperature',  raw.temperature),
        humidity:     buildReading('humidity',      raw.humidity),
        soilMoisture: buildReading('soilMoisture',  raw.soilMoisture),
        lightLevel:   buildReading('lightLevel',    raw.lightLevel),
    }
}

export function useSensorData(deviceId?: string) {
    const [data, setData] = useState<SensorData | null>(null)

    useEffect(() => {
        const es = new EventSource(SSE_URL)

        es.onmessage = async (e) => {
            const { connectionId } = JSON.parse(e.data)

            const params = new URLSearchParams({ connectionId })
            if (deviceId) params.set('deviceId', deviceId)

            const res = await fetch(
                `${BASE_URL}/api/SensorReading/GetSensorReadingLatest?${params}`
            )
            if (!res.ok) return

            const { group, data: value } = await res.json()  // ← fix here
            if (value) setData(mapToSensorData(value))

            es.addEventListener(group, (upd: MessageEvent) => {
                try {
                    const raw = JSON.parse(upd.data)
                    if (raw) setData(mapToSensorData(raw))
                } catch { /* ignore */ }
            })
        }

        es.onerror = () => es.close()

        return () => es.close()
    }, [deviceId])

    return data
}