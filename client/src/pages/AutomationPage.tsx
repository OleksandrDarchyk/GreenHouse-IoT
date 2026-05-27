import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'
import { api } from '../api/api'
import { CommandDtoRequest } from '../api/generated/generated-ts-client'

interface AutomationRule {
    id:               string
    label:            string
    sensor:           string
    unit:             string
    triggerWord:      string
    defaultThreshold: number
    min:              number
    max:              number
    deviceId:         string
    action:           string
}

const RULES: AutomationRule[] = [
    {
        id:               'fan',
        label:            'Fan',
        sensor:           'temperature',
        unit:             '°C',
        triggerWord:      'exceeds',
        defaultThreshold: 27,
        min:              0,
        max:              60,
        deviceId:         'esp32-01',
        action:           'fan',
    },
    {
        id:               'pump',
        label:            'Pump',
        sensor:           'soil moisture',
        unit:             '%',
        triggerWord:      'drops below',
        defaultThreshold: 30,
        min:              0,
        max:              100,
        deviceId:         'esp32-01',
        action:           'pump',
    },
]

type ApplyStatus = 'idle' | 'sending' | 'applied' | 'error'

export default function AutomationPage() {
    const [thresholds, setThresholds] = useState<Record<string, number>>(
        Object.fromEntries(RULES.map(r => [r.id, r.defaultThreshold]))
    )
    const [status, setStatus] = useState<Record<string, ApplyStatus>>({})

    async function apply(rule: AutomationRule) {
        setStatus(prev => ({ ...prev, [rule.id]: 'sending' }))

        const dto = new CommandDtoRequest()
        dto.deviceId = rule.deviceId
        dto.action   = rule.action
        dto.payload  = JSON.stringify({ mode: 'auto', threshold: thresholds[rule.id] })

        try {
            await api.command.sendCommand(dto)
            setStatus(prev => ({ ...prev, [rule.id]: 'applied' }))
        } catch {
            setStatus(prev => ({ ...prev, [rule.id]: 'error' }))
        }
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Automation</h2>
                <span className={styles.subtitle}>Set trigger thresholds for automatic control</span>
            </div>

            <div className={styles.list}>
                {RULES.map(r => {
                    const threshold = thresholds[r.id]
                    const s = status[r.id] ?? 'idle'
                    return (
                        <div key={r.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{r.label} Automation</h3>
                            <p className={styles.placeholder}>
                                {r.label} turns on when {r.sensor} {r.triggerWord}{' '}
                                <strong>{threshold}&thinsp;{r.unit}</strong>
                            </p>

                            <div className={styles.thresholds}>
                                <label className={styles.thresholdLabel}>
                                    Trigger threshold
                                    <input
                                        type="number"
                                        className={styles.thresholdInput}
                                        value={threshold}
                                        min={r.min}
                                        max={r.max}
                                        onChange={e => {
                                            setThresholds(prev => ({ ...prev, [r.id]: Number(e.target.value) }))
                                            setStatus(prev => ({ ...prev, [r.id]: 'idle' }))
                                        }}
                                    />
                                    <span className={styles.unit}>{r.unit}</span>
                                </label>
                            </div>

                            <div className={styles.automationRow}>
                                <button
                                    className={styles.applyBtn}
                                    disabled={s === 'sending'}
                                    onClick={() => apply(r)}
                                >
                                    {s === 'sending' ? 'Sending…'
                                     : s === 'applied' ? '✓ Applied'
                                     : s === 'error'   ? 'Retry'
                                     : 'Apply'}
                                </button>

                                {s === 'applied' && (
                                    <span className={styles.automationHint}>
                                        Auto mode on — {r.label} triggers at {threshold}&thinsp;{r.unit}
                                    </span>
                                )}
                                {s === 'error' && (
                                    <span className={styles.automationError}>Failed to send command</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </DashboardLayout>
    )
}
