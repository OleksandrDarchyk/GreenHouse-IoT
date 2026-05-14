import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'

interface Rule {
    id: string
    label: string
    unit: string
    description: string
    defaultMin: number
    defaultMax: number
    min: number
    max: number
}

const RULES: Rule[] = [
    { id: 'temp',     label: 'Temperature',  unit: '°C',  description: 'Trigger ventilation outside this range', defaultMin: 18, defaultMax: 35, min: 0,  max: 60  },
    { id: 'humidity', label: 'Humidity',     unit: '%',   description: 'Trigger dehumidifier outside this range', defaultMin: 40, defaultMax: 80, min: 0,  max: 100 },
    { id: 'soil',     label: 'Soil Moisture',unit: '%',   description: 'Trigger irrigation below minimum',        defaultMin: 30, defaultMax: 80, min: 0,  max: 100 },
    { id: 'air',      label: 'Air Quality',  unit: 'PPM', description: 'Trigger ventilation above maximum',       defaultMin: 0,  defaultMax: 150, min: 0, max: 500 },
]

export default function AutomationPage() {
    const [values, setValues] = useState<Record<string, { min: number; max: number }>>(
        Object.fromEntries(RULES.map(r => [r.id, { min: r.defaultMin, max: r.defaultMax }]))
    )

    function update(id: string, field: 'min' | 'max', value: number) {
        setValues(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Automation Settings</h2>
                <span className={styles.subtitle}>Configure thresholds for automatic actions</span>
            </div>
            <div className={styles.list}>
                {RULES.map(r => (
                    <div key={r.id} className={styles.card}>
                        <div className={styles.ruleHeader}>
                            <h3 className={styles.cardTitle}>{r.label}</h3>
                            <span className={styles.tag}>{r.unit}</span>
                        </div>
                        <p className={styles.placeholder}>{r.description}</p>
                        <div className={styles.thresholds}>
                            <label className={styles.thresholdLabel}>
                                Min
                                <input
                                    type="number"
                                    className={styles.thresholdInput}
                                    value={values[r.id].min}
                                    min={r.min}
                                    max={r.max}
                                    onChange={e => update(r.id, 'min', Number(e.target.value))}
                                />
                                <span className={styles.unit}>{r.unit}</span>
                            </label>
                            <label className={styles.thresholdLabel}>
                                Max
                                <input
                                    type="number"
                                    className={styles.thresholdInput}
                                    value={values[r.id].max}
                                    min={r.min}
                                    max={r.max}
                                    onChange={e => update(r.id, 'max', Number(e.target.value))}
                                />
                                <span className={styles.unit}>{r.unit}</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
