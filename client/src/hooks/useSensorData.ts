import { useState, useEffect } from 'react'

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
    airQuality: SensorReading
    lightLevel: SensorReading
}

function drift(v: number, center: number, range: number, speed = 0.3) {
    return Math.min(Math.max(v + (Math.random() - 0.5) * speed + (center - v) * 0.02, center - range), center + range)
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
function airStatus(v: number): SensorStatus {
    return v > 200 ? 'critical' : v > 150 ? 'poor' : v > 100 ? 'warning' : 'normal'
}
function lightStatus(v: number): SensorStatus {
    return v < 100 || v > 800 ? 'warning' : 'normal'
}

function buildReading(key: keyof SensorData, value: number): SensorReading {
    const configs = {
        temperature:  { unit: '°C',  label: 'Temperature',  icon: '🌡', color: '#f87171', status: tempStatus(value),  barPct: Math.min((value / 50) * 100, 100) },
        humidity:     { unit: '%',   label: 'Humidity',      icon: '💧', color: '#60a5fa', status: humStatus(value),   barPct: Math.min(value, 100) },
        soilMoisture: { unit: '%',   label: 'Soil Moisture', icon: '🌱', color: '#fbbf24', status: soilStatus(value),  barPct: Math.min(value, 100) },
        airQuality:   { unit: 'PPM', label: 'Air Quality',   icon: '🌬', color: '#c084fc', status: airStatus(value),   barPct: Math.min((value / 250) * 100, 100) },
        lightLevel:   { unit: 'lux', label: 'Light Level',   icon: '☀️', color: '#facc15', status: lightStatus(value), barPct: Math.min((value / 900) * 100, 100) },
    }
    return { value, ...configs[key] }
}

let _temp = 29.4, _hum = 55.4, _soil = 32, _air = 157.7, _light = 412.9

function generateSensorData(): SensorData {
    _temp  = drift(_temp,  29,  6)
    _hum   = drift(_hum,   55, 15)
    _soil  = drift(_soil,  35, 20, 0.8)
    _air   = drift(_air,  140, 60, 2)
    _light = drift(_light,400,150, 5)

    return {
        temperature:  buildReading('temperature',  +_temp.toFixed(1)),
        humidity:     buildReading('humidity',      +_hum.toFixed(1)),
        soilMoisture: buildReading('soilMoisture',  +_soil.toFixed(1)),
        airQuality:   buildReading('airQuality',    +_air.toFixed(1)),
        lightLevel:   buildReading('lightLevel',    +_light.toFixed(1)),
    }
}

export function useSensorData(intervalMs = 2000) {
    const [data, setData] = useState<SensorData>(generateSensorData)

    useEffect(() => {
        // TODO: Replace with real WebSocket:
        // const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/sensors`)
        // ws.onmessage = e => setData(JSON.parse(e.data))
        // return () => ws.close()

        const id = setInterval(() => setData(generateSensorData()), intervalMs)
        return () => clearInterval(id)
    }, [intervalMs])

    return data
}