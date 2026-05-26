import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'
import { api } from '../api/api'
import { CommandDtoRequest } from '../api/generated/generated-ts-client'
import { useDeviceOverview } from '../hooks/useDeviceOverview'

interface Control { id: string; label: string; description: string; action: string }

const DEVICE_ID = 'esp32-01'

const CONTROLS: Control[] = [
    { id: 'irrigation',  label: 'Irrigation',  description: 'Water pump for plant irrigation',        action: 'pump'   },
    { id: 'ventilation', label: 'Ventilation', description: 'Fans for air circulation',               action: 'fan'    },
]

// Maps action → actuator type from /api/Device/overview
const ACTION_TO_TYPE: Record<string, string> = {
    pump: 'pump',
    fan:  'fan',
}

export default function ControlsPage() {
    const [pending, setPending] = useState<Record<string, boolean>>({})
    const { overview } = useDeviceOverview()

    // Derive active state from server — source of truth
    const device = overview.find(d => d.deviceId === DEVICE_ID)

    function isActive(control: Control): boolean {
        // If we just sent a command, show optimistic state briefly
        if (control.id in pending) return pending[control.id]

        // Otherwise reflect actual server state
        const actuator = device?.actuators.find(
            a => a.type === ACTION_TO_TYPE[control.action]
        )
        return actuator?.on ?? false
    }

    // Clear pending state once server catches up
    useEffect(() => {
        if (!device || Object.keys(pending).length === 0) return

        setPending(prev => {
            const next = { ...prev }
            for (const control of CONTROLS) {
                if (!(control.id in next)) continue
                const actuator = device.actuators.find(
                    a => a.type === ACTION_TO_TYPE[control.action]
                )
                if (actuator && actuator.on === next[control.id]) {
                    delete next[control.id] // server caught up, drop optimistic
                }
            }
            return next
        })
    }, [overview])

    async function toggle(control: Control) {
        const newState = !isActive(control)
        setPending(prev => ({ ...prev, [control.id]: newState }))

        const dto = new CommandDtoRequest()
        dto.deviceId = DEVICE_ID
        dto.action   = control.action
        dto.payload  = newState ? 'on' : 'off'

        try {
            await api.command.sendCommand(dto)
        } catch (err) {
            console.error('Failed to send command', err)
            setPending(prev => ({ ...prev, [control.id]: !newState }))
        }
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Manual Controls</h2>
                <span className={styles.subtitle}>Direct control of greenhouse systems</span>
            </div>
            <div className={styles.grid}>
                {CONTROLS.map(c => {
                    const on = isActive(c)
                    return (
                        <div key={c.id} className={styles.card}>
                            <div className={styles.controlRow}>
                                <div>
                                    <h3 className={styles.cardTitle}>{c.label}</h3>
                                    <p className={styles.placeholder}>{c.description}</p>
                                </div>
                                <button
                                    className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
                                    onClick={() => toggle(c)}
                                    aria-label={`Toggle ${c.label}`}
                                >
                                    {on ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className={`${styles.statusBar} ${on ? styles.statusBarOn : ''}`} />
                        </div>
                    )
                })}
            </div>
        </DashboardLayout>
    )
}