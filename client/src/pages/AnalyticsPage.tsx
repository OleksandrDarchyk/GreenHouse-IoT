import { useMemo, useState } from 'react'
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useSensorHistory, type Range, type MetricKey, type SensorPoint } from '../hooks/useSensorHistory'
import styles from './DashboardContent.module.css'

const METRICS: { key: MetricKey; label: string; unit: string; color: string }[] = [
    { key: 'temperature',  label: 'Temperature',  unit: '°C',  color: '#f87171' },
    { key: 'humidity',     label: 'Humidity',     unit: '%',   color: '#60a5fa' },
    { key: 'soilMoisture', label: 'Soil Moisture',unit: '%',   color: '#4ade80' },
    { key: 'lightLevel',   label: 'Light Level',  unit: 'lux', color: '#facc15' },
]

const RANGES: Range[] = ['10m', '1h', '24h']

function hhmmss(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

export default function AnalyticsPage() {
    const [range,  setRange]  = useState<Range>('1h')
    const [metric, setMetric] = useState<MetricKey>('temperature')

    const { points, loading, error } = useSensorHistory(range)

    const meta = METRICS.find(m => m.key === metric)!

    const chartData = useMemo(() => {
        const seen = new Set<string>()
        return points
            .filter(p => {
                if (seen.has(p.timestamp)) return false
                seen.add(p.timestamp)
                return true
            })
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            .map((p: SensorPoint) => ({ time: hhmmss(p.timestamp), value: p[metric] }))
    }, [points, metric])

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Historical Data</h2>
            </div>

            <div className={styles.chartControls}>
                <select
                    className={styles.metricSelect}
                    value={metric}
                    onChange={e => setMetric(e.target.value as MetricKey)}
                >
                    {METRICS.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                </select>

                <div className={styles.rangeBtns}>
                    {RANGES.map(r => (
                        <button
                            key={r}
                            className={`${styles.rangeBtn} ${range === r ? styles.rangeActive : ''}`}
                            onClick={() => setRange(r)}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className={styles.stateMsg}>Loading…</p>}
            {!loading && error && <p className={styles.stateMsgError}>Error: {error}</p>}
            {!loading && !error && chartData.length === 0 && (
                <p className={styles.stateMsg}>No data available for this range yet.</p>
            )}

            {!loading && !error && chartData.length > 0 && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        {meta.label}
                        <span className={styles.unitTag}>{meta.unit}</span>
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} interval="preserveStartEnd" />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                domain={[
                                    (min: number) => Math.floor(min - 1),
                                    (max: number) => Math.ceil(max + 1),
                                ]}
                            />
                            <Tooltip
                                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                                formatter={(v) => [`${v} ${meta.unit}`, meta.label]}
                            />
                            <Line type="monotone" dataKey="value" stroke={meta.color} dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </DashboardLayout>
    )
}
