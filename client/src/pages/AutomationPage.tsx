import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'
import { api } from '../api/api'
import { CommandDtoRequest } from '../api/generated/generated-ts-client'

interface Rule {
    id: string
    label: string
    unit: string
    description: string
    defaultMin: number
    defaultMax: number
    min: number
    max: number
    /** deviceId + action to send when "Apply" is clicked; undefined = no automation command */
    automation?: { deviceId: string; action: string }
}

const RULES: Rule[] = [
    { id: 'temp',     label: 'Temperature',  unit: '°C',  description: 'Trigger ventilation outside this range', defaultMin: 18, defaultMax: 35, min: 0,  max: 60,  automation: { deviceId: 'esp32-01', action: 'fan' } },
    { id: 'humidity', label: 'Humidity',     unit: '%',   description: 'Trigger dehumidifier outside this range', defaultMin: 40, defaultMax: 80, min: 0,  max: 100 },
    { id: 'soil',     label: 'Soil Moisture',unit: '%',   description: 'Trigger irrigation below minimum',        defaultMin: 30, defaultMax: 80, min: 0,  max: 100 },
    { id: 'air',      label: 'Air Quality',  unit: 'PPM', description: 'Trigger ventilation above maximum',       defaultMin: 0,  defaultMax: 150, min: 0, max: 500 },
]

type ApplyStatus = 'idle' | 'sending' | 'applied' | 'error'

export default function AutomationPage() {
    const [values, setValues] = useState<Record<string, { min: number; max: number }>>(
        Object.fromEntries(RULES.map(r => [r.id, { min: r.defaultMin, max: r.defaultMax }]))
    )
    const [status, setStatus] = useState<Record<string, ApplyStatus>>({})

    function update(id: string, field: 'min' | 'max', value: number) {
        setValues(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
        setStatus(prev => ({ ...prev, [id]: 'idle' }))
    }

    async function applyAutomation(rule: Rule) {
        if (!rule.automation) return
        setStatus(prev => ({ ...prev, [rule.id]: 'sending' }))

        const dto = new CommandDtoRequest()
        dto.deviceId = rule.automation.deviceId
        dto.action   = rule.automation.action
        dto.payload  = JSON.stringify({ mode: 'auto', threshold: values[rule.id].max })

        try {
            await api.command.sendCommand(dto)
            setStatus(prev => ({ ...prev, [rule.id]: 'applied' }))
        } catch (err) {
            console.error('Failed to apply automation', err)
            setStatus(prev => ({ ...prev, [rule.id]: 'error' }))
        }
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
                        {r.automation && (
                            <div className={styles.automationRow}>
                                <button
                                    className={styles.applyBtn}
                                    disabled={status[r.id] === 'sending'}
                                    onClick={() => applyAutomation(r)}
                                >
                                    {status[r.id] === 'sending' ? 'Sending…'
                                        : status[r.id] === 'applied' ? '✓ Applied'
                                        : status[r.id] === 'error'   ? 'Retry'
                                        : 'Apply Automation'}
                                </button>
                                {status[r.id] === 'applied' && (
                                    <span className={styles.automationHint}>
                                        Fan auto mode enabled — threshold {values[r.id].max}{r.unit}
                                    </span>
                                )}
                                {status[r.id] === 'error' && (
                                    <span className={styles.automationError}>Failed to send command</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
