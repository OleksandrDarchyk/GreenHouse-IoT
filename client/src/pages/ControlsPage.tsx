import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'
import { api } from '../api/api'
import { CommandDtoRequest } from '../api/generated/generated-ts-client'

interface Control { id: string; label: string; description: string; action: string }

const DEVICE_ID = 'esp32-01'

const CONTROLS: Control[] = [
    { id: 'irrigation',  label: 'Irrigation',   description: 'Water pump for plant irrigation',        action: 'pump' },
    { id: 'ventilation', label: 'Ventilation',  description: 'Fans for air circulation',               action: 'fan'  },
    { id: 'lighting',    label: 'Lighting',     description: 'Artificial grow lights',                 action: 'light' },
    { id: 'heating',     label: 'Heating',      description: 'Heating system for temperature control', action: 'heater' },
]

export default function ControlsPage() {
    const [active, setActive] = useState<Record<string, boolean>>({})

    async function toggle(control: Control) {
        const newState = !active[control.id]
        setActive(prev => ({ ...prev, [control.id]: newState }))

        const dto = new CommandDtoRequest()
        dto.deviceId = DEVICE_ID
        dto.action   = control.action
        dto.payload  = newState ? 'on' : 'off'

        try {
            await api.command.sendCommand(dto)
        } catch (err) {
            console.error('Failed to send command', err)
            // revert UI if request failed
            setActive(prev => ({ ...prev, [control.id]: !newState }))
        }
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Manual Controls</h2>
                <span className={styles.subtitle}>Direct control of greenhouse systems</span>
            </div>
            <div className={styles.grid}>
                {CONTROLS.map(c => (
                    <div key={c.id} className={styles.card}>
                        <div className={styles.controlRow}>
                            <div>
                                <h3 className={styles.cardTitle}>{c.label}</h3>
                                <p className={styles.placeholder}>{c.description}</p>
                            </div>
                            <button
                                className={`${styles.toggle} ${active[c.id] ? styles.toggleOn : ''}`}
                                onClick={() => toggle(c)}
                                aria-label={`Toggle ${c.label}`}
                            >
                                {active[c.id] ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <div className={`${styles.statusBar} ${active[c.id] ? styles.statusBarOn : ''}`} />
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
